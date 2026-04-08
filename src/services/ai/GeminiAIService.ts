import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { IAIService } from "./IAIService";
import { AIPrompts } from "./prompts";

/**
 * GeminiAIService - تنفيذ خدمة الذكاء الاصطناعي باستخدام Google Gemini
 * (Encapsulation & Polymorphism)
 * يحقق مبدأ إمكانية الاستبدال (Liskov Substitution)
 */
export class GeminiAIService implements IAIService {
  private ai: GoogleGenAI;
  private modelName: string = "gemini-3-flash-preview";

  /**
   * (Dependency Injection)
   * نمرر الـ API Key لضمان عدم الاعتماد على المتغيرات العالمية مباشرة داخل الكلاس
   */
  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Gemini API Key is required for AIService");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeAd(description: string, professions: string[]): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: AIPrompts.analyzeAd(description, professions)
    });
    return response.text || "عذراً، لم أتمكن من تحليل الإعلان حالياً.";
  }

  async smartSearch(query: string, professions: string[], neighborhoods: string[]): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      config: { responseMimeType: "application/json" },
      contents: AIPrompts.smartSearch(query, professions, neighborhoods)
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { profession: "الكل", neighborhood: "الكل", type: "offer", is_urgent: false };
    }
  }

  async generateAdminReport(recentAds: any[]): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: AIPrompts.adminReport(recentAds)
    });
    return response.text || "لا يمكن توليد التقرير حالياً.";
  }

  async analyzeForumPost(content: string, professions: string[], neighborhoods: string[]): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      config: { responseMimeType: "application/json" },
      contents: AIPrompts.forumAnalysis(content, professions, neighborhoods)
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { is_service_request: false };
    }
  }

  async analyzeID(base64Image: string): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: this.modelName,
      config: { responseMimeType: "application/json" },
      contents: [
        {
          role: "user",
          parts: [
            { text: AIPrompts.idAnalysis() },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ]
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { is_valid: false, error: "Failed to parse ID" };
    }
  }
}

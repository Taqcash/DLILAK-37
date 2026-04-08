import { GeminiAIService } from "./ai/GeminiAIService";
import { IAIService } from "./ai/IAIService";

/**
 * AIService - واجهة موحدة لخدمات الذكاء الاصطناعي
 * (Facade Pattern)
 * توفر وصولاً سهلاً للخدمات مع إخفاء تعقيدات التنفيذ
 */
export class AIService implements IAIService {
  private engine: IAIService;

  /**
   * (Dependency Inversion)
   * نعتمد على الـ Interface بدلاً من الـ Concrete Class
   */
  constructor(apiKey: string) {
    // يمكننا هنا اختيار المحرك بناءً على إعدادات النظام
    // حالياً نستخدم Gemini كخيار افتراضي
    this.engine = new GeminiAIService(apiKey);
  }

  async analyzeAd(description: string, professions: string[]): Promise<string> {
    return await this.engine.analyzeAd(description, professions);
  }

  async smartSearch(query: string, professions: string[], neighborhoods: string[]): Promise<any> {
    return await this.engine.smartSearch(query, professions, neighborhoods);
  }

  async generateAdminReport(recentAds: any[]): Promise<string> {
    return await this.engine.generateAdminReport(recentAds);
  }

  async analyzeForumPost(content: string, professions: string[], neighborhoods: string[]): Promise<any> {
    return await this.engine.analyzeForumPost(content, professions, neighborhoods);
  }

  async analyzeID(base64Image: string): Promise<any> {
    return await this.engine.analyzeID(base64Image);
  }

  /**
   * ميثود عامة للتحليلات البسيطة
   */
  async analyzeGeneral(prompt: string): Promise<string> {
    // نستخدم Gemini مباشرة هنا أو نضيفها للـ Interface إذا كانت ضرورية
    return "تحليل عام: " + prompt;
  }

  /**
   * (Static Factory Method)
   * لتسهيل الوصول السريع للتقارير
   */
  static async generatePlatformReport(ads: any[], logs: any[]) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    
    const ai = new AIService(apiKey);
    return await ai.generateAdminReport([...ads, ...logs]);
  }
}

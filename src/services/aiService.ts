import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async analyzeAd(description: string, professions: string[]): Promise<string> {
    if (!this.ai) throw new Error("API Key required");
    
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        أنت "طبيب الإعلانات" (Ad Doctor) لمنصة "دليل خدمتك" في بورتسودان.
        قم بتحليل وصف الإعلان التالي وقدم نصائح لتحسينه لزيادة المبيعات والثقة.
        وصف الإعلان: "${description}"
        
        المهن المتاحة: ${professions.join(', ')}
        
        قدم تقريراً باللغة العربية يشمل:
        1. نقاط القوة.
        2. نقاط الضعف (مثلاً: نقص السعر، نقص الخبرة، نقص الضمانات).
        3. اقتراح لوصف أفضل وأكثر احترافية.
        4. تقييم نهائي من 10.
        
        استخدم لغة مشجعة ومهنية.
      `
    });
    
    return response.text || "عذراً، لم أتمكن من تحليل الإعلان حالياً.";
  }

  async smartSearch(query: string, professions: string[], neighborhoods: string[]): Promise<any> {
    if (!this.ai) throw new Error("API Key required");

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json"
      },
      contents: `
        Analyze this search query for services in Port Sudan.
        Query: "${query}"
        
        Extract the following as JSON:
        - profession: (one of: ${professions.join(', ')}) or "الكل"
        - neighborhood: (one of: ${neighborhoods.join(', ')}) or "الكل"
        - type: "offer" (if looking for a provider) or "request" (if looking for a job/service needed)
        - is_urgent: boolean
        
        Return only the JSON.
      `
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { profession: "الكل", neighborhood: "الكل", type: "offer", is_urgent: false };
    }
  }

  async generateAdminReport(recentAds: any[]): Promise<string> {
    if (!this.ai) throw new Error("API Key required");

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        أنت مساعد إداري ذكي لمنصة "دليل خدمتك" في بورتسودان. 
        قم بتحليل البيانات التالية للإعلانات الأخيرة وقدم تقريراً استراتيجياً للإدارة يشمل:
        1. ملخص النشاط (عروض vs طلبات).
        2. تحليل المهن الأكثر نشاطاً والأحياء الأكثر طلباً.
        3. رصد أي اتجاهات (Trends) جديدة في سوق العمل المحلي.
        4. توصيات لتحسين تجربة المستخدم وزيادة التفاعل.
        
        البيانات: ${JSON.stringify(recentAds)}
        
        اجعل التقرير مهنياً، ملهماً، وباللغة العربية.
      `
    });

    return response.text || "لا يمكن توليد التقرير حالياً.";
  }

  async analyzeForumPost(content: string, professions: string[], neighborhoods: string[]): Promise<any> {
    if (!this.ai) throw new Error("API Key required");

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        responseMimeType: "application/json"
      },
      contents: `
        Analyze this forum post from Port Sudan community.
        Post: "${content}"
        
        Extract as JSON:
        - is_service_request: boolean (is the user asking for a specific service?)
        - profession: (one of: ${professions.join(', ')}) or null
        - neighborhood: (one of: ${neighborhoods.join(', ')}) or null
        - urgency_level: "low", "medium", "high"
        
        Return only the JSON.
      `
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { is_service_request: false };
    }
  }

  async analyzeGeneral(prompt: string): Promise<string> {
    if (!this.ai) throw new Error("API Key required");

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text || "عذراً، لم أتمكن من التحليل حالياً.";
  }
}

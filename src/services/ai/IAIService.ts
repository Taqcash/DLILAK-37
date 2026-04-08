/**
 * IAIService - العقد البرمجي لخدمات الذكاء الاصطناعي
 * (Abstraction)
 * يسمح بتبديل محرك الذكاء الاصطناعي (Gemini, OpenAI, etc) بسهولة
 */
export interface IAIService {
  analyzeAd(description: string, professions: string[]): Promise<string>;
  smartSearch(query: string, professions: string[], neighborhoods: string[]): Promise<any>;
  generateAdminReport(recentAds: any[]): Promise<string>;
  analyzeForumPost(content: string, professions: string[], neighborhoods: string[]): Promise<any>;
  analyzeID(base64Image: string): Promise<any>;
}

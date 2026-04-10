import { api } from './api';

/**
 * AIService - التعامل مع خدمات الذكاء الاصطناعي عبر Cloudflare Worker
 */
export class AIService {
  /**
   * البحث الذكي - تحليل استعلام المستخدم لاستخراج الفلاتر
   */
  static async smartSearch(query: string) {
    try {
      const response = await api.post('/ai/smart-search', { query });
      return response.data;
    } catch (error) {
      console.error('AI Smart Search Error:', error);
      return null;
    }
  }

  /**
   * تحليل إيصال الدفع ذكياً
   */
  static async verifySlip(imageUrl: string) {
    try {
      const response = await api.post('/wallet/ai/verify-slip', { image_url: imageUrl });
      return response.data;
    } catch (error) {
      console.error('AI Slip Verification Error:', error);
      return { error: 'فشل في تحليل الإيصال' };
    }
  }
}

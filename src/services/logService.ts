import { supabase } from '../lib/supabase';

/**
 * LogService - موديل سجلات النظام
 * مسؤول عن تسجيل تفاعلات الذكاء الاصطناعي والنشاطات
 */
export class LogService {
  static async logAIInteraction(userId: string, feature: string, input: string, output: string) {
    return await supabase.from('ai_logs').insert({
      user_id: userId,
      feature,
      input,
      output
    });
  }

  static async fetchUserLogs(userId: string) {
    return await supabase
      .from('ai_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }
}

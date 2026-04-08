import { supabase } from '../lib/supabase';
import { Notification } from '../types';

/**
 * NotificationService - موديل الإشعارات
 * مسؤول عن إرسال وجلب التنبيهات
 */
export class NotificationService {
  static async fetchNotifications(userId: string) {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<Notification[]>();
  }

  static async createNotification(userId: string, title: string, message: string) {
    return await supabase.from('notifications').insert({ user_id: userId, title, message });
  }

  /**
   * subscribeToNotifications - الاشتراك اللحظي في التنبيهات
   */
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id.eq.${userId}`
      }, callback)
      .subscribe();
  }
}

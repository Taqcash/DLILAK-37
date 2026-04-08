import { supabase } from '../lib/supabase';

/**
 * AdminService - موديل خدمات الإدارة
 * مسؤول عن مراسلة الإدارة والتحكم في المحتوى
 */
export class AdminService {
  static async createAdminMessage(userId: string, message: string) {
    return await supabase.from('admin_messages').insert({
      user_id: userId,
      message,
      status: 'unread'
    });
  }

  static async fetchAdminMessages() {
    return await supabase
      .from('admin_messages')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
  }
}

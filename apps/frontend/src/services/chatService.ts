import { supabase } from '../lib/supabase';
import { Message } from 'shared-types';

/**
 * ChatService - موديل الدردشة والرسائل اللحظية
 * مسؤول عن إرسال وجلب الرسائل
 */
export class ChatService {
  static async fetchMessages(userId: string, otherId: string) {
    return await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .returns<Message[]>();
  }

  static async sendMessage(senderId: string, receiverId: string, content: string) {
    return await supabase.from('messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content
    }).select().single<Message>();
  }

  static async fetchChatList(userId: string) {
    const { data } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (!data) return [];

    const chats = new Map();
    data.forEach(msg => {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!chats.has(otherId)) {
        chats.set(otherId, msg);
      }
    });

    return Array.from(chats.entries());
  }

  /**
   * subscribeToMessages - الاشتراك اللحظي في الرسائل
   */
  static subscribeToMessages(userId: string, otherId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${userId}:${otherId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId}))`
      }, callback)
      .subscribe();
  }
}

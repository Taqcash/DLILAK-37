import { useState, useEffect, useCallback } from 'react';
import { ChatService } from '@/services/chatService';
import { Message } from 'shared-types';
import { supabase } from '@/lib/supabase';

/**
 * useChat - هوك مخصص لإدارة الدردشة اللحظية
 * يغلف منطق الاشتراك والرسائل
 */
export function useChat(userId: string | undefined, otherId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await ChatService.fetchMessages(userId, otherId);
    if (data) setMessages(data);
    setLoading(false);
  }, [userId, otherId]);

  useEffect(() => {
    if (!userId) return;

    loadMessages();

    // الاشتراك اللحظي بنمط Claw
    const subscription = ChatService.subscribeToMessages(userId, otherId, (payload) => {
      setMessages(prev => [...prev, payload.new as Message]);
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, otherId, loadMessages]);

  const sendMessage = async (content: string) => {
    if (!userId || !content.trim()) return;
    return await ChatService.sendMessage(userId, otherId, content);
  };

  return { messages, loading, sendMessage, reload: loadMessages };
}

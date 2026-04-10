import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

/**
 * useChat - هوك مخصص لإدارة المحادثات
 */
export function useChat(userId: string | undefined, otherId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/chat/${otherId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, otherId]);

  useEffect(() => {
    fetchMessages();
    
    // في Cloudflare Workers، يمكن استخدام Durable Objects أو Server-Sent Events للـ Real-time
    // هسة حا نستخدم Polling بسيط كبداية
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async (content: string) => {
    try {
      const response = await api.post(`/chat/${otherId}`, { content });
      setMessages(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return { messages, loading, sendMessage, refresh: fetchMessages };
}

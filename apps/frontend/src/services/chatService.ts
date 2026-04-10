import { api } from './api';
import { Message } from 'shared-types';

export class WorkerChatService {
  async fetchMessages(chatId: string): Promise<Message[]> {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await api.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  }
}

export const ChatService = new WorkerChatService();

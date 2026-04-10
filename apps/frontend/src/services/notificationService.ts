import { api } from './api';
import { Notification } from 'shared-types';

export class WorkerNotificationService {
  async fetchNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data;
  }

  async createNotification(userId: string, title: string, message: string): Promise<Notification> {
    const response = await api.post('/notifications', { userId, title, message });
    return response.data;
  }
}

export const NotificationService = new WorkerNotificationService();

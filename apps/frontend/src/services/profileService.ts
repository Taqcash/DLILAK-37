import { api } from './api';
import { Profile } from 'shared-types';

export class WorkerProfileService {
  async getProfile(userId: string): Promise<Profile> {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const response = await api.put(`/profiles/${userId}`, data);
    return response.data;
  }

  async verifyFieldVisit(userId: string): Promise<void> {
    await api.post(`/profiles/${userId}/verify-field`);
  }
}

export const ProfileService = new WorkerProfileService();

import { api } from './api';
import { Ad } from 'shared-types';

export interface AdFilters {
  page?: number;
  limit?: number;
  type?: string;
  profession?: string;
  neighborhood?: string;
  status?: string;
}

/**
 * WorkerAdService - تنفيذ خدمة الإعلانات باستخدام Cloudflare Worker
 * (Clean Architecture)
 */
export class WorkerAdService {
  async fetchAds(filters: AdFilters): Promise<Ad[]> {
    const response = await api.get('/ads', { params: filters });
    return response.data;
  }

  async getAd(id: string): Promise<Ad> {
    const response = await api.get(`/ads/${id}`);
    return response.data;
  }

  async createAd(data: Partial<Ad>): Promise<Ad> {
    const response = await api.post('/ads', data);
    return response.data;
  }

  async updateAd(id: string, data: Partial<Ad>): Promise<Ad> {
    const response = await api.put(`/ads/${id}`, data);
    return response.data;
  }

  async deleteAd(id: string): Promise<void> {
    await api.delete(`/ads/${id}`);
  }
}

export const AdService = new WorkerAdService();

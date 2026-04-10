import { api } from './api';
import { Rating } from 'shared-types';

export class WorkerRatingService {
  async fetchRatings(adId: string): Promise<Rating[]> {
    const response = await api.get(`/ads/${adId}/ratings`);
    return response.data;
  }

  async addRating(adId: string, rating: number, comment: string): Promise<Rating> {
    const response = await api.post(`/ads/${adId}/ratings`, { rating, comment });
    return response.data;
  }
}

export const RatingService = new WorkerRatingService();

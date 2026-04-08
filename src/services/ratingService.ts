import { supabase } from '../lib/supabase';
import { Rating } from '../types';
import { NotificationService } from './notificationService';

/**
 * RatingService - موديل التقييمات
 * مسؤول عن جلب وإضافة التقييمات
 */
export class RatingService {
  static async fetchRatings(adId: string) {
    return await supabase
      .from('ratings')
      .select('*, profiles(full_name, avatar_url)')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false })
      .returns<Rating[]>();
  }

  static async addRating(adId: string, userId: string, rating: number, comment: string) {
    // 1. Insert rating
    const { error: ratingError } = await supabase.from('ratings').insert({
      ad_id: adId,
      user_id: userId,
      rating,
      comment
    });

    if (ratingError) throw ratingError;

    // 2. Recalculate average rating for the ad
    const { data: ad } = await supabase.from('ads').select('user_id, title').eq('id', adId).single();
    const { data: allRatings } = await supabase.from('ratings').select('rating').eq('id', adId);
    
    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      await supabase.from('ads').update({ avg_rating: avg }).eq('id', adId);
    }

    // 3. Notify ad owner
    if (ad && ad.user_id !== userId) {
      await NotificationService.createNotification(ad.user_id, 'تقييم جديد!', `لقد حصل إعلانك "${ad.title}" على تقييم جديد (${rating} نجوم).`);
    }
  }
}

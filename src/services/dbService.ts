import { supabase } from '../lib/supabase';

export class DBService {
  // --- Profiles ---
  static async getProfile(userId: string) {
    return await supabase.from('profiles').select('*').eq('id', userId).single();
  }

  static async updateProfile(userId: string, data: any) {
    return await supabase.from('profiles').update(data).eq('id', userId);
  }

  static async syncProfile(user: any) {
    if (!user) return null;
    
    const { data: profile, error } = await this.getProfile(user.id);

    if (error && error.code === 'PGRST116') {
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          fullName: user.fullName || user.username || 'مستخدم جديد',
          avatar_url: user.imageUrl,
          email: user.primaryEmailAddress?.emailAddress,
          role: 'user',
          points: 100
        })
        .select()
        .single();
      return newProfile;
    }
    return profile;
  }

  // --- Ads ---
  static async fetchAds(filters: { type?: string, profession?: string, neighborhood?: string, is_productive?: boolean, is_training?: boolean, status?: string }) {
    let query = supabase
      .from('ads')
      .select('*, profiles(fullName, avatar_url, is_verified, is_field_verified)')
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.profession && filters.profession !== 'الكل') query = query.eq('profession', filters.profession);
    if (filters.neighborhood && filters.neighborhood !== 'الكل') query = query.eq('neighborhood', filters.neighborhood);
    if (filters.is_productive) query = query.eq('is_productive', true);
    if (filters.is_training) query = query.eq('is_training', true);
    if (filters.status) query = query.eq('status', filters.status);

    return await query;
  }

  static async getAd(id: string) {
    return await supabase
      .from('ads')
      .select('*, profiles(fullName, avatar_url, is_verified, is_field_verified)')
      .eq('id', id)
      .single();
  }

  static async createAd(data: any) {
    return await supabase.from('ads').insert(data).select().single();
  }

  static async deleteAd(id: string) {
    return await supabase.from('ads').delete().eq('id', id);
  }

  // --- Ratings ---
  static async fetchRatings(adId: string) {
    return await supabase
      .from('ratings')
      .select('*, profiles(fullName, avatar_url)')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false });
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
    const { data: allRatings } = await supabase.from('ratings').select('rating').eq('ad_id', adId);
    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      await supabase.from('ads').update({ avg_rating: avg }).eq('id', adId);
    }
  }

  // --- Forum ---
  static async fetchForumPosts() {
    return await supabase
      .from('forum_posts')
      .select('*, profiles(fullName, avatar_url, is_verified)')
      .order('created_at', { ascending: false });
  }

  static async createForumPost(userId: string, content: string) {
    return await supabase.from('forum_posts').insert({ user_id: userId, content }).select().single();
  }

  // --- Notifications ---
  static async fetchNotifications(userId: string) {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  static async createNotification(userId: string, title: string, message: string) {
    return await supabase.from('notifications').insert({ user_id: userId, title, message });
  }

  // --- Storage ---
  static async uploadImage(bucket: string, file: File, path: string) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  }

  // --- Dynamic Data ---
  static async getNeighborhoods() {
    return await supabase.from('neighborhoods').select('name').order('name');
  }

  static async getProfessions() {
    return await supabase.from('professions').select('name').order('name');
  }

  static async getSiteImages() {
    return await supabase.from('site_images').select('*');
  }

  // --- Logs ---
  static async logAIInteraction(userId: string, feature: string, prompt: string, response: string) {
    return await supabase.from('ai_logs').insert({
      user_id: userId,
      feature,
      prompt,
      response
    });
  }

  static async getAnalyticsData() {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: adsCount } = await supabase.from('ads').select('*', { count: 'exact', head: true });
    const { count: forumCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true });
    
    // Fetch ads by category for pie chart
    const { data: adsByCategory } = await supabase.from('ads').select('profession');
    
    // Fetch user growth (simulated for now by created_at)
    const { data: userGrowth } = await supabase.from('profiles').select('created_at').order('created_at');

    return {
      stats: {
        users: usersCount || 0,
        ads: adsCount || 0,
        posts: forumCount || 0,
        revenue: (adsCount || 0) * 150 // Simulated revenue
      },
      adsByCategory: adsByCategory || [],
      userGrowth: userGrowth || []
    };
  }
}

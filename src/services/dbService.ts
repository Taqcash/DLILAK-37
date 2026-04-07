import { supabase } from '../lib/supabase';
import { Profile, Ad, Rating, ForumPost, Notification, AdminMessage, FieldVisitRequest, Message } from '../types';

export class DBService {
  // --- Profiles ---
  static async getProfile(userId: string) {
    return await supabase.from('profiles').select('*').eq('id', userId).single<Profile>();
  }

  static async updateProfile(userId: string, data: Partial<Profile>) {
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
        .single<Profile>();
      return newProfile;
    }
    return profile;
  }

  // --- Ads ---
  static async fetchAds(filters: { type?: string, profession?: string, neighborhood?: string, is_productive?: boolean, is_training?: boolean, status?: string, page?: number, limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('ads')
      .select('*, profiles(fullName, avatar_url, is_verified, is_field_verified)', { count: 'exact' })
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.profession && filters.profession !== 'الكل') query = query.eq('profession', filters.profession);
    if (filters.neighborhood && filters.neighborhood !== 'الكل') query = query.eq('neighborhood', filters.neighborhood);
    if (filters.is_productive) query = query.eq('is_productive', true);
    if (filters.is_training) query = query.eq('is_training', true);
    if (filters.status) query = query.eq('status', filters.status);

    return await query.returns<Ad[]>();
  }

  static async getAd(id: string) {
    return await supabase
      .from('ads')
      .select('*, profiles(fullName, avatar_url, is_verified, is_field_verified)')
      .eq('id', id)
      .single<Ad>();
  }

  static async createAd(data: Partial<Ad>) {
    return await supabase.from('ads').insert(data).select().single<Ad>();
  }

  static async updateAd(id: string, data: Partial<Ad>) {
    return await supabase.from('ads').update(data).eq('id', id).select().single<Ad>();
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
      await this.createNotification(ad.user_id, 'تقييم جديد!', `لقد حصل إعلانك "${ad.title}" على تقييم جديد (${rating} نجوم).`);
    }
  }

  // --- Forum ---
  static async fetchForumPosts() {
    return await supabase
      .from('forum_posts')
      .select('*, profiles(fullName, avatar_url, is_verified)')
      .order('created_at', { ascending: false })
      .returns<ForumPost[]>();
  }

  static async createForumPost(userId: string, content: string) {
    return await supabase.from('forum_posts').insert({ user_id: userId, content }).select().single<ForumPost>();
  }

  static async incrementPoints(userId: string, amount: number) {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single<Profile>();
    const currentPoints = profile?.points || 0;
    return await supabase.from('profiles').update({ points: currentPoints + amount }).eq('id', userId);
  }

  // --- Admin Messages ---
  static async createAdminMessage(userId: string, message: string) {
    return await supabase.from('admin_messages').insert({
      user_id: userId,
      message,
      status: 'unread'
    });
  }

  // --- Field Visits ---
  static async requestFieldVisit(userId: string) {
    return await supabase.from('field_visit_requests').insert({
      user_id: userId,
      status: 'pending'
    });
  }

  // --- Notifications ---
  static async fetchNotifications(userId: string) {
    return await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<Notification[]>();
  }

  static async createNotification(userId: string, title: string, message: string) {
    return await supabase.from('notifications').insert({ user_id: userId, title, message });
  }

  // --- Chat & Messaging ---
  static async fetchMessages(userId: string, otherId: string) {
    return await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .returns<Message[]>();
  }

  static async sendMessage(senderId: string, receiverId: string, content: string) {
    const { data: sender } = await this.getProfile(senderId);
    const { data: msg, error } = await supabase.from('messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content
    }).select().single<Message>();

    if (!error && msg) {
      await this.createNotification(receiverId, 'رسالة جديدة!', `لقد وصلتك رسالة جديدة من ${sender?.fullName || 'مستخدم'}: "${content.substring(0, 30)}..."`);
    }
    return { data: msg, error };
  }

  static async fetchChatList(userId: string) {
    // This is a bit complex in Supabase without a custom RPC, but we can fetch all messages and group them
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

  // --- Admin Methods ---
  static async fetchFieldVisitRequests() {
    return await supabase
      .from('field_visit_requests')
      .select('*, profiles(fullName, avatar_url, neighborhood, phone)')
      .order('created_at', { ascending: false })
      .returns<FieldVisitRequest[]>();
  }

  static async updateFieldVisitStatus(requestId: string, userId: string, status: 'approved' | 'rejected') {
    // 1. Update request status
    const { error: requestError } = await supabase
      .from('field_visit_requests')
      .update({ status })
      .eq('id', requestId);
    
    if (requestError) throw requestError;

    // 2. If approved, update profile field_verified status
    if (status === 'approved') {
      await supabase.from('profiles').update({ is_field_verified: true }).eq('id', userId);
      await this.createNotification(userId, 'تم توثيقك ميدانياً!', 'تهانينا، لقد تم التحقق من جودة خدماتك ميدانياً وظهور شارة التوثيق الميداني في ملفك.');
    }
  }

  static async fetchVerificationRequests() {
    return await supabase
      .from('profiles')
      .select('*')
      .not('verification_image', 'is', null)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .returns<Profile[]>();
  }

  static async approveVerification(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId);
    
    if (error) throw error;
    await this.createNotification(userId, 'تم توثيق حسابك!', 'تهانينا، لقد تم التحقق من مستنداتك وظهور شارة التوثيق في ملفك الشخصي.');
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

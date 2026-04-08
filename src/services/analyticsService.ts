import { supabase } from '../lib/supabase';

/**
 * AnalyticsService - موديل تحليلات المنصة
 * مسؤول عن جلب الإحصائيات والبيانات الضخمة
 */
export class AnalyticsService {
  static async getAnalyticsData() {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: adsCount } = await supabase.from('ads').select('*', { count: 'exact', head: true });
    const { count: postsCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true });

    const { data: adsByCategory } = await supabase.from('ads').select('profession');
    const { data: userGrowth } = await supabase.from('profiles').select('created_at');

    return {
      stats: {
        users: usersCount || 0,
        ads: adsCount || 0,
        posts: postsCount || 0,
        revenue: (adsCount || 0) * 50 // تقديري
      },
      adsByCategory: adsByCategory || [],
      userGrowth: userGrowth || []
    };
  }
}

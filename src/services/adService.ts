import { supabase } from '../lib/supabase';
import { Ad } from '../types';

/**
 * AdService - موديل إدارة الإعلانات
 * مسؤول فقط عن جلب وتعديل وحذف الإعلانات
 */
export class AdService {
  static async fetchAds(filters: any) {
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
}

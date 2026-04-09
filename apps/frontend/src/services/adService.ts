import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultSupabase } from '../lib/supabase';
import { Ad } from 'shared-types';

/**
 * IAdService - العقد البرمجي لإدارة الإعلانات
 * (Abstraction)
 * يحدد العمليات الأساسية دون الدخول في تفاصيل التنفيذ
 */
export interface IAdService {
  fetchAds(filters: AdFilters): Promise<{ data: Ad[] | null; count: number | null; error: any }>;
  getAd(id: string): Promise<{ data: Ad | null; error: any }>;
  createAd(data: Partial<Ad>): Promise<{ data: Ad | null; error: any }>;
  updateAd(id: string, data: Partial<Ad>): Promise<{ data: Ad | null; error: any }>;
  deleteAd(id: string): Promise<{ error: any }>;
}

export interface AdFilters {
  page?: number;
  limit?: number;
  type?: string;
  profession?: string;
  neighborhood?: string;
  status?: string;
}

/**
 * SupabaseAdService - تنفيذ خدمة الإعلانات باستخدام Supabase
 * (Encapsulation & SRP)
 * يحقق مبدأ المسؤولية الواحدة بالتعامل مع قاعدة البيانات فقط
 */
export class SupabaseAdService implements IAdService {
  private client: SupabaseClient;

  /**
   * (Dependency Injection)
   * نمرر الـ client عبر الـ constructor بدلاً من استخدامه مباشرة
   * ده بيسهل لينا الـ Testing والـ Mocking لاحقاً
   */
  constructor(client: SupabaseClient = defaultSupabase) {
    this.client = client;
  }

  /**
   * جلب الإعلانات مع الفلترة والترتيب
   * (Abstraction)
   * التفاصيل المعقدة للـ Query مخفية داخل الميثود
   */
  async fetchAds(filters: AdFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.client
      .from('ads')
      .select('*, profiles(full_name, avatar_url, is_verified, is_field_verified)', { count: 'exact' })
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters.type) query = query.eq('type', filters.type);
    if (filters.profession && filters.profession !== 'الكل') query = query.eq('profession', filters.profession);
    if (filters.neighborhood && filters.neighborhood !== 'الكل') query = query.eq('neighborhood', filters.neighborhood);
    if (filters.status) query = query.eq('status', filters.status);

    return await query.returns<Ad[]>();
  }

  async getAd(id: string) {
    return await this.client
      .from('ads')
      .select('*, profiles(full_name, avatar_url, is_verified, is_field_verified)')
      .eq('id', id)
      .single<Ad>();
  }

  async createAd(data: Partial<Ad>) {
    return await this.client.from('ads').insert(data).select().single<Ad>();
  }

  async updateAd(id: string, data: Partial<Ad>) {
    return await this.client.from('ads').update(data).eq('id', id).select().single<Ad>();
  }

  async deleteAd(id: string) {
    return await this.client.from('ads').delete().eq('id', id);
  }
}

// تصدير نسخة افتراضية للحفاظ على التوافق مع الكود القديم
// (Singleton Pattern)
export const adService = new SupabaseAdService();
export const AdService = adService; // Alias for backward compatibility

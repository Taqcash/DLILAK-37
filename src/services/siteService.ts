import { supabase } from '../lib/supabase';

/**
 * SiteService - موديل بيانات الموقع العامة
 * مسؤول عن جلب الأحياء والمهن والصور الثابتة
 */
export class SiteService {
  static async getNeighborhoods() {
    return await supabase.from('neighborhoods').select('name').order('name');
  }

  static async getProfessions() {
    return await supabase.from('professions').select('name').order('name');
  }

  static async getSiteImages() {
    return await supabase.from('site_images').select('key, url');
  }
}

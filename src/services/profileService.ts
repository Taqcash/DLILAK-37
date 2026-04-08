import { supabase } from '../lib/supabase';
import { Profile, FieldVisitRequest } from '../types';

/**
 * ProfileService - موديل إدارة المستخدمين والتوثيق
 * مسؤول عن الملف الشخصي، النقاط، والتوثيق الميداني
 */
export class ProfileService {
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

  static async incrementPoints(userId: string, amount: number) {
    const { data: profile } = await this.getProfile(userId);
    const currentPoints = profile?.points || 0;
    return await supabase.from('profiles').update({ points: currentPoints + amount }).eq('id', userId);
  }

  // --- التوثيق الميداني ---
  static async requestFieldVisit(userId: string) {
    return await supabase.from('field_visit_requests').insert({
      user_id: userId,
      status: 'pending'
    });
  }

  static async fetchFieldVisitRequests() {
    return await supabase
      .from('field_visit_requests')
      .select('*, profiles(fullName, avatar_url, neighborhood, phone)')
      .order('created_at', { ascending: false })
      .returns<FieldVisitRequest[]>();
  }

  static async updateFieldVisitStatus(requestId: string, userId: string, status: 'approved' | 'rejected') {
    const { error: requestError } = await supabase
      .from('field_visit_requests')
      .update({ status })
      .eq('id', requestId);
    
    if (requestError) throw requestError;

    if (status === 'approved') {
      await supabase.from('profiles').update({ is_field_verified: true }).eq('id', userId);
    }
  }
}

import { supabase } from '../lib/supabase';
import { ForumPost } from '../types';

/**
 * ForumService - موديل المنتدى
 * مسؤول عن جلب وإضافة المنشورات
 */
export class ForumService {
  static async fetchForumPosts() {
    return await supabase
      .from('forum_posts')
      .select('*, profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .returns<ForumPost[]>();
  }

  static async createForumPost(userId: string, content: string) {
    return await supabase.from('forum_posts').insert({
      user_id: userId,
      content
    }).select().single<ForumPost>();
  }
}

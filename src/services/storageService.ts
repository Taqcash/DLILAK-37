import { supabase } from '../lib/supabase';

/**
 * StorageService - موديل إدارة الملفات والصور
 * مسؤول عن الرفع والحذف من Supabase Storage
 */
export class StorageService {
  static async uploadImage(bucket: string, file: File, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  static async uploadFile(bucket: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) return { data: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { data: { publicUrl }, error: null };
  }
}

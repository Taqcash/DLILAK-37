/**
 * StorageService - موديل إدارة الملفات والصور
 * مسؤول عن الرفع والحذف من Supabase Storage
 */
export class StorageService {
  static async uploadImage(bucket: string, file: File, path: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', bucket);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  }

  static async uploadFile(bucket: string, file: File) {
    try {
      const url = await this.uploadImage(bucket, file, '');
      return { data: { publicUrl: url }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }
}

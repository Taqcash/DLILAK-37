import { ImageService as ImageServiceClass } from "./image/IImageService";
import { GeminiImageGenerator, CloudinaryUploader } from "./image/ImageImplementations";

/**
 * ImageService - واجهة موحدة لإدارة الصور
 * (Facade Pattern)
 * توفر وصولاً سهلاً للتوليد والرفع مع الحفاظ على استقلالية المكونات
 */
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const generator = new GeminiImageGenerator(apiKey);
const uploader = new CloudinaryUploader();

// (Singleton Instance)
export const imageService = new ImageServiceClass(generator, uploader);

/**
 * الدوال المصدرة للحفاظ على التوافق مع الكود القديم
 * (Backward Compatibility)
 */
export async function generatePortSudanImages() {
  return await imageService.generatePortSudanImages();
}

export async function uploadToCloudinary(file: File): Promise<string> {
  return await imageService.upload(file);
}

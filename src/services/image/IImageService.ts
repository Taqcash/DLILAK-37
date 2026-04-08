/**
 * IImageGenerator - العقد البرمجي لتوليد الصور
 * (Abstraction)
 */
export interface IImageGenerator {
  generatePortSudanImages(): Promise<{ mainImage: string; aboutImage: string }>;
}

/**
 * IImageUploader - العقد البرمجي لرفع الصور
 * (Abstraction)
 */
export interface IImageUploader {
  upload(file: File): Promise<string>;
}

/**
 * ImageService - الخدمة الموحدة لإدارة الصور
 * (Facade & SRP)
 * تجمع بين التوليد والرفع في واجهة واحدة سهلة الاستخدام
 */
export class ImageService {
  private generator: IImageGenerator;
  private uploader: IImageUploader;

  /**
   * (Dependency Injection)
   * نمرر المحركات عبر الـ Constructor لضمان المرونة
   */
  constructor(generator: IImageGenerator, uploader: IImageUploader) {
    this.generator = generator;
    this.uploader = uploader;
  }

  async generatePortSudanImages() {
    return await this.generator.generatePortSudanImages();
  }

  async upload(file: File) {
    return await this.uploader.upload(file);
  }
}

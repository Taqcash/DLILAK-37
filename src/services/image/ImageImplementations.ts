import { GoogleGenAI } from "@google/genai";
import { IImageGenerator, IImageUploader } from "./IImageService";

/**
 * GeminiImageGenerator - تنفيذ توليد الصور باستخدام Gemini
 * (Encapsulation)
 */
export class GeminiImageGenerator implements IImageGenerator {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("Gemini API Key is required for Image Generation");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generatePortSudanImages() {
    const mainPrompt = "A high-quality, vibrant panoramic view of Port Sudan city. On the right, the deep blue Red Sea with ships and port cranes. On the left and background, a continuous range of rugged brown mountains (Red Sea Hills). In the foreground, people in traditional Sudanese dress: men in white jalabiyas and black vests with turbans, and women in colorful patterned toubs. Cinematic lighting, realistic style.";
    const aboutPrompt = "A scenic landscape of Arbaat Dam in Port Sudan, Sudan. The dam is nestled between high, rugged desert mountains. A small patch of green agriculture is visible near the water. Traditional Sudanese men with 'Khalal' combs in their curly hair are walking nearby. Serene atmosphere, high resolution.";

    const [mainResponse, aboutResponse] = await Promise.all([
      this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: mainPrompt }] }
      }),
      this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: aboutPrompt }] }
      })
    ]);

    let mainImage = "";
    let aboutImage = "";

    const mainParts = mainResponse.candidates?.[0]?.content?.parts || [];
    for (const part of mainParts) {
      if (part.inlineData) mainImage = `data:image/png;base64,${part.inlineData.data}`;
    }

    const aboutParts = aboutResponse.candidates?.[0]?.content?.parts || [];
    for (const part of aboutParts) {
      if (part.inlineData) aboutImage = `data:image/png;base64,${part.inlineData.data}`;
    }

    return { mainImage, aboutImage };
  }
}

/**
 * CloudinaryUploader - تنفيذ رفع الصور باستخدام Cloudinary
 * (Encapsulation)
 */
export class CloudinaryUploader implements IImageUploader {
  async upload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  }
}

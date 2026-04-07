import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY!
});

export async function generatePortSudanImages() {
  const mainPrompt = "A high-quality, vibrant panoramic view of Port Sudan city. On the right, the deep blue Red Sea with ships and port cranes. On the left and background, a continuous range of rugged brown mountains (Red Sea Hills). In the foreground, people in traditional Sudanese dress: men in white jalabiyas and black vests with turbans, and women in colorful patterned toubs. Cinematic lighting, realistic style.";
  
  const aboutPrompt = "A scenic landscape of Arbaat Dam in Port Sudan, Sudan. The dam is nestled between high, rugged desert mountains. A small patch of green agriculture is visible near the water. Traditional Sudanese men with 'Khalal' combs in their curly hair are walking nearby. Serene atmosphere, high resolution.";

  const mainResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: mainPrompt }] },
  });

  const aboutResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: aboutPrompt }] },
  });

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

export async function uploadToCloudinary(file: File): Promise<string> {
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
  return data.secure_url;
}

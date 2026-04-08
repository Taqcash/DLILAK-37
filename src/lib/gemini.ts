import { GoogleGenAI } from "@google/genai";

export const getGeminiAI = (userApiKey?: string) => {
  if (!userApiKey) return null;
  return new GoogleGenAI({ apiKey: userApiKey });
};

export const getSystemGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const smartSearch = async (query: string, dataContext: string, userApiKey?: string) => {
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      You are an expert assistant for a service marketplace in Port Sudan.
      User Query: "${query}"
      Available Services Context: ${dataContext}
      
      Task: Filter and rank the most relevant services based on the query. 
      Return ONLY a JSON object with an array of IDs: {"ids": ["id1", "id2"]}.
      If no matches, return {"ids": []}.
      Do not include any other text.
    `,
  });

  return response.text;
};

export const improveAd = async (title: string, description: string, profession: string, userApiKey?: string) => {
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Profession: ${profession}
      Current Title: ${title}
      Current Description: ${description}
      
      Task: Improve this service advertisement to be more professional, attractive, and clear for customers in Port Sudan.
      Use local Sudanese dialect where appropriate to sound friendly but professional.
      Return the improved Title and Description.
    `,
  });

  return response.text;
};

export const verifyID = async (idImageBase64: string, userData: any, userApiKey?: string) => {
  // Verification is a system feature, but we can use user key if available
  const ai = getGeminiAI(userApiKey) || getSystemGeminiAI();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: idImageBase64,
        },
      },
      {
        text: `
          Analyze this ID document (National ID, Passport, or License).
          Compare the name and details on the ID with this user data: ${JSON.stringify(userData)}.
          Return a JSON object:
          {
            "isMatch": boolean,
            "confidence": number (0-1),
            "reason": "string in Arabic",
            "extractedName": "string"
          }
        `,
      },
    ],
  });

  return response.text;
};

export const moderateContent = async (text?: string, imageBase64?: string, userApiKey?: string) => {
  // Moderation should always run, use system key as fallback
  const ai = getGeminiAI(userApiKey) || getSystemGeminiAI();
  if (!ai) return "SAFE"; // Default to safe if AI is unavailable to not block users, but log error

  const prompt = `
    Analyze this content for a service marketplace in Port Sudan, Sudan.
    Check for:
    1. Violence or weapons.
    2. Nudity or sexually explicit content.
    3. Hate speech or offensive language.
    4. Fraud, scams, or suspicious financial promises.
    5. Political content or sensitive local conflict references.
    
    Return ONLY 'SAFE' if the content is appropriate.
    Return 'UNSAFE: [Reason in Arabic]' if it violates any policy.
  `;

  const parts: any[] = [{ text: prompt }];
  if (text) parts.push({ text: `Content to analyze: ${text}` });
  if (imageBase64) {
    // If it's a data URL, strip the prefix
    const data = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
    parts.push({ inlineData: { mimeType: "image/jpeg", data } });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: parts,
    });
    return response.text || "SAFE";
  } catch (error) {
    console.error("Moderation error:", error);
    return "SAFE";
  }
};

export const generateSiteReport = async (activities: any[], userApiKey?: string) => {
  // Site reports use system key by default
  const ai = getGeminiAI(userApiKey) || getSystemGeminiAI();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Generate a summary report for the site administrator based on these activities from the last 10 hours:
      ${JSON.stringify(activities)}
      The report should be professional, in Arabic, and highlight growth and any issues.
    `,
  });

  return response.text;
};

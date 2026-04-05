import { GoogleGenAI } from "@google/genai";

export const getGeminiAI = (userApiKey?: string) => {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const smartSearch = async (query: string, dataContext: string, userApiKey?: string) => {
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `
      You are an expert assistant for a service marketplace in Port Sudan.
      User Query: "${query}"
      Available Services Context: ${dataContext}
      
      Task: Filter and rank the most relevant services based on the query. 
      Return the results in a clean JSON format with an array of IDs.
      If the query is vague, suggest categories.
      Respond in Arabic.
    `,
  });

  return response.text;
};

export const improveAd = async (title: string, description: string, profession: string, userApiKey?: string) => {
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
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
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
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
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const parts: any[] = [{ text: "Analyze this content for violence, nudity, or offensive language. Return 'SAFE' or 'UNSAFE' with a reason in Arabic." }];
  if (text) parts.push({ text: `Text to analyze: ${text}` });
  if (imageBase64) parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: parts,
  });

  return response.text;
};

export const generateSiteReport = async (activities: any[], userApiKey?: string) => {
  const ai = getGeminiAI(userApiKey);
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `
      Generate a summary report for the site administrator based on these activities from the last 10 hours:
      ${JSON.stringify(activities)}
      The report should be professional, in Arabic, and highlight growth and any issues.
    `,
  });

  return response.text;
};

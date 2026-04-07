import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { PROFESSIONS, NEIGHBORHOODS } from "@/lib/constants";

export async function POST(req: Request) {
  const { query } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY!;

  if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

  const genAI = new GoogleGenAI({ apiKey });
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this search query for a service directory in Port Sudan: "${query}".
    Extract the profession and neighborhood from these lists:
    Professions: ${PROFESSIONS.join(', ')}
    Neighborhoods: ${NEIGHBORHOODS.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          profession: { type: Type.STRING, description: "The extracted profession" },
          neighborhood: { type: Type.STRING, description: "The extracted neighborhood" },
          type: { type: Type.STRING, enum: ["offer", "request"], description: "The type of ad" }
        },
        required: ["profession", "neighborhood", "type"]
      }
    }
  });

  return NextResponse.json(JSON.parse(response.text || "{}"));
}

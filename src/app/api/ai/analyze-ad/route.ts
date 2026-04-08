import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { description } = await req.json();
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

  if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

  const genAI = new GoogleGenAI({ apiKey });
  const model = genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert ad copywriter for "Dalil Khidmatak", a service directory in Port Sudan. 
    Analyze this ad description and provide 3 tips to make it more professional and trustworthy for the local market. 
    Description: "${description}"
    Response in Arabic.`
  });

  const result = await model;
  return NextResponse.json({ analysis: result.text || "" });
}

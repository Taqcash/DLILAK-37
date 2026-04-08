import { AIService } from "@/services/aiService";
import { NextResponse } from "next/server";
import { PROFESSIONS, NEIGHBORHOODS } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const ai = new AIService(apiKey);
    const analysis = await ai.analyzeForumPost(content, PROFESSIONS, NEIGHBORHOODS);
    
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Forum analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

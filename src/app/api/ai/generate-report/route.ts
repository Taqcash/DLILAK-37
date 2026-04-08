import { AIService } from "@/services/aiService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { activities } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const ai = new AIService(apiKey);
    const report = await ai.generateAdminReport(activities);
    
    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

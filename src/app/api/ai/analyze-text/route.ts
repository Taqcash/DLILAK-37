import { DeepSeekService } from '@/services/deepseekService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { content, systemPrompt } = await req.json();
    const result = await DeepSeekService.analyzeText(content, systemPrompt);
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('DeepSeek analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

  if (!deepseekApiKey) {
    return NextResponse.json({ error: 'DeepSeek API Key not configured' }, { status: 500 });
  }

  try {
    const data = await req.json();
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a senior business strategist for a Sudanese service directory platform. Provide deep, data-driven insights based on the provided metrics.',
          },
          {
            role: 'user',
            content: `Analyze these platform metrics and provide 3 high-impact strategic recommendations: ${JSON.stringify(data)}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json({ insights: result.choices[0].message.content });
  } catch (error: any) {
    console.error('DeepSeek Analytics Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
}

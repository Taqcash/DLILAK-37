import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly deepseekApiKey = process.env.DEEPSEEK_API_KEY;

  async getDeepInsights(data: any) {
    if (!this.deepseekApiKey) {
      return { error: 'DeepSeek API Key not configured' };
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`,
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
      return { insights: result.choices[0].message.content };
    } catch (error: any) {
      console.error('DeepSeek Analytics Error:', error);
      return { error: error.message };
    }
  }

  async getHealthStatus() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}

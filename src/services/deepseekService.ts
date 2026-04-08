export class DeepSeekService {
  private static apiKey = process.env.DEEPSEEK_API_KEY;
  private static apiUrl = 'https://api.deepseek.com/v1/chat/completions';

  static async analyzeText(content: string, systemPrompt: string = 'You are a helpful assistant.') {
    if (!this.apiKey) {
      console.warn('DeepSeek API Key missing, falling back to basic analysis');
      return content;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content },
          ],
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }
}

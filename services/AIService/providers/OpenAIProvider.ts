import { 
  AIServiceConfig 
} from '../types';
import { BaseAIProvider } from './BaseAIProvider';
import { registerProvider } from './providerRegistry';

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI';

  constructor(config: AIServiceConfig) {
    super(config);
  }

  protected async callAPI(
    systemPrompt: string,
    userMessage: string,
    overrides?: Partial<AIServiceConfig>
  ): Promise<string> {
    const config = { ...this.config, ...overrides };
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    return content;
  }
}


registerProvider('openai', new OpenAIProvider({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',
}));

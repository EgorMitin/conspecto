import {
  AIServiceConfig
} from '../types';
import { BaseAIProvider } from './BaseAIProvider';
import { registerProvider } from './providerRegistry';
import { GoogleGenAI } from "@google/genai";

export class GoogleProvider extends BaseAIProvider {
  name = 'Google';

  constructor(config: AIServiceConfig) {
    super(config);
  }

  protected async callAPI(
    systemPrompt: string,
    userMessage: string,
    overrides?: Partial<AIServiceConfig>
  ): Promise<string> {
    const config = { ...this.config, ...overrides };
    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    const response = await ai.models.generateContent({
      model: config.model,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    });

    if (!response.text) {
      throw new Error(`Google GenAI error: ${response.promptFeedback}`);
    }

    let cleanedText = response.text.trim();
    
    // Remove ```json and ``` if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    if (!cleanedText) {
      throw new Error('No content received from Google GenAI');
    }
    return cleanedText;
  }
}


registerProvider('google', new GoogleProvider({
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY || '',
  model: 'gemini-2.0-flash',
}));

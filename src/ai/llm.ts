import { AIConfig, AIProvider } from '../types';
import { generateWithOAuth, fetchGeminiModelsWithOAuth } from './geminiOAuth';

export class LLMService {
  private config: AIConfig;
  private googleAccessToken: string | null;

  constructor(config: AIConfig, googleAccessToken: string | null = null) {
    this.config = config;
    this.googleAccessToken = googleAccessToken;
  }

  updateConfig(config: AIConfig) {
    this.config = config;
  }

  setGoogleAccessToken(token: string | null) {
    this.googleAccessToken = token;
  }

  async fetchModels(provider: AIProvider): Promise<string[]> {
    const providerConfig = this.config.providers[provider];

    // For Google provider, if OAuth token is available, use it
    if (provider === 'google' && this.googleAccessToken) {
      return fetchGeminiModelsWithOAuth(this.googleAccessToken);
    }

    if (!providerConfig || (!providerConfig.apiKey && provider !== 'ollama')) {
      throw new Error(`API key not configured for ${provider}`);
    }

    try {
      switch (provider) {
        case 'openai':
          const openaiRes = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${providerConfig.apiKey}` }
          });
          if (!openaiRes.ok) throw new Error('Failed to fetch OpenAI models');
          const openaiData = await openaiRes.json();
          return openaiData.data
            .filter((m: any) => m.id.includes('gpt'))
            .map((m: any) => m.id)
            .sort();
            
        case 'anthropic':
          return [
            'claude-3-5-sonnet-20240620',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
          ];
          
        case 'google':
          const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${providerConfig.apiKey}`);
          if (!googleRes.ok) throw new Error('Failed to fetch Google models');
          const googleData = await googleRes.json();
          return googleData.models
            .filter((m: any) => m.name.includes('gemini'))
            .map((m: any) => m.name.replace('models/', ''))
            .sort();
          
        case 'ollama':
          const baseUrl = providerConfig.baseUrl || 'http://localhost:11434';
          const ollamaRes = await fetch(`${baseUrl}/api/tags`);
          if (!ollamaRes.ok) throw new Error('Failed to fetch Ollama models');
          const ollamaData = await ollamaRes.json();
          return ollamaData.models.map((m: any) => m.name);
          
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      throw error;
    }
  }

  async generate(feature: keyof AIConfig['features'], prompt: string): Promise<string> {
    const featureConfig = this.config.features[feature];
    if (!featureConfig) {
      throw new Error(`AI feature ${feature} is not configured.`);
    }

    const { provider, modelId } = featureConfig;

    // Route Google provider calls through OAuth if a token is available
    if (provider === 'google' && this.googleAccessToken) {
      console.log(`[LLMService] Using Google OAuth token for ${feature} (model: ${modelId})`);
      return generateWithOAuth(this.googleAccessToken, modelId, prompt);
    }

    const providerConfig = this.config.providers[provider];
    if (!providerConfig) {
      throw new Error(`Provider ${provider} is not configured.`);
    }

    if (provider === 'openai') {
      console.log(`[LLMService] Generating for ${feature} using OpenAI (${modelId})...`);
      if (!providerConfig.apiKey) {
        throw new Error('OpenAI API key is missing.');
      }
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerConfig.apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorMsg;
        } catch (e) {}
        throw new Error(`OpenAI API error: ${errorMsg}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    if (provider === 'ollama') {
      console.log(`[LLMService] Generating for ${feature} using Ollama (${modelId})...`);
      const baseUrl = providerConfig.baseUrl || 'http://localhost:11434';
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {}
        throw new Error(`Ollama API error: ${errorMsg}`);
      }

      const data = await response.json();
      return data.response;
    }

    // Placeholder for other providers — extend with real API calls here
    console.log(`[LLMService] Generating for ${feature} using ${provider} (${modelId})...`);
    return `Placeholder generated response for ${feature} with model ${modelId}`;
  }
}

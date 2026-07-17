import { AIConfig, AIProvider } from '../types';

export class LLMService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  updateConfig(config: AIConfig) {
    this.config = config;
  }

  async fetchModels(provider: AIProvider): Promise<string[]> {
    const providerConfig = this.config.providers[provider];
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
          // In a real app we could fetch from https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}
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

    const providerConfig = this.config.providers[featureConfig.provider];
    if (!providerConfig) {
      throw new Error(`Provider ${featureConfig.provider} is not configured.`);
    }

    // This is a placeholder. Later we will implement Langchain integration here.
    console.log(`[LLMService] Generating for ${feature} using ${featureConfig.provider} (${featureConfig.modelId})...`);
    
    return `Placeholder generated response for ${feature} with model ${featureConfig.modelId}`;
  }
}

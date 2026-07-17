export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
}

export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
}

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama' | 'custom';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
}

export interface AIFeatureModelConfig {
  provider: AIProvider;
  modelId: string;
  enabled?: boolean;
}

export interface AIConfig {
  providers: Partial<Record<AIProvider, AIProviderConfig>>;
  features: {
    autoComplete: AIFeatureModelConfig | null;
    promptToMarkdown: AIFeatureModelConfig | null;
    templateGeneration: AIFeatureModelConfig | null;
  };
}

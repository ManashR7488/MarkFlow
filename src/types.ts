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
  avatar?: string;
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

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string; // Google's unique user ID
}

export interface GoogleAuthState {
  isConnected: boolean;
  user: GoogleUser | null;
  accessToken: string | null;
  expiresAt: number | null; // unix timestamp in ms
}

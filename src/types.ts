export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  locked?: boolean;
  encryptedContent?: string;
  encryptionIV?: string;
}

export interface SecurityConfig {
  masterPasswordHash: string | null;
  salt: string | null;
  // Vault Key architecture fields
  encryptedVaultKeyPassword: string | null; // Vault Key encrypted with Master Password KEK
  encryptedVaultKeyPasskey: string | null;  // Vault Key encrypted with Passkey PRF output KEK
  passkeyId: string | null;                 // The credential ID for the WebAuthn passkey
  passkeySalt: string | null;               // The random salt passed to the PRF extension
  autoLockEnabled: boolean;
  autoLockTimeoutMs: number;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
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
  systemPrompt?: string;
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

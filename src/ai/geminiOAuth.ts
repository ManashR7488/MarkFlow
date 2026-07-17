/**
 * geminiOAuth.ts
 *
 * Makes Gemini API calls using a user's OAuth 2.0 access token
 * (Bearer token) instead of a static API key. This bills requests
 * against the user's personal Google quota.
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiOAuthError {
  code: number;
  message: string;
  status: string;
}

export async function generateWithOAuth(
  accessToken: string,
  modelId: string,
  prompt: string
): Promise<string> {
  // Default to gemini-1.5-flash if no model is explicitly selected
  const model = modelId || 'gemini-1.5-flash';

  const url = `${GEMINI_BASE}/interactions`;

  const body = {
    model: model,
    input: prompt
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        // Required header for OAuth-authenticated Gemini calls
        'x-goog-api-client': 'markflow/1.0',
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new Error('Network error: Could not reach the Gemini API. Please check your internet connection.');
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {}

    const status = response.status;
    const apiError: GeminiOAuthError = errorData?.error ?? { code: status, message: response.statusText, status: 'UNKNOWN' };

    if (status === 401) {
      throw new Error(
        'Your Google session has expired. Please disconnect and reconnect your Google account in Settings → AI → Google.'
      );
    }

    if (status === 403) {
      throw new Error(
        'Permission denied. Make sure the "Generative Language API" is enabled in your Google Cloud Console project.'
      );
    }

    if (status === 429) {
      throw new Error(
        'You have exceeded your personal Gemini API quota. Please wait a moment and try again, or upgrade your Google AI plan.'
      );
    }

    throw new Error(`Gemini API error (${status}): ${apiError.message}`);
  }

  const data = await response.json();

  // Extract the text from the response
  // New format uses interactions endpoint with steps array
  const outputStep = data?.steps?.find((step: any) => step.type === 'model_output');
  const text = outputStep?.content?.[0]?.text;
  
  if (!text) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }

  return text;
}

/**
 * Fetch available Gemini models using an OAuth token.
 * Returns model IDs that include "gemini" in their name.
 */
export async function fetchGeminiModelsWithOAuth(accessToken: string): Promise<string[]> {
  const response = await fetch(`${GEMINI_BASE}/models`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-goog-api-client': 'markflow/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return (data.models ?? [])
    .filter((m: any) => m.name?.includes('gemini'))
    .map((m: any) => m.name.replace('models/', ''))
    .sort();
}

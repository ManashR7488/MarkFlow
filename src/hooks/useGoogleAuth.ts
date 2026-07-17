import { useState, useCallback, useEffect } from 'react';
import { GoogleAuthState, GoogleUser } from '../types';

const STORAGE_KEY = 'markflow_google_auth';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = [
  'https://www.googleapis.com/auth/generative-language.peruserquota',
  'https://www.googleapis.com/auth/generative-language.retriever',
  'https://www.googleapis.com/auth/cloud-platform',
  'openid',
  'email',
  'profile',
].join(' ');

// Declare the google global provided by the GIS script tag
declare const google: any;

function loadFromStorage(): GoogleAuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isConnected: false, user: null, accessToken: null, expiresAt: null };
    const parsed: GoogleAuthState = JSON.parse(raw);
    // Treat as expired if we're within 60 seconds of expiry
    if (parsed.expiresAt && Date.now() >= parsed.expiresAt - 60_000) {
      localStorage.removeItem(STORAGE_KEY);
      return { isConnected: false, user: null, accessToken: null, expiresAt: null };
    }
    return parsed;
  } catch {
    return { isConnected: false, user: null, accessToken: null, expiresAt: null };
  }
}

function saveToStorage(state: GoogleAuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>(loadFromStorage);

  // On mount, validate that stored token hasn't expired
  useEffect(() => {
    const stored = loadFromStorage();
    setAuthState(stored);
  }, []);

  const login = useCallback(() => {
    if (!CLIENT_ID) {
      console.error('[useGoogleAuth] VITE_GOOGLE_CLIENT_ID is not set.');
      return;
    }

    // Use the OAuth implicit flow (token client) so we get an access token directly
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          console.error('[useGoogleAuth] Token error:', tokenResponse.error);
          return;
        }

        const accessToken: string = tokenResponse.access_token;
        const expiresIn: number = tokenResponse.expires_in ?? 3600; // seconds
        const expiresAt = Date.now() + expiresIn * 1000;

        // Fetch user profile from Google userinfo endpoint
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const user: GoogleUser = await res.json();

          const newState: GoogleAuthState = {
            isConnected: true,
            user,
            accessToken,
            expiresAt,
          };
          setAuthState(newState);
          saveToStorage(newState);
        } catch (err) {
          console.error('[useGoogleAuth] Failed to fetch user info:', err);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  }, []);

  const logout = useCallback(() => {
    if (authState.accessToken) {
      // Revoke the token from Google's servers
      google.accounts.oauth2.revoke(authState.accessToken, () => {
        console.log('[useGoogleAuth] Token revoked.');
      });
    }
    clearStorage();
    setAuthState({ isConnected: false, user: null, accessToken: null, expiresAt: null });
  }, [authState.accessToken]);

  return { authState, login, logout };
}

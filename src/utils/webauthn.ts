/**
 * Utilities for interacting with the Web Authentication API (WebAuthn)
 * specifically leveraging the PRF (Pseudo-Random Function) extension
 * to derive symmetric keys for local encryption.
 */

// Helper to encode Uint8Array to base64url string
export function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper to decode base64url string to Uint8Array
export function base64urlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}



/**
 * Registers a new passkey (platform authenticator) and requests the PRF extension.
 * Returns the Passkey ID and the PRF output secret.
 * @param prfSalt - A random 32-byte salt used to seed the PRF. Must be stored securely to derive the same key later.
 */
export async function registerPasskeyWithPrf(prfSalt: Uint8Array): Promise<{ passkeyId: string; prfSecret: ArrayBuffer }> {
  // Generate random user ID and challenge
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  const options: PublicKeyCredentialCreationOptions = {
    rp: {
      name: 'Markdown Editor Vault',
      id: window.location.hostname
    },
    user: {
      id: userId,
      name: 'localuser@markdowneditor.local',
      displayName: 'Local Vault User'
    },
    challenge: challenge,
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },  // ES256
      { type: 'public-key', alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'required',
      userVerification: 'required'
    },
    timeout: 60000,
    extensions: {
      // Request PRF evaluation during registration
      prf: {
        eval: {
          first: prfSalt
        }
      }
    } as any
  };

  const credential = await navigator.credentials.create({
    publicKey: options
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Failed to create passkey');
  }

  // Get the PRF results
  const extensionResults = credential.getClientExtensionResults() as any;
  if (!extensionResults.prf || (!extensionResults.prf.enabled && !extensionResults.prf.results) || !extensionResults.prf.results?.first) {
    throw new Error('Your passkey was created, but your device does not support the PRF extension required for local encryption. Note: standard passkeys for authentication are different from PRF passkeys for encryption.');
  }

  const passkeyId = bufferToBase64url(credential.rawId);
  const prfSecret = extensionResults.prf.results.first as ArrayBuffer;

  return { passkeyId, prfSecret };
}

/**
 * Authenticates an existing passkey and retrieves the deterministic PRF output secret.
 * @param passkeyId - The ID of the passkey created during registration.
 * @param prfSalt - The same 32-byte salt used during registration.
 */
export async function authenticatePasskeyWithPrf(passkeyId: string, prfSalt: Uint8Array): Promise<ArrayBuffer> {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  
  const options: PublicKeyCredentialRequestOptions = {
    challenge: challenge,
    rpId: window.location.hostname,
    allowCredentials: [
      {
        type: 'public-key',
        id: base64urlToBuffer(passkeyId) as BufferSource
      }
    ],
    userVerification: 'required',
    extensions: {
      prf: {
        eval: {
          first: prfSalt
        }
      }
    } as any
  };

  const credential = await navigator.credentials.get({
    publicKey: options
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Failed to authenticate passkey');
  }

  const extensionResults = credential.getClientExtensionResults() as any;
  if (!extensionResults.prf || !extensionResults.prf.results || !extensionResults.prf.results.first) {
    throw new Error('Failed to derive PRF secret from authenticator');
  }

  return extensionResults.prf.results.first as ArrayBuffer;
}

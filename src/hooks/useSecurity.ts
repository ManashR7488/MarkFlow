import { useState, useEffect, useRef } from 'react';
import { SecurityConfig, Note } from '../types';
import { hashPassword, verifyPassword, encryptContent, decryptContent, generateRandomKey, bufferToBase64 } from '../utils/crypto';
import { registerPasskeyWithPrf, authenticatePasskeyWithPrf, base64urlToBuffer } from '../utils/webauthn';

const STORAGE_KEY = 'markdown-security-config-v1';

const DEFAULT_CONFIG: SecurityConfig = {
  masterPasswordHash: null,
  salt: null,
  encryptedVaultKeyPassword: null,
  encryptedVaultKeyPasskey: null,
  passkeyId: null,
  passkeySalt: null,
  autoLockEnabled: false,
  autoLockTimeoutMs: 5 * 60 * 1000 // 5 minutes
};

export function useSecurity(
  notes: Note[],
  updateNote: (id: string, updates: Partial<Note>) => void
) {
  const [config, setConfig] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse security config');
      }
    }
    return DEFAULT_CONFIG;
  });

  const [unlockedSessionNotes, setUnlockedSessionNotes] = useState<Set<string>>(new Set());
  const [unlockedVaultKey, setUnlockedVaultKey] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  
  const lastActivityRef = useRef<number>(Date.now());
  const autoLockIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Activity tracking for auto-lock
  useEffect(() => {
    if (!config.autoLockEnabled || unlockedSessionNotes.size === 0) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    autoLockIntervalRef.current = window.setInterval(async () => {
      if (Date.now() - lastActivityRef.current >= config.autoLockTimeoutMs) {
        if (unlockedVaultKey && config.salt) {
          for (const noteId of unlockedSessionNotes) {
            const note = notes.find(n => n.id === noteId);
            if (note && !note.locked) {
              try {
                const { ciphertext, iv } = await encryptContent(note.content, unlockedVaultKey, config.salt);
                updateNote(note.id, {
                  content: '[Encrypted]',
                  encryptedContent: ciphertext,
                  encryptionIV: iv,
                  locked: true
                });
              } catch (e) {
                console.error(`Failed to auto-lock note ${noteId}`, e);
              }
            }
          }
        }
        setUnlockedSessionNotes(new Set());
        setUnlockedVaultKey(null);
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      if (autoLockIntervalRef.current !== null) {
        window.clearInterval(autoLockIntervalRef.current);
      }
    };
  }, [config.autoLockEnabled, config.autoLockTimeoutMs, unlockedSessionNotes, unlockedVaultKey, config.salt, notes, updateNote]);

  const updateConfig = (updates: Partial<SecurityConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const isConfigured = !!config.masterPasswordHash || !!config.passkeyId;

  // Derive the Vault Key using the provided password
  const deriveVaultKeyWithPassword = async (password: string): Promise<string> => {
    if (!config.masterPasswordHash || !config.encryptedVaultKeyPassword || !config.salt) {
      throw new Error('Master password not configured properly');
    }
    const isValid = await verifyPassword(password, config.masterPasswordHash);
    if (!isValid) throw new Error('Invalid master password');

    // Parse the ciphertext and IV
    const [iv, ciphertext] = config.encryptedVaultKeyPassword.split(':');
    return await decryptContent(ciphertext, iv, password, config.salt);
  };

  // Derive the Vault Key using the WebAuthn passkey PRF
  const deriveVaultKeyWithPasskey = async (): Promise<string> => {
    if (!config.passkeyId || !config.passkeySalt || !config.encryptedVaultKeyPasskey || !config.salt) {
      throw new Error('Passkey not configured properly');
    }
    
    // Convert passkeySalt from base64url back to Uint8Array for the PRF
    const prfSaltBuffer = base64urlToBuffer(config.passkeySalt);
    const prfSecretBuffer = await authenticatePasskeyWithPrf(config.passkeyId, prfSaltBuffer);
    const prfSecret = bufferToBase64(prfSecretBuffer);

    const [iv, ciphertext] = config.encryptedVaultKeyPasskey.split(':');
    return await decryptContent(ciphertext, iv, prfSecret, config.salt);
  };

  const lockNote = async (noteId: string, password?: string) => {
    if (!isConfigured || !config.salt) throw new Error('Vault not set up');
    
    let vaultKey = unlockedVaultKey;
    if (!vaultKey) {
      if (password) {
        vaultKey = await deriveVaultKeyWithPassword(password);
      } else if (config.passkeyId) {
        vaultKey = await deriveVaultKeyWithPasskey();
      } else {
        throw new Error('VAULT_LOCKED');
      }
    }
    
    const note = notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');

    const { ciphertext, iv } = await encryptContent(note.content, vaultKey, config.salt);
    updateNote(noteId, {
      content: '[Encrypted]',
      encryptedContent: ciphertext,
      encryptionIV: iv,
      locked: true
    });

    setUnlockedSessionNotes(prev => {
      const next = new Set(prev);
      next.delete(noteId);
      if (next.size === 0) {
        setUnlockedVaultKey(null);
      }
      return next;
    });
  };

  const unlockNote = async (noteId: string, password?: string) => {
    try {
      setUnlockError(null);
      if (!isConfigured || !config.salt) throw new Error('Vault not set up');
      
      let vaultKey = unlockedVaultKey;
      
      // If we don't have the vault key in memory, we need to derive it
      if (!vaultKey) {
        if (password) {
          vaultKey = await deriveVaultKeyWithPassword(password);
        } else if (config.passkeyId) {
          vaultKey = await deriveVaultKeyWithPasskey();
        } else {
          throw new Error('Password required to unlock vault');
        }
        setUnlockedVaultKey(vaultKey);
      }

      const note = notes.find(n => n.id === noteId);
      if (!note || !note.locked || !note.encryptedContent || !note.encryptionIV) {
        throw new Error('Note is not encrypted');
      }

      const plaintext = await decryptContent(note.encryptedContent, note.encryptionIV, vaultKey, config.salt);
      updateNote(noteId, {
        content: plaintext,
        encryptedContent: undefined,
        encryptionIV: undefined,
        locked: false
      });

      setUnlockedSessionNotes(prev => new Set(prev).add(noteId));
    } catch (e: any) {
      setUnlockError(e.message || 'Failed to unlock note');
      throw e;
    }
  };

  const setMasterPassword = async (password: string, salt: string) => {
    // Generate a new Vault Key if one doesn't exist
    let vaultKey = unlockedVaultKey;
    if (!vaultKey) {
       vaultKey = generateRandomKey();
       setUnlockedVaultKey(vaultKey);
    }
    
    const hash = await hashPassword(password);
    const { ciphertext, iv } = await encryptContent(vaultKey, password, salt);
    
    updateConfig({ 
      masterPasswordHash: hash, 
      salt,
      encryptedVaultKeyPassword: `${iv}:${ciphertext}` 
    });
  };

  const changeMasterPassword = async (oldPassword: string, newPassword: string) => {
    if (!config.masterPasswordHash || !config.salt) throw new Error('Master password not set');
    
    // This validates the old password and gets the vault key
    const vaultKey = await deriveVaultKeyWithPassword(oldPassword);
    
    // Encrypt the same vault key with the new password
    const newHash = await hashPassword(newPassword);
    const { ciphertext, iv } = await encryptContent(vaultKey, newPassword, config.salt);
    
    updateConfig({ 
      masterPasswordHash: newHash,
      encryptedVaultKeyPassword: `${iv}:${ciphertext}` 
    });
    setUnlockedVaultKey(vaultKey);
  };

  const removeMasterPassword = async (password: string) => {
    if (!config.masterPasswordHash || !config.salt) return;
    
    // We can't remove the master password if it's the only key to the vault
    if (!config.passkeyId) {
      throw new Error('Cannot remove master password because no passkey is configured. The vault would be permanently locked.');
    }

    const vaultKey = await deriveVaultKeyWithPassword(password);
    updateConfig({ 
      masterPasswordHash: null, 
      encryptedVaultKeyPassword: null 
    });
    setUnlockedVaultKey(vaultKey);
  };

  const setupPasskey = async (password?: string) => {
    // We try to register the passkey anyway. The creation will fail if PRF is unsupported.
    if (!window.PublicKeyCredential) {
      throw new Error("Your browser does not support WebAuthn.");
    }
    
    if (!config.salt) throw new Error("Vault salt is missing. Please set up a master password first.");

    let vaultKey = unlockedVaultKey;
    if (!vaultKey) {
      if (!password) {
        throw new Error("VAULT_LOCKED");
      }
      vaultKey = await deriveVaultKeyWithPassword(password);
    }

    // 1. Generate a random salt for the passkey PRF
    const prfSaltBuffer = crypto.getRandomValues(new Uint8Array(32));
    const passkeySalt = bufferToBase64(prfSaltBuffer.buffer); // Save this to config to use during auth

    // 2. Register the passkey
    const { passkeyId, prfSecret: secretBuffer } = await registerPasskeyWithPrf(prfSaltBuffer);
    const prfSecret = bufferToBase64(secretBuffer);

    // 3. Encrypt the Vault Key with the PRF Secret
    const { ciphertext, iv } = await encryptContent(vaultKey, prfSecret, config.salt);

    updateConfig({
      passkeyId,
      passkeySalt,
      encryptedVaultKeyPasskey: `${iv}:${ciphertext}`
    });
  };
  
  const removePasskey = async () => {
    if (!config.masterPasswordHash) {
      throw new Error('Cannot remove passkey because no master password is configured. The vault would be permanently locked.');
    }
    updateConfig({
      passkeyId: null,
      passkeySalt: null,
      encryptedVaultKeyPasskey: null
    });
  };

  return {
    config,
    updateConfig,
    isConfigured,
    setMasterPassword,
    changeMasterPassword,
    removeMasterPassword,
    setupPasskey,
    removePasskey,
    lockNote,
    unlockNote,
    unlockError,
    unlockedSessionNotes,
    unlockedVaultKey,
    setUnlockedVaultKey
  };
}

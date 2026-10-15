import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../types';
import {
  fetchCurrentUser,
  fetchAuthConfig,
  loginWithGoogleCredential,
  loginWithGoogleAccessToken,
  loginWithEmailPassword,
  registerWithEmailPassword,
  updateUserAcademicProfile,
  logoutUser
} from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleClientId: string;
  isGoogleConfigured: boolean;
  currentOrigin: string;
  loginGoogle: (credential: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  loginGoogleAccessToken: (accessToken: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  loginEmail: (email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  registerEmail: (name: string, email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  updateProfile: (updates: { name?: string; education_level?: string; institution?: string; stream_or_branch?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  openAuthModal: (requestedSection?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  pendingRedirectSection: string | null;
  refreshAuthConfig: () => Promise<void>;
  setCustomGoogleClientId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function isValidGoogleClientId(id?: string | null): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  if (
    trimmed === '' ||
    trimmed === 'Not configured' ||
    trimmed.includes('your-google-client-id') ||
    trimmed.includes('your-client-id') ||
    trimmed.includes('PLACEHOLDER') ||
    trimmed.startsWith('<')
  ) {
    return false;
  }
  return trimmed.endsWith('.apps.googleusercontent.com') && trimmed.length > 25;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('edupredict_token'));
  const [isLoading, setIsLoading] = useState(true);

  const getStoredDevClientId = () => {
    if (typeof window !== 'undefined') {
      try {
        return (localStorage.getItem('edupredict_dev_google_client_id') || '').trim();
      } catch {
        return '';
      }
    }
    return '';
  };

  const envClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const initialCustomId = getStoredDevClientId();
  const initialEffective = isValidGoogleClientId(envClientId)
    ? envClientId
    : isValidGoogleClientId(initialCustomId)
    ? initialCustomId
    : '';

  const [googleClientId, setGoogleClientId] = useState<string>(initialEffective);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState<boolean>(isValidGoogleClientId(initialEffective));
  const [currentOrigin, setCurrentOrigin] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  });

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirectSection, setPendingRedirectSection] = useState<string | null>(null);

  const setCustomGoogleClientId = (newId: string) => {
    const trimmed = newId.trim();
    if (typeof window !== 'undefined') {
      try {
        if (trimmed && isValidGoogleClientId(trimmed)) {
          localStorage.setItem('edupredict_dev_google_client_id', trimmed);
        } else if (!trimmed) {
          localStorage.removeItem('edupredict_dev_google_client_id');
        }
      } catch {}
    }
    const effective = isValidGoogleClientId(envClientId)
      ? envClientId
      : isValidGoogleClientId(trimmed)
      ? trimmed
      : '';
    setGoogleClientId(effective);
    setIsGoogleConfigured(isValidGoogleClientId(effective));
  };

  // Hydrate user on mount
  const hydrate = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await fetchAuthConfig();
      const devId = getStoredDevClientId();

      // Priority resolution: valid build env -> valid backend config -> stored dev client ID
      let resolvedId = '';
      if (isValidGoogleClientId(envClientId)) {
        resolvedId = envClientId;
      } else if (isValidGoogleClientId(config.googleClientId)) {
        resolvedId = config.googleClientId;
      } else if (isValidGoogleClientId(devId)) {
        resolvedId = devId;
      }

      setGoogleClientId(resolvedId);
      setIsGoogleConfigured(isValidGoogleClientId(resolvedId));
      if (config.currentOrigin) {
        setCurrentOrigin(config.currentOrigin);
      }

      // Check for OAuth redirect tokens in URL hash or query params
      if (typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const search = window.location.search || '';

        let foundAccessToken: string | null = null;
        let foundCredential: string | null = null;

        if (hash.includes('access_token=') || hash.includes('id_token=')) {
          const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
          foundAccessToken = hashParams.get('access_token');
          foundCredential = hashParams.get('id_token');
        }

        if (!foundAccessToken && !foundCredential && search) {
          const searchParams = new URLSearchParams(search);
          foundAccessToken = searchParams.get('access_token');
          foundCredential = searchParams.get('credential');
        }

        if (foundAccessToken) {
          try {
            const data = await loginWithGoogleAccessToken(foundAccessToken);
            setUser(data.user);
            setToken(data.token);
            window.history.replaceState(null, '', window.location.pathname + '#dashboard');
            return;
          } catch (e) {
            console.error('Failed to authenticate with redirected Google access token:', e);
          }
        } else if (foundCredential) {
          try {
            const data = await loginWithGoogleCredential(foundCredential);
            setUser(data.user);
            setToken(data.token);
            window.history.replaceState(null, '', window.location.pathname + '#dashboard');
            return;
          } catch (e) {
            console.error('Failed to authenticate with redirected Google credential:', e);
          }
        }
      }

      if (token) {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          setToken(null);
          localStorage.removeItem('edupredict_token');
        }
      }
    } catch (err) {
      console.error('Failed to hydrate auth state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, envClientId]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const refreshAuthConfig = async () => {
    try {
      const config = await fetchAuthConfig();
      if (isValidGoogleClientId(config.googleClientId) && !isValidGoogleClientId(envClientId)) {
        setGoogleClientId(config.googleClientId);
        setIsGoogleConfigured(true);
      }
      if (config.currentOrigin) {
        setCurrentOrigin(config.currentOrigin);
      }
    } catch (err) {
      console.warn('Failed to refresh auth config:', err);
    }
  };

  const loginGoogle = async (credential: string) => {
    const data = await loginWithGoogleCredential(credential, googleClientId);
    setUser(data.user);
    setToken(data.token);
    setIsAuthModalOpen(false);
    return { user: data.user, isNewUser: data.isNewUser };
  };

  const loginGoogleAccessToken = async (accessToken: string) => {
    const data = await loginWithGoogleAccessToken(accessToken, googleClientId);
    setUser(data.user);
    setToken(data.token);
    setIsAuthModalOpen(false);
    return { user: data.user, isNewUser: data.isNewUser };
  };

  const loginEmail = async (email: string, pass: string) => {
    const data = await loginWithEmailPassword(email, pass);
    setUser(data.user);
    setToken(data.token);
    setIsAuthModalOpen(false);
    return { user: data.user, isNewUser: data.isNewUser };
  };

  const registerEmail = async (name: string, email: string, pass: string) => {
    const data = await registerWithEmailPassword(name, email, pass);
    setUser(data.user);
    setToken(data.token);
    setIsAuthModalOpen(false);
    return { user: data.user, isNewUser: data.isNewUser };
  };

  const updateProfile = async (updates: {
    name?: string;
    education_level?: string;
    institution?: string;
    stream_or_branch?: string;
  }) => {
    const updated = await updateUserAcademicProfile(updates);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const openAuthModal = (requestedSection?: string) => {
    if (requestedSection) {
      setPendingRedirectSection(requestedSection);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        googleClientId,
        isGoogleConfigured,
        currentOrigin,
        loginGoogle,
        loginGoogleAccessToken,
        loginEmail,
        registerEmail,
        updateProfile,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        pendingRedirectSection,
        refreshAuthConfig,
        setCustomGoogleClientId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

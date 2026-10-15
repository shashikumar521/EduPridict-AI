import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, SmsAuthConfig, OtpSendResponse, OtpVerifyResponse } from '../types';
import {
  fetchCurrentUser,
  fetchAuthConfig,
  loginWithGoogleCredential,
  loginWithGoogleAccessToken,
  loginWithEmailPassword,
  registerWithEmailPassword,
  updateUserAcademicProfile,
  logoutUser,
  sendMobileOtp,
  verifyMobileOtp,
  registerWithMobileOtp,
  linkMobileToExistingAccount
} from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleClientId: string;
  isGoogleConfigured: boolean;
  currentOrigin: string;
  smsConfig: SmsAuthConfig;
  loginGoogle: (credential: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  loginGoogleAccessToken: (accessToken: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  loginEmail: (email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  registerEmail: (name: string, email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  sendOtp: (phone: string) => Promise<OtpSendResponse>;
  verifyOtp: (phone: string, code: string) => Promise<OtpVerifyResponse>;
  registerPhone: (verificationToken: string, name: string, email?: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  linkPhone: (verificationToken: string, email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
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
  const initialEffectiveClientId = envClientId || getStoredDevClientId();
  const [googleClientId, setGoogleClientId] = useState(initialEffectiveClientId);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(Boolean(initialEffectiveClientId));
  const [currentOrigin, setCurrentOrigin] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.origin : '';
  });
  const [smsConfig, setSmsConfig] = useState<SmsAuthConfig>({ isConfigured: false, provider: 'none' });

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirectSection, setPendingRedirectSection] = useState<string | null>(null);

  const setCustomGoogleClientId = (newId: string) => {
    const trimmed = newId.trim();
    if (typeof window !== 'undefined') {
      try {
        if (trimmed) {
          localStorage.setItem('edupredict_dev_google_client_id', trimmed);
        } else {
          localStorage.removeItem('edupredict_dev_google_client_id');
        }
      } catch {}
    }
    const effective = envClientId || trimmed;
    setGoogleClientId(effective);
    setIsGoogleConfigured(Boolean(effective && effective.length > 0));
  };

  // Hydrate user on mount
  const hydrate = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await fetchAuthConfig();
      const devId = getStoredDevClientId();
      const effectiveClientId = envClientId || (config.googleClientId || '').trim() || devId;
      setGoogleClientId(effectiveClientId);
      setIsGoogleConfigured(Boolean(effectiveClientId && effectiveClientId.length > 0));
      if (config.currentOrigin) {
        setCurrentOrigin(config.currentOrigin);
      }
      if (config.sms) {
        setSmsConfig(config.sms);
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
      if (config.sms) setSmsConfig(config.sms);
    } catch (err) {
      console.warn('Failed to refresh auth config:', err);
    }
  };

  const loginGoogle = async (credential: string) => {
    const data = await loginWithGoogleCredential(credential);
    setUser(data.user);
    setToken(data.token);
    setIsAuthModalOpen(false);
    return { user: data.user, isNewUser: data.isNewUser };
  };

  const loginGoogleAccessToken = async (accessToken: string) => {
    const data = await loginWithGoogleAccessToken(accessToken);
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

  const sendOtp = async (phone: string) => {
    return await sendMobileOtp(phone);
  };

  const verifyOtp = async (phone: string, code: string) => {
    const data = await verifyMobileOtp(phone, code);
    if (data.status === 'success' && data.user && data.token) {
      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
    }
    return data;
  };

  const registerPhone = async (verificationToken: string, name: string, email?: string) => {
    const data = await registerWithMobileOtp(verificationToken, name, email);
    setUser(data.user);
    setToken(data.token);
    setIsAuthModalOpen(false);
    return { user: data.user, isNewUser: data.isNewUser };
  };

  const linkPhone = async (verificationToken: string, email: string, pass: string) => {
    const data = await linkMobileToExistingAccount(verificationToken, email, pass);
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
        smsConfig,
        loginGoogle,
        loginGoogleAccessToken,
        loginEmail,
        registerEmail,
        sendOtp,
        verifyOtp,
        registerPhone,
        linkPhone,
        updateProfile,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        pendingRedirectSection,
        refreshAuthConfig
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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../types';
import {
  fetchCurrentUser,
  fetchAuthConfig,
  loginWithGoogleCredential,
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
  loginGoogle: (credential: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  loginEmail: (email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  registerEmail: (name: string, email: string, pass: string) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  updateProfile: (updates: { name?: string; education_level?: string; institution?: string; stream_or_branch?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  openAuthModal: (requestedSection?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  pendingRedirectSection: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('edupredict_token'));
  const [isLoading, setIsLoading] = useState(true);
  const envClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const [googleClientId, setGoogleClientId] = useState(envClientId);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(Boolean(envClientId));

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirectSection, setPendingRedirectSection] = useState<string | null>(null);

  // Hydrate user on mount
  const hydrate = useCallback(async () => {
    setIsLoading(true);
    try {
      const config = await fetchAuthConfig();
      const effectiveClientId = envClientId || (config.googleClientId || '').trim();
      setGoogleClientId(effectiveClientId);
      setIsGoogleConfigured(Boolean(effectiveClientId && effectiveClientId.length > 0));

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
  }, [token]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loginGoogle = async (credential: string) => {
    const data = await loginWithGoogleCredential(credential);
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
        loginGoogle,
        loginEmail,
        registerEmail,
        updateProfile,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        pendingRedirectSection
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

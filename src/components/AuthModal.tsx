import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth, isValidGoogleClientId } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { EduPredictLogoAnimation } from './EduPredictLogoAnimation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (isNewUser: boolean) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    loginGoogle,
    loginGoogleAccessToken,
    loginEmail,
    registerEmail,
    googleClientId,
    isGoogleConfigured,
    currentOrigin,
    pendingRedirectSection
  } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const activeOrigin = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  // Initialize Google Identity Services button with retry loop
  useEffect(() => {
    if (!isOpen) return;

    let attempts = 0;
    const maxAttempts = 20;

    const setupGsi = () => {
      attempts++;
      if (
        typeof window !== 'undefined' &&
        window.google?.accounts?.id &&
        isGoogleConfigured &&
        isValidGoogleClientId(googleClientId)
      ) {
        setIsGsiReady(true);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setIsGoogleLoading(true);
                setErrorMessage(null);
                try {
                  const res = await loginGoogle(response.credential);
                  if (onSuccess) onSuccess(res.isNewUser);
                } catch (err: any) {
                  setErrorMessage(err.message || 'Google token verification failed on server.');
                } finally {
                  setIsGoogleLoading(false);
                }
              }
            },
            error_callback: (err: any) => {
              console.warn('Google Identity error_callback in modal:', err);
              if (err?.message?.includes('origin') || err?.type === 'origin_mismatch') {
                setErrorMessage(
                  `Origin mismatch: "${activeOrigin}" is not registered under Authorized JavaScript Origins in Google Cloud Console.`
                );
              } else if (err?.message?.includes('client') || err?.type === 'invalid_client') {
                setErrorMessage(`Invalid Client ID: "${googleClientId}" was not found by Google.`);
              }
            },
            cancel_on_tap_outside: true
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: isLight ? 'outline' : 'filled_blue',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 320
            });
          }
        } catch (e) {
          console.warn('Google GSI render error in modal:', e);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(setupGsi, 250);
      }
    };

    setupGsi();
  }, [isOpen, googleClientId, isGoogleConfigured, isLight, loginGoogle, onSuccess, activeOrigin]);

  const handleGoogleClick = () => {
    setErrorMessage(null);

    if (!isGoogleConfigured || !isValidGoogleClientId(googleClientId)) {
      setErrorMessage(
        'Google Client ID is not configured. Please sign in with your email or set VITE_GOOGLE_CLIENT_ID.'
      );
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        setIsGoogleLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsGoogleLoading(false);
              if (tokenResponse.error === 'popup_closed_by_user') {
                setErrorMessage('Google Sign-In was cancelled or closed before completion.');
              } else if (tokenResponse.error === 'access_denied') {
                setErrorMessage('Google Sign-In permission was denied.');
              } else {
                setErrorMessage(`Google authentication error: ${tokenResponse.error}`);
              }
              setShowRedirectOption(true);
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await loginGoogleAccessToken(tokenResponse.access_token);
                if (onSuccess) onSuccess(res.isNewUser);
              } catch (err: any) {
                setErrorMessage(err.message || 'Google token validation failed on backend server.');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
          error_callback: (err: any) => {
            setIsGoogleLoading(false);
            console.warn('Token client error:', err);
            setErrorMessage('Google popup was blocked or failed to load. Try using redirect sign-in.');
            setShowRedirectOption(true);
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.warn('OAuth2 tokenClient failed:', err);
        setErrorMessage(err?.message || 'Failed to initialize Google Sign-In.');
      }
    }

    if (window.google?.accounts?.id && isGsiReady) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowRedirectOption(true);
          }
        });
        return;
      } catch (promptErr) {
        console.warn('GSI prompt failed:', promptErr);
      }
    }

    setShowRedirectOption(true);
  };

  const handleGoogleRedirectFlow = () => {
    if (!googleClientId) return;
    const redirectUri = activeOrigin || window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(
      'email profile openid'
    )}&prompt=select_account`;
    window.location.href = authUrl;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full student name.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
        const res = await registerEmail(name.trim(), email.trim(), password);
        if (onSuccess) onSuccess(res.isNewUser);
      } else {
        const res = await loginEmail(email.trim(), password);
        if (onSuccess) onSuccess(res.isNewUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div
        className={`rounded-2xl sm:rounded-3xl border shadow-2xl max-w-md w-full max-h-[92dvh] overflow-y-auto custom-scrollbar transition-all ${
          isLight
            ? 'bg-white border-[#E1E6EF] text-[#172033] shadow-slate-300/50'
            : 'bg-[#131926] border-[#1E2B42] text-[#F7F8FC] shadow-black/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 border-b relative ${
            isLight
              ? 'bg-[#F0F3F9] border-[#E1E6EF] text-[#172033]'
              : 'bg-[#182236] border-[#1E2B42] text-white'
          }`}
        >
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition cursor-pointer ${
              isLight
                ? 'text-[#526078] hover:text-[#172033] hover:bg-[#E1E6EF]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <EduPredictLogoAnimation variant="login" showWordmark={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-extrabold tracking-tight ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                  EduPredict AI
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'bg-[#EEE7FF] text-[#7000E8] border-[#D1B8FC]'
                      : 'bg-[rgba(112,0,232,0.18)] text-[#C4B5FD] border-[rgba(142,48,255,0.35)]'
                  }`}
                >
                  Student Portal
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Sign in to access your private academic records &amp; forecasts
              </p>
            </div>
          </div>

          {pendingRedirectSection && (
            <div
              className={`mt-3 p-2 rounded-xl border text-[11px] flex items-center gap-2 ${
                isLight
                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                  : 'bg-purple-950/60 border-purple-800 text-purple-200'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
              <span>
                Please sign in to view <strong>{pendingRedirectSection}</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="flex-1 leading-snug font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl text-xs font-semibold border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition cursor-pointer min-h-[36px] ${
                mode === 'signin'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : 'bg-slate-800 text-white font-bold shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition cursor-pointer min-h-[36px] ${
                mode === 'register'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : 'bg-slate-800 text-white font-bold shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Student Full Name
                </label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shashikumar S."
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                        : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                Student Email Address
              </label>
              <div className="relative">
                <Mail className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 px-4 text-sm font-bold gap-2 min-h-[46px]"
            >
              {isLoading ? (
                <span className="text-white">Verifying credentials...</span>
              ) : (
                <>
                  <span className="text-white">{mode === 'register' ? 'Register Student Profile' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className={`border-t w-full ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
            <span
              className={`px-3 text-[10px] font-bold uppercase tracking-wider absolute ${
                isLight ? 'bg-white text-slate-500' : 'bg-[#111827] text-slate-400'
              }`}
            >
              or Google identity
            </span>
          </div>

          {/* Google Sign In Container */}
          <div className="space-y-2 pt-1">
            {isGoogleConfigured && (
              <div className="flex flex-col items-center justify-center w-full min-h-[42px]">
                <div ref={googleButtonRef} className="flex justify-center w-full" />
              </div>
            )}

            {(!isGoogleConfigured || !isGsiReady) && (
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || isLoading}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 border transition cursor-pointer active:scale-98 min-h-[44px] disabled:opacity-60 shadow-xs ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-[#161F33] hover:bg-[#1E293B] border-slate-700 text-white'
                }`}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            )}

            {showRedirectOption && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  isLight
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-amber-950/60 border-amber-800 text-amber-200'
                }`}
              >
                <span className="text-[11px] font-medium">Popup blocked? Use browser redirect.</span>
                <button
                  type="button"
                  onClick={handleGoogleRedirectFlow}
                  className="btn-secondary !text-xs !py-1 !px-2.5 font-bold"
                >
                  Redirect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

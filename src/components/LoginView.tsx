import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth, isValidGoogleClientId } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { EduPredictLogoAnimation } from './EduPredictLogoAnimation';

interface LoginViewProps {
  onNavigate: (section: SectionId) => void;
  onSuccess: (isNewUser: boolean) => void;
  initialMode?: 'signin' | 'register';
}

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigate,
  onSuccess,
  initialMode = 'signin'
}) => {
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

  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
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

  // Initialize and render Google Identity Services button with retry loop
  useEffect(() => {
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
                  onSuccess(res.isNewUser);
                } catch (err: any) {
                  setErrorMessage(err.message || 'Google token verification failed on server.');
                } finally {
                  setIsGoogleLoading(false);
                }
              }
            },
            error_callback: (err: any) => {
              console.warn('Google Identity error_callback:', err);
              if (err?.message?.includes('origin') || err?.type === 'origin_mismatch') {
                setErrorMessage('Google Sign-In is not configured for this domain. Please sign in with email.');
              } else if (err?.message?.includes('client') || err?.type === 'invalid_client') {
                setErrorMessage('Google Sign-In configuration error. Please sign in with email.');
              } else {
                setErrorMessage('Unable to complete Google Sign-In. Please use email and password.');
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
              shape: 'rectangular',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 340
            });
          }
        } catch (e) {
          console.warn('Google GSI render error:', e);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(setupGsi, 250);
      }
    };

    setupGsi();
  }, [googleClientId, isGoogleConfigured, isLight, loginGoogle, onSuccess, activeOrigin]);

  // Check URL hash for OAuth redirect token response
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('id_token='))) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');

      if (accessToken || idToken) {
        setIsGoogleLoading(true);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);

        const verifyToken = async () => {
          try {
            if (idToken) {
              const res = await loginGoogle(idToken);
              onSuccess(res.isNewUser);
            } else if (accessToken) {
              const res = await loginGoogleAccessToken(accessToken);
              onSuccess(res.isNewUser);
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Failed to authenticate via Google redirect flow.');
          } finally {
            setIsGoogleLoading(false);
          }
        };

        verifyToken();
      }
    }
  }, [loginGoogle, loginGoogleAccessToken, onSuccess]);

  // Google Sign-In button click handler
  const handleGoogleClick = () => {
    setErrorMessage(null);

    if (!isGoogleConfigured || !isValidGoogleClientId(googleClientId)) {
      setErrorMessage(
        'Google Sign-In is temporarily unavailable. Please sign in with your student email and password.'
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
                setErrorMessage('Google Sign-In was closed before completing authentication.');
              } else if (tokenResponse.error === 'access_denied') {
                setErrorMessage('Google Sign-In access was denied.');
              } else {
                setErrorMessage(`Google authentication error: ${tokenResponse.error}`);
              }
              setShowRedirectOption(true);
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await loginGoogleAccessToken(tokenResponse.access_token);
                onSuccess(res.isNewUser);
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
            setErrorMessage('Google popup was blocked or closed. You can use standard redirect sign-in.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your full student name.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const res = await registerEmail(name.trim(), email.trim(), password);
        onSuccess(res.isNewUser);
      } else {
        const res = await loginEmail(email.trim(), password);
        onSuccess(res.isNewUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-[100dvh] w-full flex flex-col justify-between antialiased overflow-x-hidden transition-colors relative ${
        isLight
          ? 'bg-[#F8FAFC] text-slate-900'
          : 'bg-[#0B0F19] text-slate-100'
      }`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`px-4 sm:px-8 py-3 flex items-center justify-between border-b backdrop-blur-md shrink-0 ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-[#111827]/90 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[38px] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${
              isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
            <span>Return to Public Home</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <span
            className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline px-2.5 py-1 rounded-full border ${
              isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            Secure Student Portal
          </span>
        </div>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 w-full my-auto">
        <div
          className={`w-full max-w-[460px] rounded-2xl border shadow-xl overflow-hidden transition-all mx-auto ${
            isLight
              ? 'bg-white border-[#E1E6EF] shadow-slate-200/60'
              : 'bg-[#131926] border-[#1E2B42] shadow-black/60'
          }`}
        >
          {/* Header Banner */}
          <div
            className={`px-6 py-4.5 border-b relative ${
              isLight
                ? 'bg-[#F0F3F9] border-[#E1E6EF] text-[#172033]'
                : 'bg-[#182236] border-[#1E2B42] text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <EduPredictLogoAnimation variant="login" showWordmark={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                    EduPredict AI
                  </h1>
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
                <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                  Secure Student Authentication &amp; Academic Analytics
                </p>
              </div>
            </div>

            {pendingRedirectSection && (
              <div
                className={`mt-3 p-2 rounded-lg border text-xs flex items-center gap-2 ${
                  isLight
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-purple-950/60 border-purple-800 text-purple-200'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
                <span className="leading-tight">
                  Please sign in to access your <strong>{pendingRedirectSection}</strong> records.
                </span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="flex-1 leading-snug font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div
              className={`grid grid-cols-2 p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer min-h-[36px] ${
                  mode === 'signin'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'bg-slate-800 text-white shadow-xs'
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
                className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer min-h-[36px] ${
                  mode === 'register'
                    ? isLight
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'bg-slate-800 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {mode === 'register' && (
                <div>
                  <label className={`block font-bold mb-1 text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Student Full Name
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shashikumar S."
                      className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium min-h-[42px] border focus:outline-none transition ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                          : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={`block font-bold mb-1 text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Student Email Address
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium min-h-[42px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                        : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block font-bold text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Account Password
                  </label>
                  <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {mode === 'register' ? 'Min. 6 characters' : ''}
                  </span>
                </div>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium min-h-[42px] border focus:outline-none transition ${
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
                className="btn-primary w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-bold gap-2 min-h-[42px] sm:min-h-[44px] rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <span className="text-white">Authenticating...</span>
                ) : (
                  <>
                    <span className="text-white">{mode === 'register' ? 'Create Student Profile' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className={`absolute inset-0 flex items-center ${isLight ? 'border-t border-slate-200' : 'border-t border-slate-800'}`} />
              <span
                className={`relative px-3 text-[10px] uppercase font-bold tracking-wider ${
                  isLight
                    ? 'bg-white text-slate-500'
                    : 'bg-[#131926] text-slate-400'
                }`}
              >
                Or Continue With Google
              </span>
            </div>

            {/* Google Account Sign-In Section */}
            <div className="space-y-2.5">
              {/* Official Google Identity Services Container when configured */}
              {isGoogleConfigured && (
                <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
                  <div ref={googleButtonRef} className="flex justify-center w-full" />
                </div>
              )}

              {/* Styled Fallback / Default Google Button */}
              {(!isGoogleConfigured || !isGsiReady) && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isGoogleLoading || isLoading}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 border transition cursor-pointer shadow-xs active:scale-[0.99] min-h-[42px] sm:min-h-[44px] disabled:opacity-60 ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:border-slate-400 shadow-slate-200/50'
                      : 'bg-[#161F33] hover:bg-[#1E293B] border-slate-700 text-slate-200 shadow-black/40'
                  }`}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Google...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
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

              {/* Redirect Alternative if popup was blocked */}
              {showRedirectOption && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-amber-950/60 border-amber-800 text-amber-200'
                  }`}
                >
                  <span className="text-[11px] leading-tight text-center sm:text-left font-medium">
                    Popup blocked? Use standard browser redirect.
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleRedirectFlow}
                    className="btn-secondary !text-xs !py-1 !px-2.5 font-bold shrink-0 cursor-pointer"
                  >
                    Open Redirect Sign-In
                  </button>
                </div>
              )}
            </div>

            {/* Privacy & Trust Badge */}
            <div className={`pt-2 flex items-center justify-center gap-1.5 text-[10.5px] font-medium text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Protected by secure encrypted sessions &bull; FERPA compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-3 text-center text-xs border-t transition-colors font-medium shrink-0 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-500'
            : 'bg-[#111827] border-slate-800 text-slate-400'
        }`}
      >
        <p>EduPredict AI • Early Academic Warning &amp; Machine Learning Intervention Platform</p>
      </footer>
    </div>
  );
};

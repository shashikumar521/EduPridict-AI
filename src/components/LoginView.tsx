import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { MobileAuthFlow } from './MobileAuthFlow';
import { EduPredictLogoAnimation } from './EduPredictLogoAnimation';
import { FloatingLogoBackground } from './FloatingLogoBackground';

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

  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const activeOrigin = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '');

  // Initialize and render Google Identity Services with active retry
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const setupGsi = () => {
      attempts++;
      if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
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
                  setErrorMessage(err.message || 'Google authentication failed');
                } finally {
                  setIsGoogleLoading(false);
                }
              }
            },
            error_callback: (err: any) => {
              console.warn('Google Identity error_callback:', err);
              if (err?.message?.includes('origin') || err?.type === 'origin_mismatch') {
                setErrorMessage(
                  `Authorized origin mismatch: "${activeOrigin}" is not registered in Google Cloud Console for client ID "${googleClientId}".`
                );
                setShowConfigGuide(true);
              }
            },
            cancel_on_tap_outside: true
          });

          if (googleButtonRef.current) {
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
          console.warn('Google GSI render error:', e);
        }
      } else if (attempts < maxAttempts) {
        setTimeout(setupGsi, 300);
      }
    };

    setupGsi();
  }, [googleClientId, isLight, loginGoogle, onSuccess, activeOrigin]);

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

    if (!googleClientId) {
      setErrorMessage(
        'Google Client ID is not configured in .env. Please set VITE_GOOGLE_CLIENT_ID or sign in with your phone or email below.'
      );
      setShowConfigGuide(true);
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
              setErrorMessage(`Google authentication error: ${tokenResponse.error}`);
              setShowRedirectOption(true);
              return;
            }
            if (tokenResponse?.access_token) {
              try {
                const res = await loginGoogleAccessToken(tokenResponse.access_token);
                onSuccess(res.isNewUser);
              } catch (err: any) {
                setErrorMessage(err.message || 'Google token validation failed on the backend.');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
          error_callback: (err: any) => {
            setIsGoogleLoading(false);
            console.warn('Token client error:', err);
            setShowRedirectOption(true);
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth2 tokenClient failed, attempting prompt fallback:', err);
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
      {/* Subtle Floating Logo Background Animation */}
      <FloatingLogoBackground />

      {/* Top Navigation Bar */}
      <header
        className={`px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border-b backdrop-blur-md shrink-0 ${
          isLight
            ? 'bg-white/95 border-slate-200'
            : 'bg-[#111827]/90 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer min-h-[36px] ${
              isLight
                ? 'text-slate-700 hover:text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ArrowLeft className={`w-3.5 h-3.5 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
            <span>Return to Public Home</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span
            className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Secure Student Portal
          </span>
        </div>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="flex-1 flex items-center justify-center p-2.5 sm:p-3.5 md:p-4 w-full my-auto">
        <div
          className={`w-full max-w-[490px] sm:max-w-[500px] rounded-2xl border shadow-xl overflow-hidden transition-all mx-auto ${
            isLight
              ? 'bg-white border-[#E1E6EF] shadow-slate-200/50'
              : 'bg-[#131926] border-[#1E2B42] shadow-black/60'
          }`}
        >
          {/* Header Banner */}
          <div
            className={`px-4 sm:px-5 py-2.5 sm:py-3 border-b relative ${
              isLight
                ? 'bg-[#F0F3F9] border-[#E1E6EF] text-[#172033]'
                : 'bg-[#182236] border-[#1E2B42] text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <EduPredictLogoAnimation variant="login" showWordmark={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className={`text-base sm:text-lg font-extrabold tracking-tight ${isLight ? 'text-[#172033]' : 'text-white'}`}>
                    EduPredict AI
                  </h1>
                  <span
                    className={`text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-[#EEE7FF] text-[#7000E8] border-[#D1B8FC]'
                        : 'bg-[rgba(112,0,232,0.18)] text-[#C4B5FD] border-[rgba(142,48,255,0.35)]'
                    }`}
                  >
                    Student Portal
                  </span>
                </div>
                <p className={`text-[11px] sm:text-xs mt-0.5 font-medium truncate ${isLight ? 'text-[#526078]' : 'text-slate-300'}`}>
                  Secure Student Authentication &amp; Longitudinal Profiles
                </p>
              </div>
            </div>

            {pendingRedirectSection && (
              <div
                className={`mt-2 p-1.5 sm:p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                  isLight
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-purple-950/60 border-purple-800 text-purple-200'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
                <span className="leading-tight">
                  Please authenticate to access your <strong>{pendingRedirectSection}</strong> records.
                </span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-3.5 sm:p-4.5 space-y-2.5 sm:space-y-3">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Primary Authentication Method Selector */}
            <div
              className={`grid grid-cols-2 p-0.5 sm:p-1 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('mobile');
                  setErrorMessage(null);
                }}
                className={`py-1.5 sm:py-2 px-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'mobile'
                    ? isLight
                      ? 'bg-white text-purple-900 shadow-xs border border-slate-200 font-extrabold'
                      : 'bg-purple-700 text-white shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile &amp; OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage(null);
                }}
                className={`py-1.5 sm:py-2 px-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'email'
                    ? isLight
                      ? 'bg-white text-purple-900 shadow-xs border border-slate-200 font-extrabold'
                      : 'bg-purple-700 text-white shadow-xs font-bold'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-900 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email &amp; Password</span>
              </button>
            </div>

            {/* OPTION 1: MOBILE NUMBER & OTP FLOW */}
            {authMethod === 'mobile' && (
              <MobileAuthFlow
                onSuccess={onSuccess}
                onSwitchToEmail={() => setAuthMethod('email')}
              />
            )}

            {/* OPTION 2: EMAIL & PASSWORD FLOW */}
            {authMethod === 'email' && (
              <div className="space-y-3">
                {/* Mode Switcher Tabs */}
                <div
                  className={`grid grid-cols-2 p-0.5 rounded-lg border ${
                    isLight
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      mode === 'signin'
                        ? isLight
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
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
                    onClick={() => setMode('register')}
                    className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      mode === 'register'
                        ? isLight
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
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
                <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
                  {mode === 'register' && (
                    <div>
                      <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Student Full Name
                      </label>
                      <div className="relative">
                        <User className={`w-3.5 h-3.5 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Shashikumar S."
                          className={`w-full rounded-lg pl-8.5 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                            isLight
                              ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                              : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Student Email Address
                    </label>
                    <div className="relative">
                      <Mail className={`w-3.5 h-3.5 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className={`w-full rounded-lg pl-8.5 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                            : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Account Password
                    </label>
                    <div className="relative">
                      <Lock className={`w-3.5 h-3.5 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-lg pl-8.5 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                            : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] mt-0.5 block font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {mode === 'register' ? 'Minimum 6 characters' : 'Enter your student account password'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-bold gap-2 min-h-[38px] sm:min-h-[40px] rounded-xl cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="text-white">Authenticating...</span>
                    ) : (
                      <>
                        <span className="text-white">{mode === 'register' ? 'Create Student Profile' : 'Sign In with Email'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1 sm:my-1.5">
              <div className={`absolute inset-0 flex items-center ${isLight ? 'border-t border-slate-200' : 'border-t border-slate-800'}`} />
              <span
                className={`relative px-2.5 text-[9.5px] uppercase font-bold tracking-wider ${
                  isLight
                    ? 'bg-white text-slate-500'
                    : 'bg-[#131926] text-slate-400'
                }`}
              >
                Or Continue With Google
              </span>
            </div>

            {/* SECTION: GOOGLE ACCOUNT SIGN-IN */}
            <div className="space-y-1.5 sm:space-y-2">
              {/* Primary Interactive Google Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || isLoading}
                className={`w-full py-2 sm:py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 border transition cursor-pointer shadow-xs active:scale-98 min-h-[38px] sm:min-h-[40px] disabled:opacity-60 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-slate-200/50'
                    : 'bg-[#161F33] hover:bg-[#1E293B] border-slate-700 text-white shadow-black/40'
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

              {/* Optional GSI Render Container (for users with GIS active) */}
              {isGoogleConfigured && (
                <div ref={googleButtonRef} className="flex justify-center w-full min-h-[0px]" />
              )}

              {/* Redirect Alternative if popup was blocked */}
              {showRedirectOption && (
                <div
                  className={`p-2 rounded-lg border text-xs flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in ${
                    isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-amber-950/60 border-amber-800 text-amber-200'
                  }`}
                >
                  <span className="text-[10px] sm:text-[10.5px] leading-tight text-center sm:text-left font-medium">
                    Popup blocked? Use standard browser redirect.
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleRedirectFlow}
                    className="btn-secondary !text-[10.5px] !py-0.5 !px-2 font-bold shrink-0"
                  >
                    Open Redirect Sign-In
                  </button>
                </div>
              )}

              {/* Domain & Credentials Diagnostics Banner */}
              <div
                className={`p-2 sm:p-2.5 rounded-lg border text-left text-xs space-y-1 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[10.5px] sm:text-[11px] text-purple-700 dark:text-purple-400">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Google OAuth Configuration</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfigGuide(!showConfigGuide)}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <span>{showConfigGuide ? 'Hide details' : 'Domain diagnostics'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className={`text-[9.5px] sm:text-[10px] space-y-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <p className="truncate">
                    Current origin: <code className="text-purple-700 dark:text-purple-300 font-mono">{activeOrigin || 'http://localhost:3000'}</code>
                  </p>
                  <p className="truncate">
                    Client ID: <span className="font-mono text-[9px] opacity-80">{googleClientId ? `${googleClientId.slice(0, 24)}...` : 'Not configured'}</span>
                  </p>
                </div>

                {showConfigGuide && (
                  <div className={`mt-1.5 pt-1.5 border-t text-[10.5px] space-y-1.5 ${isLight ? 'border-slate-200 text-slate-800' : 'border-slate-800 text-slate-300'}`}>
                    <p className="font-semibold text-[10px] sm:text-[10.5px]">
                      Required Google Cloud Console Settings:
                    </p>
                    <ol className={`list-decimal list-inside space-y-1 text-[9.5px] sm:text-[10px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <li>
                        Under <strong>Authorized JavaScript origins</strong>, ensure you have:
                        <div className="mt-0.5 font-mono text-[9px] sm:text-[9.5px] bg-slate-200 dark:bg-slate-800 p-1 rounded text-purple-800 dark:text-purple-300 break-all select-all">
                          {activeOrigin || 'http://localhost:3000'}
                        </div>
                      </li>
                      <li>
                        Under <strong>Authorized redirect URIs</strong>, add:
                        <div className="mt-0.5 font-mono text-[9px] sm:text-[9.5px] bg-slate-200 dark:bg-slate-800 p-1 rounded text-purple-800 dark:text-purple-300 break-all select-all">
                          {activeOrigin || 'http://localhost:3000'}
                        </div>
                      </li>
                      <li>
                        In your environment settings, ensure:
                        <div className="mt-0.5 font-mono text-[9px] sm:text-[9.5px] bg-slate-200 dark:bg-slate-800 p-1 rounded text-purple-800 dark:text-purple-300 break-all">
                          VITE_GOOGLE_CLIENT_ID={googleClientId || 'your-client-id.apps.googleusercontent.com'}
                        </div>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] border-t transition-colors font-medium shrink-0 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-600'
            : 'bg-[#111827] border-slate-800 text-slate-400'
        }`}
      >
        <p>EduPredict AI • Early Academic Warning &amp; Machine Learning Intervention Platform</p>
      </footer>
    </div>
  );
};

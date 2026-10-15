import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Key
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
    pendingRedirectSection,
    setCustomGoogleClientId
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
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  // Quick Client ID tester state
  const [customClientIdInput, setCustomClientIdInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const activeOrigin = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSaveCustomClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customClientIdInput.trim();
    if (!trimmed) {
      setCustomGoogleClientId('');
      setSaveStatus('Cleared developer Client ID override.');
      setErrorMessage(null);
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }
    if (!isValidGoogleClientId(trimmed)) {
      setErrorMessage(
        'Invalid Google Client ID format. It should look like: [numbers]-[string].apps.googleusercontent.com'
      );
      return;
    }
    setCustomGoogleClientId(trimmed);
    setSaveStatus('Google Client ID applied! Re-initializing Google Sign-In...');
    setErrorMessage(null);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Initialize and render Google Identity Services with active retry
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
                setErrorMessage(
                  `Authorized origin mismatch: "${activeOrigin}" is not registered in Google Cloud Console for client ID "${googleClientId}".`
                );
                setShowConfigGuide(true);
              } else if (err?.message?.includes('client') || err?.type === 'invalid_client') {
                setErrorMessage(`Invalid Google Client ID: "${googleClientId}" was not found by Google.`);
                setShowConfigGuide(true);
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
        'Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env / Vercel settings, or enter your Client ID in the configuration guide below.'
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
              if (tokenResponse.error === 'popup_closed_by_user') {
                setErrorMessage('Google Sign-In was cancelled or closed before completion.');
              } else if (tokenResponse.error === 'access_denied') {
                setErrorMessage('Google Sign-In access was denied by the user.');
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
            setErrorMessage('Google Sign-In popup could not open or was blocked. Try using the direct redirect flow.');
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
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
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
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
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
            <div className="space-y-2">
              {/* Official Google Identity Services Container when configured */}
              {isGoogleConfigured && (
                <div className="flex flex-col items-center justify-center w-full min-h-[42px]">
                  <div ref={googleButtonRef} className="flex justify-center w-full" />
                </div>
              )}

              {/* Styled Fallback / Default Google Button (used when awaiting config or while GIS script hydrates) */}
              {(!isGoogleConfigured || !isGsiReady) && (
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
                className={`p-2 sm:p-2.5 rounded-xl border text-left text-xs space-y-1.5 transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
                    <span className="font-bold text-[11px] text-purple-900 dark:text-purple-300">
                      Google OAuth Configuration
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${
                        isGoogleConfigured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isGoogleConfigured ? 'Configured' : 'Awaiting Client ID'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfigGuide(!showConfigGuide)}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <span>{showConfigGuide ? 'Hide diagnostics' : 'Setup & domain guide'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className={`text-[9.5px] sm:text-[10px] space-y-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      Active origin: <code className="text-purple-700 dark:text-purple-300 font-mono font-bold">{activeOrigin}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeOrigin, 'origin')}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer shrink-0"
                    >
                      {copiedKey === 'origin' ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedKey === 'origin' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="truncate">
                    Client ID: <span className="font-mono text-[9px] font-semibold">{isGoogleConfigured ? `${googleClientId.slice(0, 20)}...apps.googleusercontent.com` : 'Not configured'}</span>
                  </p>
                </div>

                {saveStatus && (
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold animate-in fade-in">
                    {saveStatus}
                  </div>
                )}

                {showConfigGuide && (
                  <div className={`mt-2 pt-2 border-t text-[10px] sm:text-[10.5px] space-y-2 ${isLight ? 'border-slate-200 text-slate-800' : 'border-slate-800 text-slate-300'}`}>
                    {/* Live Test Client ID Overrider */}
                    <form onSubmit={handleSaveCustomClientId} className="p-2 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-1.5">
                      <div className="flex items-center gap-1 font-bold text-purple-900 dark:text-purple-200 text-[10.5px]">
                        <Key className="w-3 h-3 text-purple-700 dark:text-purple-400" />
                        <span>Test Client ID in Current Session:</span>
                      </div>
                      <p className="text-[9.5px] text-slate-600 dark:text-slate-400 leading-tight">
                        Paste your Google OAuth Client ID to initialize and test Google Sign-In live without restarting the server:
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customClientIdInput}
                          onChange={(e) => setCustomClientIdInput(e.target.value)}
                          placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                          className="flex-1 px-2 py-1 text-[10px] font-mono rounded border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="btn-primary !text-[10px] !py-1 !px-2.5 font-bold cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                        {googleClientId && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomGoogleClientId('');
                              setCustomClientIdInput('');
                              setSaveStatus('Reset to default environment settings.');
                              setTimeout(() => setSaveStatus(null), 3000);
                            }}
                            className="btn-secondary !text-[10px] !py-1 !px-2 font-bold cursor-pointer shrink-0"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </form>

                    <p className="font-semibold text-[10.5px]">
                      Permanent Setup in Google Cloud Console &amp; Vercel:
                    </p>
                    <ol className={`list-decimal list-inside space-y-1.5 text-[9.5px] sm:text-[10px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <li>
                        Under <strong>Authorized JavaScript origins</strong> in Google Cloud Console, add:
                        <div className="mt-0.5 flex items-center justify-between gap-1 font-mono text-[9px] bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-purple-800 dark:text-purple-300">
                          <span className="truncate">{activeOrigin}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(activeOrigin, 'gcp-origin')}
                            className="text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                          >
                            {copiedKey === 'gcp-origin' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </li>
                      <li>
                        Under <strong>Authorized redirect URIs</strong> (for browser redirect flow), add:
                        <div className="mt-0.5 space-y-1">
                          <div className="flex items-center justify-between gap-1 font-mono text-[9px] bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-purple-800 dark:text-purple-300">
                            <span className="truncate">{activeOrigin}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(activeOrigin, 'gcp-uri1')}
                              className="text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                            >
                              {copiedKey === 'gcp-uri1' ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-1 font-mono text-[9px] bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-purple-800 dark:text-purple-300">
                            <span className="truncate">{activeOrigin}/login</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`${activeOrigin}/login`, 'gcp-uri2')}
                              className="text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                            >
                              {copiedKey === 'gcp-uri2' ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      </li>
                      <li>
                        In your <code>.env</code> file (or Vercel Environment Variables), set:
                        <div className="mt-0.5 flex items-center justify-between gap-1 font-mono text-[9px] bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-purple-800 dark:text-purple-300">
                          <span className="truncate">VITE_GOOGLE_CLIENT_ID={googleClientId || 'your-client-id.apps.googleusercontent.com'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`VITE_GOOGLE_CLIENT_ID=${googleClientId || 'your-client-id.apps.googleusercontent.com'}\nGOOGLE_CLIENT_ID=${googleClientId || 'your-client-id.apps.googleusercontent.com'}`, 'env-var')}
                            className="text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                          >
                            {copiedKey === 'env-var' ? 'Copied' : 'Copy'}
                          </button>
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

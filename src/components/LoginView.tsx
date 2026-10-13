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
    const maxAttempts = 15; // check for up to 4.5 seconds

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
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = '';
            const calcWidth = typeof window !== 'undefined'
              ? Math.min(360, Math.max(260, window.innerWidth - 64))
              : 300;

            window.google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              theme: isLight ? 'outline' : 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: calcWidth
            });
          }
          return true;
        } catch (e: any) {
          console.error('Failed to initialize Google Identity Services:', e);
          return false;
        }
      }
      return false;
    };

    const isReady = setupGsi();
    if (!isReady && googleClientId) {
      const interval = setInterval(() => {
        if (setupGsi() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId, isGoogleConfigured, isLight, loginGoogle, onSuccess, activeOrigin]);

  // Primary interactive Google Sign-In handler (OAuth 2.0 Popup & Token Client)
  const handleGoogleClick = () => {
    if (isGoogleLoading) return;
    setErrorMessage(null);

    if (!googleClientId) {
      setErrorMessage('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID.');
      setShowConfigGuide(true);
      return;
    }

    // Try Google OAuth2 token client first for clean popup behavior
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      setIsGoogleLoading(true);
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsGoogleLoading(false);
              if (tokenResponse.error === 'popup_closed_by_user') {
                setErrorMessage('Google sign-in was cancelled.');
              } else if (tokenResponse.error === 'access_denied') {
                setErrorMessage('Permission to access Google account was denied.');
              } else if (tokenResponse.error === 'origin_mismatch') {
                setErrorMessage(
                  `Origin mismatch: "${activeOrigin}" must be added to Authorized JavaScript Origins in Google Cloud Console.`
                );
                setShowConfigGuide(true);
              } else {
                setErrorMessage(`Google sign-in failed: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await loginGoogleAccessToken(tokenResponse.access_token);
                onSuccess(res.isNewUser);
              } catch (err: any) {
                setErrorMessage(err.message || 'Server failed to verify Google credentials.');
              } finally {
                setIsGoogleLoading(false);
              }
            } else {
              setIsGoogleLoading(false);
              setErrorMessage('No access token received from Google.');
            }
          },
          error_callback: (nonOAuthError: any) => {
            console.error('Google token client error:', nonOAuthError);
            setIsGoogleLoading(false);
            if (nonOAuthError?.type === 'popup_blocked') {
              setErrorMessage('Google Sign-In popup was blocked by your browser. You can use direct redirect login below.');
              setShowRedirectOption(true);
            } else if (nonOAuthError?.type === 'popup_closed') {
              setErrorMessage('Google sign-in popup was closed.');
            } else {
              setErrorMessage(
                `Google authentication error: ${nonOAuthError?.message || 'SDK failed'}. Ensure ${activeOrigin} is authorized in Google Cloud.`
              );
              setShowConfigGuide(true);
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        console.error('Failed to launch Google Token Client:', err);
        setIsGoogleLoading(false);
      }
    }

    // If OAuth2 SDK is not ready or failed, prompt standard ID prompt or offer redirect
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn('Google One Tap not displayed:', notification.getNotDisplayedReason());
            setShowRedirectOption(true);
          }
          if (notification.isSkippedMoment()) {
            console.warn('Google One Tap skipped:', notification.getSkippedReason());
          }
        });
      } catch (e) {
        setShowRedirectOption(true);
      }
    } else {
      setShowRedirectOption(true);
    }
  };

  // Direct OAuth 2.0 full-page redirect flow for browsers blocking popups or strict iframes
  const handleGoogleRedirectFlow = () => {
    if (!googleClientId) {
      setErrorMessage('Google Client ID is missing.');
      return;
    }
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
      className={`min-h-[100dvh] w-full flex flex-col justify-between antialiased overflow-x-hidden transition-colors ${
        isLight
          ? 'bg-[#F7F9FC] text-[#11182E]'
          : 'bg-[#090a0f] text-zinc-100'
      }`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b backdrop-blur-md ${
          isLight
            ? 'bg-white/95 border-[#E9E5F2]'
            : 'bg-[#090a0f]/90 border-zinc-800/80'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer min-h-[40px] ${
              isLight
                ? 'text-[#526581] hover:text-[#11182E]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowLeft className={`w-4 h-4 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
            <span>Return to Public Home</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span
            className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline ${
              isLight ? 'text-[#526581]' : 'text-zinc-500'
            }`}
          >
            Secure Student Portal
          </span>
        </div>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="flex-1 flex items-center justify-center p-3.5 sm:p-6 md:p-8 w-full">
        <div
          className={`w-full max-w-md rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all mx-auto ${
            isLight
              ? 'bg-white border-[#E9E5F2]'
              : 'bg-[#0d0f17] border-zinc-800/90'
          }`}
        >
          {/* Header Banner */}
          <div
            className={`p-5 sm:p-7 border-b relative ${
              isLight
                ? 'bg-gradient-to-b from-[#FFFFFF] to-[#F0F3F8] border-[#E9E5F2] text-[#11182E]'
                : 'bg-[#121522] border-zinc-800/80 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl text-white flex items-center justify-center font-extrabold shadow-lg shrink-0 ${
                  isLight
                    ? 'bg-gradient-to-tr from-[#8000E8] to-[#633BFF] shadow-[#8000E8]/25'
                    : 'bg-gradient-to-tr from-[#8000E8] to-[#633BFF] shadow-[#8000E8]/30'
                }`}
              >
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg sm:text-xl font-black tracking-tight ${isLight ? 'text-[#11182E]' : 'text-white'}`}>
                    EduPredict AI
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-[#8000E8]/10 text-[#8000E8] border-[#8000E8]/20'
                        : 'bg-[#8000E8]/25 text-purple-300 border-[#8000E8]/40'
                    }`}
                  >
                    Student Portal
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                  Secure Student Authentication & Longitudinal Profiles
                </p>
              </div>
            </div>

            {pendingRedirectSection && (
              <div
                className={`mt-4 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isLight
                    ? 'bg-[#8000E8]/10 border-[#8000E8]/25 text-[#11182E]'
                    : 'bg-purple-900/30 border-purple-500/30 text-purple-200'
                }`}
              >
                <Lock className={`w-4 h-4 shrink-0 ${isLight ? 'text-[#8000E8]' : 'text-purple-400'}`} />
                <span>
                  Please authenticate to access your <strong>{pendingRedirectSection}</strong> records.
                </span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-7 space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Primary Authentication Method Selector */}
            <div
              className={`grid grid-cols-2 p-1 rounded-2xl border ${
                isLight ? 'bg-[#F0F3F8] border-[#E9E5F2]' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('mobile');
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'mobile'
                    ? isLight
                      ? 'bg-white text-[#11182E] shadow-sm border border-[#E9E5F2]'
                      : 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/25'
                    : isLight
                    ? 'text-[#526581] hover:text-[#11182E]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Phone className={`w-3.5 h-3.5 ${authMethod === 'mobile' && isLight ? 'text-[#FF6B00]' : ''}`} />
                <span>Mobile & OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMethod === 'email'
                    ? isLight
                      ? 'bg-white text-[#11182E] shadow-sm border border-[#E9E5F2]'
                      : 'bg-zinc-800 text-white shadow-sm'
                    : isLight
                    ? 'text-[#526581] hover:text-[#11182E]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
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
              <div className="space-y-4">
                {/* Mode Switcher Tabs */}
                <div
                  className={`grid grid-cols-2 p-1 rounded-xl border ${
                    isLight
                      ? 'bg-[#F0F3F8] border-[#E9E5F2]'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      mode === 'signin'
                        ? isLight
                          ? 'bg-white text-[#11182E] shadow-xs'
                          : 'bg-zinc-800 text-white shadow-xs'
                        : isLight
                        ? 'text-[#526581] hover:text-[#11182E]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      mode === 'register'
                        ? isLight
                          ? 'bg-white text-[#11182E] shadow-xs'
                          : 'bg-zinc-800 text-white shadow-xs'
                        : isLight
                        ? 'text-[#526581] hover:text-[#11182E]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {mode === 'register' && (
                    <div>
                      <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                        Student Full Name
                      </label>
                      <div className="relative">
                        <User className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Shashikumar S."
                          className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                            isLight
                              ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                              : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                      Student Email Address
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@university.edu"
                        className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                          isLight
                            ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                            : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                      Account Password
                    </label>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                          isLight
                            ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                            : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] mt-1 block ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`}>
                      {mode === 'register' ? 'Minimum 6 characters' : 'Enter your student account password'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-98 min-h-[46px] bg-[#FF6B00] hover:bg-[#E05E00] shadow-[#FF6B00]/25 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>{mode === 'register' ? 'Create Student Profile' : 'Sign In with Email'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className={`absolute inset-0 flex items-center ${isLight ? 'border-t border-[#E9E5F2]' : 'border-t border-zinc-800'}`} />
              <span
                className={`relative px-3 text-[10px] uppercase font-bold tracking-wider ${
                  isLight
                    ? 'bg-white text-[#526581]'
                    : 'bg-[#0d0f17] text-zinc-400'
                }`}
              >
                Or Continue With Google
              </span>
            </div>

            {/* SECTION: GOOGLE ACCOUNT SIGN-IN */}
            <div className="space-y-3">
              {/* Primary Interactive Google Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || isLoading}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 border transition cursor-pointer shadow-sm active:scale-98 min-h-[46px] disabled:opacity-60 ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-[#E9E5F2] text-[#11182E] shadow-slate-200/50'
                    : 'bg-[#141724] hover:bg-[#1a1e30] border-zinc-700/80 text-white shadow-black/40'
                }`}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
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
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in ${
                    isLight
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <span className="text-[11px] leading-tight text-center sm:text-left">
                    Popup blocked or restricted? Use standard browser redirect.
                  </span>
                  <button
                    type="button"
                    onClick={handleGoogleRedirectFlow}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white text-[11px] font-bold hover:bg-[#E05E00] transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
                  >
                    Open Redirect Sign-In
                  </button>
                </div>
              )}

              {/* Domain & Credentials Diagnostics Banner */}
              <div
                className={`p-3 rounded-xl border text-left text-xs space-y-1.5 ${
                  isLight
                    ? 'bg-[#F0F3F8] border-[#E9E5F2]'
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#FF6B00]">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Google OAuth Configuration</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfigGuide(!showConfigGuide)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer"
                  >
                    <span>{showConfigGuide ? 'Hide details' : 'Domain diagnostics'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className={`text-[10px] space-y-0.5 ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                  <p className="truncate">
                    Current origin: <code className="text-[#FF6B00] font-mono">{activeOrigin || 'http://localhost:3000'}</code>
                  </p>
                  <p className="truncate">
                    Client ID: <span className="font-mono text-[9px] opacity-80">{googleClientId ? `${googleClientId.slice(0, 24)}...` : 'Not configured'}</span>
                  </p>
                </div>

                {showConfigGuide && (
                  <div className={`mt-2 pt-2 border-t text-[11px] space-y-2 ${isLight ? 'border-[#E9E5F2] text-[#11182E]' : 'border-zinc-800 text-zinc-300'}`}>
                    <p className="font-semibold text-[11px]">
                      Required Google Cloud Console Settings:
                    </p>
                    <ol className={`list-decimal list-inside space-y-1 text-[10px] leading-relaxed ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                      <li>
                        Under <strong>Authorized JavaScript origins</strong>, ensure you have:
                        <div className="mt-1 font-mono text-[10px] bg-black/10 dark:bg-black/30 p-1.5 rounded text-[#FF6B00] break-all select-all">
                          {activeOrigin || 'http://localhost:3000'}
                        </div>
                      </li>
                      <li>
                        Under <strong>Authorized redirect URIs</strong>, add:
                        <div className="mt-1 font-mono text-[10px] bg-black/10 dark:bg-black/30 p-1.5 rounded text-[#FF6B00] break-all select-all">
                          {activeOrigin || 'http://localhost:3000'}
                        </div>
                      </li>
                      <li>
                        In your environment settings, ensure:
                        <div className="mt-1 font-mono text-[10px] bg-black/10 dark:bg-black/30 p-1.5 rounded text-[#FF6B00] break-all">
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
        className={`py-4 text-center text-[11px] border-t transition-colors ${
          isLight
            ? 'bg-white border-[#E9E5F2] text-[#526581]'
            : 'bg-[#090a0f] border-zinc-800/80 text-zinc-500'
        }`}
      >
        <p>EduPredict AI • Early Academic Warning & Machine Learning Intervention Platform</p>
      </footer>
    </div>
  );
};

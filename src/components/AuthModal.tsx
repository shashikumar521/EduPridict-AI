import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  X,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MobileAuthFlow } from './MobileAuthFlow';

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

  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRedirectOption, setShowRedirectOption] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const activeOrigin = currentOrigin || (typeof window !== 'undefined' ? window.location.origin : '');

  // Initialize Google Identity Services button with retry loop
  useEffect(() => {
    if (!isOpen) return;

    let attempts = 0;
    const maxAttempts = 15;

    const setupGsi = () => {
      attempts++;
      if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
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
                  setErrorMessage(err.message || 'Google authentication failed');
                } finally {
                  setIsGoogleLoading(false);
                }
              }
            },
            error_callback: (err: any) => {
              console.warn('Google Identity error in modal:', err);
              if (err?.message?.includes('origin') || err?.type === 'origin_mismatch') {
                setErrorMessage(
                  `Authorized origin mismatch: "${activeOrigin}" is not registered in Google Cloud Console.`
                );
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = '';
            const calcWidth = typeof window !== 'undefined'
              ? Math.min(320, Math.max(240, window.innerWidth - 80))
              : 280;

            window.google.accounts.id.renderButton(googleButtonRef.current, {
              type: 'standard',
              theme: 'outline',
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
  }, [isOpen, googleClientId, loginGoogle, onSuccess, activeOrigin]);

  const handleGoogleClick = () => {
    if (isGoogleLoading) return;
    setErrorMessage(null);

    if (!googleClientId) {
      setErrorMessage('Google Client ID is not configured.');
      return;
    }

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
                setErrorMessage('Permission was denied.');
              } else if (tokenResponse.error === 'origin_mismatch') {
                setErrorMessage(`Origin mismatch: Ensure "${activeOrigin}" is authorized in Google Cloud Console.`);
              } else {
                setErrorMessage(`Google sign-in error: ${tokenResponse.error_description || tokenResponse.error}`);
              }
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const res = await loginGoogleAccessToken(tokenResponse.access_token);
                if (onSuccess) onSuccess(res.isNewUser);
              } catch (err: any) {
                setErrorMessage(err.message || 'Server failed to verify Google account.');
              } finally {
                setIsGoogleLoading(false);
              }
            } else {
              setIsGoogleLoading(false);
              setErrorMessage('No token received from Google.');
            }
          },
          error_callback: (nonOAuthError: any) => {
            setIsGoogleLoading(false);
            if (nonOAuthError?.type === 'popup_blocked') {
              setErrorMessage('Popup blocked. Use redirect authentication instead.');
              setShowRedirectOption(true);
            } else {
              setErrorMessage(nonOAuthError?.message || 'Google OAuth failed.');
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err: any) {
        setIsGoogleLoading(false);
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
        className="bg-[#0d0f17] rounded-2xl sm:rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full max-h-[92dvh] overflow-y-auto custom-scrollbar transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#121522] border-b border-zinc-800/80 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8000E8] to-[#633BFF] flex items-center justify-center text-white font-extrabold shadow-md shadow-[#8000E8]/25 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">EduPredict AI</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Sign in to access your private academic records & forecasts
              </p>
            </div>
          </div>

          {pendingRedirectSection && (
            <div className="mt-3 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 text-purple-400" />
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
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Primary Authentication Method Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('mobile');
                setErrorMessage(null);
              }}
              className={`py-2 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'mobile'
                  ? 'bg-[#FF6B00] text-white font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile & OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage(null);
              }}
              className={`py-2 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === 'email'
                  ? 'bg-zinc-800 text-white font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* OPTION 1: MOBILE NUMBER & OTP */}
          {authMethod === 'mobile' && (
            <MobileAuthFlow
              onSuccess={(isNew) => {
                if (onSuccess) onSuccess(isNew);
              }}
              onSwitchToEmail={() => setAuthMethod('email')}
            />
          )}

          {/* OPTION 2: EMAIL & PASSWORD */}
          {authMethod === 'email' && (
            <div className="space-y-3.5">
              {/* Mode Switch Tabs */}
              <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-lg transition cursor-pointer min-h-[36px] ${
                    mode === 'signin'
                      ? 'bg-zinc-800 text-white font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
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
                      ? 'bg-zinc-800 text-white font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {mode === 'register' && (
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">
                      Student Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Shashikumar S."
                        className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] font-medium min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Student Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] font-medium min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] font-medium min-h-[44px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#FF6B00] hover:bg-[#E05E00] disabled:bg-[#FF6B00]/50 text-white flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/25 transition cursor-pointer active:scale-98 min-h-[46px]"
                >
                  {isLoading ? (
                    <span>Verifying credentials...</span>
                  ) : (
                    <>
                      <span>{mode === 'register' ? 'Register Student Profile' : 'Sign In with Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#0d0f17] px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider absolute">
              or Google identity
            </span>
          </div>

          {/* Google Sign In Container */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 border border-zinc-700/80 bg-[#141724] hover:bg-[#1a1e30] text-white transition cursor-pointer active:scale-98 min-h-[44px] disabled:opacity-60 shadow-sm"
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {isGoogleConfigured && (
              <div ref={googleButtonRef} className="flex justify-center w-full min-h-[0px]" />
            )}

            {showRedirectOption && (
              <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between gap-2">
                <span className="text-[11px]">Popup blocked?</span>
                <button
                  type="button"
                  onClick={handleGoogleRedirectFlow}
                  className="px-2.5 py-1 rounded bg-[#FF6B00] text-white text-[11px] font-bold hover:bg-[#E05E00] cursor-pointer"
                >
                  Redirect Sign-In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

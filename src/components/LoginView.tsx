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
  ExternalLink
} from 'lucide-react';
import { SectionId } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

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
    loginEmail,
    registerEmail,
    googleClientId,
    isGoogleConfigured,
    pendingRedirectSection
  } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services button
  useEffect(() => {
    const setupGsi = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setIsLoading(true);
                setErrorMessage(null);
                try {
                  const res = await loginGoogle(response.credential);
                  onSuccess(res.isNewUser);
                } catch (err: any) {
                  setErrorMessage(err.message || 'Google authentication failed');
                } finally {
                  setIsLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = '';
            const calcWidth = typeof window !== 'undefined'
              ? Math.min(320, Math.max(240, window.innerWidth - 64))
              : 280;

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
        } catch (e: any) {
          console.error('Failed to initialize Google Identity Services:', e);
          setErrorMessage('Failed to initialize Google Sign-In SDK: ' + (e.message || 'Unknown error'));
        }
      }
    };

    setupGsi();
  }, [googleClientId, isGoogleConfigured, isLight, loginGoogle, onSuccess]);

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

            {/* SECTION 1: GOOGLE ACCOUNT SIGN-IN */}
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className={`text-xs font-bold ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                  Instant Google Sign-In
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? 'text-[#8000E8] bg-[#8000E8]/10 border-[#8000E8]/20'
                      : 'text-purple-300 bg-purple-500/15 border-purple-500/30'
                  }`}
                >
                  Recommended
                </span>
              </div>

              {/* Real Google Identity Services Button */}
              <div className="flex justify-center min-h-[46px] items-center">
                {isGoogleConfigured ? (
                  <div ref={googleButtonRef} className="flex justify-center w-full" />
                ) : (
                  <div
                    className={`w-full p-4 rounded-xl border text-left text-xs space-y-2 ${
                      isLight
                        ? 'bg-[#F0F3F8] border-[#E9E5F2]'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className={`flex items-center gap-2 font-bold ${isLight ? 'text-[#8000E8]' : 'text-purple-300'}`}>
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Google OAuth Configuration</span>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                      To activate official Google Sign-In, configure <code className={isLight ? 'text-[#8000E8]' : 'text-purple-300'}>VITE_GOOGLE_CLIENT_ID</code> in environment settings.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowConfigGuide(!showConfigGuide)}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer ${
                        isLight ? 'text-[#8000E8] hover:text-[#6a00c2]' : 'text-purple-300 hover:text-purple-200'
                      }`}
                    >
                      <span>{showConfigGuide ? 'Hide instructions' : 'View Google Cloud & Vercel setup instructions'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {showConfigGuide && (
                      <div className={`mt-2 pt-2 border-t text-[11px] space-y-2 ${isLight ? 'border-[#E9E5F2] text-[#11182E]' : 'border-zinc-800 text-zinc-300'}`}>
                        <p className="font-semibold">
                          Configuration Steps for Google Cloud & Vercel:
                        </p>
                        <ol className={`list-decimal list-inside space-y-1 text-[10px] ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                          <li>Go to <strong>APIs & Services &gt; Credentials</strong> in Google Cloud Console.</li>
                          <li>Select your <strong>OAuth 2.0 Web Client</strong>.</li>
                          <li>
                            Under <strong>Authorized JavaScript origins</strong>, ensure both origins are added:
                            <code className={`block mt-0.5 p-1 rounded font-mono text-[9px] select-all break-all ${isLight ? 'bg-white text-[#8000E8] border border-[#E9E5F2]' : 'bg-black/40 text-purple-300'}`}>
                              https://edu-pridict-ai.vercel.app
                            </code>
                            <code className={`block mt-0.5 p-1 rounded font-mono text-[9px] select-all break-all ${isLight ? 'bg-white text-[#526581] border border-[#E9E5F2]' : 'bg-black/40 text-zinc-300'}`}>
                              http://localhost:3000
                            </code>
                          </li>
                          <li>In Vercel, go to <strong>Project &gt; Settings &gt; Environment Variables</strong> and add:</li>
                          <code className={`block mt-0.5 p-1 rounded font-mono text-[9px] text-emerald-600 dark:text-emerald-400 select-all break-all ${isLight ? 'bg-white border border-[#E9E5F2]' : 'bg-black/40'}`}>
                            VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                          </code>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className={`absolute inset-0 flex items-center ${isLight ? 'border-t border-[#E9E5F2]' : 'border-t border-zinc-800'}`} />
              <span
                className={`relative px-3 text-[10px] uppercase font-bold tracking-wider ${
                  isLight
                    ? 'bg-white text-[#526581]'
                    : 'bg-[#0d0f17] text-zinc-400'
                }`}
              >
                Or Email Credentials
              </span>
            </div>

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
                          ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
                          : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
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
                        ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
                        : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
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
                        ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
                        : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8]'
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
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-98 min-h-[46px] ${
                  isLight
                    ? 'bg-[#8000E8] hover:bg-[#6a00c2] shadow-[#8000E8]/25 disabled:bg-[#8000E8]/50'
                    : 'bg-[#8000E8] hover:bg-[#9226ff] disabled:bg-[#8000E8]/50 shadow-[#8000E8]/30'
                }`}
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'register' ? 'Create Student Profile' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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

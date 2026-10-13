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
    let timeoutId: any = null;

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
              theme: 'outline',
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
    timeoutId = setTimeout(setupGsi, 600);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [googleClientId, loginGoogle, onSuccess]);

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

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-800 flex flex-col justify-between antialiased overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-200/90 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition cursor-pointer min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Home</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Secure Portal
          </span>
        </div>
      </header>

      {/* Main Login / Register Card Container */}
      <main className="flex-1 flex items-center justify-center p-3.5 sm:p-6 md:p-8 w-full">
        <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all mx-auto">
          {/* Header Banner */}
          <div className="p-5 sm:p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-extrabold shadow-inner shrink-0">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight">EduPredict AI</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Student Portal
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Secure Student Authentication & Longitudinal Profiles
                </p>
              </div>
            </div>

            {pendingRedirectSection && (
              <div className="mt-4 p-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-indigo-100 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-300" />
                <span>
                  Please authenticate to access your <strong>{pendingRedirectSection}</strong> records.
                </span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* SECTION 1: GOOGLE ACCOUNT SIGN-IN */}
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Instant Google Sign-In
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Recommended
                </span>
              </div>

              {/* Real Google Identity Services Button */}
              <div className="flex justify-center min-h-[46px] items-center">
                {isGoogleConfigured ? (
                  <div ref={googleButtonRef} className="flex justify-center w-full" />
                ) : (
                  <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Google OAuth Configuration</span>
                    </div>

                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      To activate official Google Sign-In, configure <code>VITE_GOOGLE_CLIENT_ID</code> in your Vercel Project Settings (or <code>.env</code> locally).
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowConfigGuide(!showConfigGuide)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      <span>{showConfigGuide ? 'Hide instructions' : 'View Google Cloud & Vercel setup instructions'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {showConfigGuide && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-slate-700 space-y-2">
                        <p className="font-semibold text-slate-900">
                          Configuration Steps for Google Cloud & Vercel:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-600">
                          <li>Go to <strong>APIs & Services &gt; Credentials</strong> in Google Cloud Console.</li>
                          <li>Select your <strong>OAuth 2.0 Web Client</strong>.</li>
                          <li>
                            Under <strong>Authorized JavaScript origins</strong>, ensure both origins are added:
                            <code className="block mt-0.5 bg-slate-100 p-1 rounded font-mono text-[9px] text-indigo-600 select-all break-all">
                              https://edu-pridict-ai.vercel.app
                            </code>
                            <code className="block mt-0.5 bg-slate-100 p-1 rounded font-mono text-[9px] text-slate-600 select-all break-all">
                              http://localhost:3000
                            </code>
                          </li>
                          <li>In Vercel, go to <strong>Project &gt; Settings &gt; Environment Variables</strong> and add:</li>
                          <code className="block mt-0.5 bg-slate-100 p-1 rounded font-mono text-[9px] text-emerald-600 select-all break-all">
                            VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
                          </code>
                          <li className="text-[9px] text-slate-500">Note: Redeploy on Vercel after setting environment variables so Vite embeds it into the production build.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Visual Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                or sign in with email
              </span>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition cursor-pointer min-h-[36px] ${
                  mode === 'signin'
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
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
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'register' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shashikumar S."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium min-h-[44px]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {mode === 'register' ? 'Minimum 6 characters' : 'Enter your student account password'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-98 min-h-[46px]"
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
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200/80 bg-white/60">
        <p>EduPredict AI • Early Academic Warning & Machine Learning Intervention Platform</p>
      </footer>
    </div>
  );
};

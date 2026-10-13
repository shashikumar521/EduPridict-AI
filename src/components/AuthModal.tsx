import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    loginEmail,
    registerEmail,
    googleClientId,
    isGoogleConfigured,
    pendingRedirectSection
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services button
  useEffect(() => {
    if (!isOpen) return;

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
                  if (onSuccess) onSuccess(res.isNewUser);
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
        } catch (e: any) {
          console.error('Failed to initialize Google Identity Services:', e);
        }
      }
    };

    // Attempt immediately and retry if GIS script is loading
    setupGsi();
    timeoutId = setTimeout(setupGsi, 600);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, googleClientId, loginGoogle, onSuccess]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[92dvh] overflow-y-auto custom-scrollbar transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-extrabold shadow-inner shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">EduPredict AI</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                  Student Portal
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Sign in to access your private academic records & forecasts
              </p>
            </div>
          </div>

          {pendingRedirectSection && (
            <div className="mt-3 p-2 rounded-xl bg-white/10 border border-white/15 text-[11px] text-indigo-100 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>
                Please sign in to view <strong>{pendingRedirectSection}</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Google Sign In Container */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center min-h-[44px] items-center">
              {isGoogleConfigured ? (
                <div ref={googleButtonRef} className="flex justify-center w-full" />
              ) : (
                <div className="w-full p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Google Sign-In Configuration Required</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    To enable official Google Sign-In, set <code>VITE_GOOGLE_CLIENT_ID</code> in your Vercel Project Settings (or <code>.env</code> locally). Authorized origin: <code>https://edu-pridict-ai.vercel.app</code>. You can also sign in or register below with student email.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              or use student email
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-98 min-h-[46px]"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Register Student Profile' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

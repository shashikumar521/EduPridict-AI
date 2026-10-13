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
        <div className="p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMessage}</div>
            </div>
          )}

          {/* Google Sign In Container */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center min-h-[44px] items-center">
              {isGoogleConfigured ? (
                <div ref={googleButtonRef} className="flex justify-center w-full" />
              ) : (
                <div className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-left text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-purple-300">
                    <Info className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Google Sign-In Configuration</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    To enable Google Sign-In, configure <code className="text-purple-300">VITE_GOOGLE_CLIENT_ID</code>. You can also sign in or register below with student email.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#0d0f17] px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider absolute">
              or use student email
            </span>
          </div>

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
                  ? 'bg-[#8000E8] text-white font-bold shadow-xs'
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
                  ? 'bg-[#8000E8] text-white font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
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
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8] font-medium min-h-[44px]"
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
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8] font-medium min-h-[44px]"
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
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#8000E8] focus:ring-1 focus:ring-[#8000E8] font-medium min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#8000E8] hover:bg-[#6a00c2] disabled:bg-[#8000E8]/50 text-white flex items-center justify-center gap-2 shadow-lg shadow-[#8000E8]/25 transition cursor-pointer active:scale-98 min-h-[46px]"
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

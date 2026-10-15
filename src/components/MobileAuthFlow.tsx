import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Info,
  ChevronDown,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_CODES, CountryCode } from '../data/countryCodes';

interface MobileAuthFlowProps {
  onSuccess: (isNewUser: boolean) => void;
  onSwitchToEmail?: () => void;
}

export const MobileAuthFlow: React.FC<MobileAuthFlowProps> = ({
  onSuccess,
  onSwitchToEmail
}) => {
  const {
    sendOtp,
    verifyOtp,
    registerPhone,
    linkPhone,
    smsConfig,
    refreshAuthConfig
  } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Step state: 'enter_phone' | 'enter_otp' | 'register_profile'
  const [step, setStep] = useState<'enter_phone' | 'enter_otp' | 'register_profile'>('enter_phone');

  // Phone input states
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // Default India (+91)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');

  // OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);

  // Registration / Account Linking states
  const [verificationToken, setVerificationToken] = useState('');
  const [registerMode, setRegisterMode] = useState<'new_student' | 'link_account'>('new_student');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');

  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const fullPhoneNumber = `${selectedCountry.code}${phoneNumber.replace(/\D/g, '')}`;

  const filteredCountries = COUNTRY_CODES.filter((c) => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q)
    );
  });

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (!cleanNum || cleanNum.length < 6) {
      setErrorMessage('Please enter a valid mobile number with at least 6 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(fullPhoneNumber);
      setMaskedPhone(res.maskedPhone || fullPhoneNumber);
      setSuccessMessage(res.message || 'OTP verification code sent successfully via SMS.');
      setStep('enter_otp');
      setCooldown(res.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);

      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP verification SMS. Please check server config.');
      if (err.message?.includes('credentials') || err.message?.includes('Twilio')) {
        setShowSetupGuide(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    const targetIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // Step 2 Submit: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(fullPhoneNumber, code);

      if (res.isNewUser && res.verificationToken) {
        setVerificationToken(res.verificationToken);
        setStep('register_profile');
        setSuccessMessage('Mobile number verified! Please complete your student profile.');
      } else {
        onSuccess(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Register or Link
  const handleRegisterOrLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (registerMode === 'new_student') {
        if (!studentName.trim()) {
          throw new Error('Please enter your full student name.');
        }
        await registerPhone(verificationToken, studentName.trim(), studentEmail.trim() || undefined);
        onSuccess(true);
      } else {
        if (!studentEmail.trim() || !linkPassword) {
          throw new Error('Please provide your existing account email and password.');
        }
        await linkPhone(verificationToken, studentEmail.trim(), linkPassword);
        onSuccess(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete registration. Please verify details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* SMS Configuration Status Notice */}
      {!smsConfig?.isConfigured && (
        <div
          className={`p-2 sm:p-2.5 rounded-lg border text-xs space-y-1.5 ${
            isLight
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-amber-950/60 border-amber-800 text-amber-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5 min-w-0">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-snug text-[10.5px] sm:text-[11px]">
                <span className="font-bold">SMS Service Status:</span>{' '}
                <span>
                  Twilio credentials not configured in <code className="font-mono bg-black/10 px-1 rounded text-[10px]">.env</code>.
                  Testing OTP is enabled for verification.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[10px] sm:text-[10.5px] font-bold text-purple-700 dark:text-purple-400 hover:underline shrink-0 cursor-pointer pt-0.5"
            >
              {showSetupGuide ? 'Hide' : 'Setup guide'}
            </button>
          </div>

          {showSetupGuide && (
            <div className="pt-1.5 border-t border-amber-300/40 text-[10px] space-y-1 leading-normal">
              <p className="font-bold">To deliver live SMS via Twilio Verify, add to <code className="font-mono">.env</code>:</p>
              <div className="bg-black/10 dark:bg-black/40 p-1.5 rounded font-mono text-[9px] space-y-0.5 select-all">
                <div>TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
                <div>TWILIO_AUTH_TOKEN=your_auth_token</div>
                <div>TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-2 sm:p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex-1 leading-snug font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Global Success Banner */}
      {successMessage && !errorMessage && (
        <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1 leading-snug font-medium">{successMessage}</div>
        </div>
      )}

      {/* STEP 1: ENTER MOBILE NUMBER */}
      {step === 'enter_phone' && (
        <form onSubmit={handleSendOtp} className="space-y-2.5 text-xs">
          <div>
            <label className={`block font-bold mb-1 text-[11px] sm:text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Student Mobile Number
            </label>

            <div className="flex items-stretch gap-1.5 sm:gap-2">
              <div className="relative" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className={`h-10 min-h-[40px] px-2.5 rounded-lg border flex items-center gap-1 font-semibold transition cursor-pointer select-none ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      : 'bg-[#161F33] border-slate-700 text-white hover:bg-slate-800'
                  }`}
                  aria-label="Select Country Code"
                >
                  <span className="text-sm leading-none">{selectedCountry.flag}</span>
                  <span className="text-xs font-mono font-bold">{selectedCountry.code}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                {isCountryDropdownOpen && (
                  <div
                    className={`absolute z-50 left-0 top-full mt-1 w-64 max-h-56 rounded-xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-[#161F33] border-slate-700 text-white'
                    }`}
                  >
                    <div className="p-2 border-b border-inherit">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country or code..."
                        className={`w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none ${
                          isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-white'
                        }`}
                        autoFocus
                      />
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1 py-1">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.name + country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setIsCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                            selectedCountry.code === country.code && selectedCountry.name === country.name
                              ? 'bg-purple-100 text-purple-900 font-bold dark:bg-purple-950/70 dark:text-purple-300'
                              : isLight
                              ? 'hover:bg-slate-100 text-slate-800'
                              : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{country.flag}</span>
                            <span className="truncate">{country.name}</span>
                          </div>
                          <span className="font-mono text-[11px] opacity-75 shrink-0 ml-2 font-bold">
                            {country.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <Phone className={`w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={selectedCountry.formatPlaceholder}
                  className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs font-medium h-10 min-h-[40px] border focus:outline-none transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            <p className={`text-[10px] sm:text-[10.5px] mt-1 font-medium leading-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {selectedCountry.code === '+91'
                ? 'Standard 10-digit Indian mobile number (e.g. 98765 43210).'
                : `Enter your ${selectedCountry.name} mobile number without country code.`}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !phoneNumber.trim()}
            className="btn-primary w-full py-2 sm:py-2.5 px-3.5 text-xs sm:text-sm font-bold gap-2 min-h-[38px] sm:min-h-[40px] rounded-xl cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white">Sending OTP Code...</span>
              </div>
            ) : (
              <>
                <span className="text-white">Continue with OTP</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </>
            )}
          </button>

          <p className={`text-[9.5px] sm:text-[10px] text-center leading-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            By continuing, you agree to receive a 6-digit verification code via SMS. Standard carrier SMS and data rates may apply.
          </p>

          {onSwitchToEmail && (
            <div className="pt-0.5 text-center">
              <button
                type="button"
                onClick={onSwitchToEmail}
                className={`text-[11px] font-semibold hover:underline cursor-pointer ${
                  isLight ? 'text-purple-700 hover:text-purple-900' : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                Prefer email? Continue with email address →
              </button>
            </div>
          )}
        </form>
      )}

      {/* STEP 2: ENTER 6-DIGIT OTP */}
      {step === 'enter_otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-2.5 sm:space-y-3 text-xs animate-in fade-in">
          <div
            className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-800/80 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
              <div>
                <p className="text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Verification Code Sent
                </p>
                <p className="text-xs font-mono font-bold">{maskedPhone || fullPhoneNumber}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('enter_phone');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Edit number
            </button>
          </div>

          <div>
            <label className={`block font-bold mb-1.5 text-center text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Enter 6-Digit Verification Code
            </label>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className={`w-9.5 h-11 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold font-mono rounded-lg border transition focus:outline-none select-all ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/25'
                      : 'bg-[#161F33] border-slate-700 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                  } ${digit ? 'border-purple-600/60 dark:border-purple-400/60' : ''}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || otpDigits.join('').length !== 6}
            className="btn-primary w-full py-2 sm:py-2.5 px-3.5 text-xs sm:text-sm font-bold gap-2 min-h-[38px] sm:min-h-[40px] rounded-xl cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white">Verifying Code...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span className="text-white">Verify OTP & Sign In</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => {
                setStep('enter_phone');
                setErrorMessage(null);
              }}
              className={`inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to number</span>
            </button>

            <button
              type="button"
              disabled={cooldown > 0 || isLoading}
              onClick={() => handleSendOtp()}
              className={`inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer transition ${
                cooldown > 0
                  ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'text-purple-700 dark:text-purple-400 hover:underline'
              }`}
            >
              <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: NEW STUDENT REGISTRATION OR LINK ACCOUNT */}
      {step === 'register_profile' && (
        <form onSubmit={handleRegisterOrLink} className="space-y-2.5 sm:space-y-3 text-xs animate-in fade-in">
          <div
            className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-between ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Verified Mobile
                </p>
                <p className="text-xs font-mono font-bold">{fullPhoneNumber}</p>
              </div>
            </div>
            <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
              Verified
            </span>
          </div>

          <div
            className={`grid grid-cols-2 p-0.5 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setRegisterMode('new_student');
                setErrorMessage(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                registerMode === 'new_student'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'bg-slate-800 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Student Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisterMode('link_account');
                setErrorMessage(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                registerMode === 'link_account'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'bg-slate-800 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Link Existing Account</span>
            </button>
          </div>

          {registerMode === 'new_student' && (
            <div className="space-y-2.5">
              <div>
                <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Student Full Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className={`w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Shashikumar S."
                    className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                        : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Email Address <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className={`w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                        : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                  />
                </div>
              </div>

              <p className={`text-[10px] sm:text-[10.5px] leading-tight font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Next, you can specify your degree, syllabus, and college in the personalized onboarding step.
              </p>
            </div>
          )}

          {registerMode === 'link_account' && (
            <div className="space-y-2.5">
              <div
                className={`p-2 rounded-lg border text-[10.5px] leading-snug ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-blue-950/40 border-blue-800/70 text-blue-300'
                }`}
              >
                Already have an EduPredict AI email account? Enter your email credentials to attach this mobile number and preserve all previous academic predictions, goals, and history.
              </div>

              <div>
                <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Existing Account Email
                </label>
                <div className="relative">
                  <Mail className={`w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                        : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  Existing Password
                </label>
                <div className="relative">
                  <Lock className={`w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    required
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-lg pl-8 pr-3 py-2 text-xs font-medium h-10 min-h-[38px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20'
                        : 'bg-[#161F33] border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2 sm:py-2.5 px-3.5 text-xs sm:text-sm font-bold gap-2 min-h-[38px] sm:min-h-[40px] rounded-xl cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white">Processing...</span>
              </div>
            ) : (
              <>
                <span className="text-white">{registerMode === 'new_student' ? 'Complete Profile & Enter' : 'Link Mobile & Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

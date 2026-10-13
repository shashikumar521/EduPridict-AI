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

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Filter countries for dropdown search
  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch)
  );

  // Full E.164 phone number
  const fullPhoneNumber = `${selectedCountry.code}${phoneNumber.replace(/\D/g, '')}`;

  // -------------------------------------------------------------
  // STEP 1: SEND OTP
  // -------------------------------------------------------------
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    if (selectedCountry.code === '+91') {
      if (cleanDigits.length !== 10) {
        setErrorMessage('Indian mobile numbers must be exactly 10 digits.');
        return;
      }
      if (!/^[6-9]/.test(cleanDigits)) {
        setErrorMessage('Indian mobile numbers must begin with 6, 7, 8, or 9.');
        return;
      }
    } else if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      setErrorMessage('Please enter a valid mobile number (7–15 digits).');
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendOtp(fullPhoneNumber);
      setMaskedPhone(res.maskedPhone || `${selectedCountry.code} ${cleanDigits.slice(0, 2)}*** ***${cleanDigits.slice(-2)}`);
      setCooldown(res.cooldownSeconds || 60);
      setSuccessMessage(res.message || `OTP sent successfully to ${fullPhoneNumber}`);
      setStep('enter_otp');
      setOtpDigits(['', '', '', '', '', '']);

      // Focus first OTP input on step change
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please verify your mobile number.');
      if (err.cooldownSeconds) {
        setCooldown(err.cooldownSeconds);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2: VERIFY OTP
  // -------------------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // User pasted multiple characters into a single input box
      const pastedChars = cleaned.slice(0, 6).split('');
      pastedChars.forEach((ch, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = ch;
        }
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + pastedChars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleaned;
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        // Move to previous input and clear it
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    const chars = pasted.slice(0, 6).split('');
    const newDigits = [...otpDigits];
    chars.forEach((ch, i) => {
      newDigits[i] = ch;
    });
    setOtpDigits(newDigits);
    const lastFilled = Math.min(chars.length, 5);
    otpInputRefs.current[lastFilled]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOtp(fullPhoneNumber, fullCode);

      if (result.status === 'success' && result.user) {
        // Existing student authenticated!
        setSuccessMessage('Verification successful! Accessing your student portal...');
        onSuccess(Boolean(result.isNewUser));
      } else if (result.status === 'verified_new_user' && result.verificationToken) {
        // Brand new mobile number -> Proceed to profile setup or account linking
        setVerificationToken(result.verificationToken);
        setStep('register_profile');
        setSuccessMessage('Mobile number verified! Please complete your student profile.');
      } else {
        throw new Error('Unexpected verification response');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: NEW STUDENT REGISTRATION OR ACCOUNT LINKING
  // -------------------------------------------------------------
  const handleRegisterOrLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (registerMode === 'new_student') {
        if (!studentName.trim()) {
          throw new Error('Please enter your full student name.');
        }
        const res = await registerPhone(
          verificationToken,
          studentName.trim(),
          studentEmail.trim() || undefined
        );
        setSuccessMessage('Registration successful! Launching workspace...');
        onSuccess(res.isNewUser);
      } else {
        // Link to existing account
        if (!studentEmail.trim() || !linkPassword) {
          throw new Error('Please enter your existing account email and password.');
        }
        const res = await linkPhone(
          verificationToken,
          studentEmail.trim().toLowerCase(),
          linkPassword
        );
        setSuccessMessage('Account linked successfully! Welcome back.');
        onSuccess(res.isNewUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Provider Setup Warning (When SMS credentials are not configured) */}
      {!smsConfig.isConfigured && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2.5 transition ${
            isLight
              ? 'bg-amber-500/10 border-amber-500/25 text-[#11182E]'
              : 'bg-amber-950/25 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>SMS Authentication Provider Setup</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{showSetupGuide ? 'Hide details' : 'View instructions'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSetupGuide ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
            To deliver live SMS OTPs to real student mobile numbers, configure your <strong>Twilio Verify</strong> credentials in the server environment.
          </p>

          {showSetupGuide && (
            <div
              className={`p-3 rounded-lg border text-[11px] space-y-2 font-sans ${
                isLight ? 'bg-white border-amber-500/20 text-[#11182E]' : 'bg-black/50 border-amber-500/30 text-zinc-200'
              }`}
            >
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                Setup Twilio Verify (Recommended):
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[10px] text-zinc-600 dark:text-zinc-300">
                <li>Create a free Twilio account at <strong>twilio.com</strong>.</li>
                <li>Go to <strong>Verify &gt; Services</strong> and create a Verification Service named <em>EduPredict AI</em>.</li>
                <li>Add these variables into your project’s environment configuration:</li>
              </ol>
              <div className="font-mono text-[10px] p-2 rounded bg-black/80 text-amber-300 border border-amber-500/30 space-y-0.5 select-all break-all">
                <div>TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
                <div>TWILIO_AUTH_TOKEN=your_twilio_auth_token</div>
                <div>TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-zinc-500">
                  Standard Twilio SMS phone numbers are also supported via <code className="text-amber-500">TWILIO_PHONE_NUMBER</code>.
                </span>
                <button
                  type="button"
                  onClick={refreshAuthConfig}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Check status
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 leading-snug">{errorMessage}</div>
        </div>
      )}

      {/* Global Success Banner */}
      {successMessage && !errorMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
          <div className="flex-1 leading-snug">{successMessage}</div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: ENTER MOBILE NUMBER                                */}
      {/* ========================================================= */}
      {step === 'enter_phone' && (
        <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
              Student Mobile Number
            </label>

            {/* Input group with country code picker */}
            <div className="flex items-stretch gap-2">
              {/* Country Code Dropdown Trigger */}
              <div className="relative" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className={`h-full min-h-[44px] px-3 rounded-xl border flex items-center gap-1.5 font-semibold transition cursor-pointer select-none ${
                    isLight
                      ? 'bg-white border-[#E9E5F2] text-[#11182E] hover:bg-slate-50'
                      : 'bg-zinc-900/90 border-zinc-800 text-white hover:bg-zinc-800'
                  }`}
                  aria-label="Select Country Code"
                >
                  <span className="text-base leading-none">{selectedCountry.flag}</span>
                  <span className="text-xs font-mono">{selectedCountry.code}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                </button>

                {/* Country Code Dropdown List */}
                {isCountryDropdownOpen && (
                  <div
                    className={`absolute z-50 left-0 top-full mt-1.5 w-64 max-h-60 rounded-xl border shadow-2xl overflow-hidden flex flex-col animate-in fade-in ${
                      isLight
                        ? 'bg-white border-[#E9E5F2] text-[#11182E]'
                        : 'bg-[#121522] border-zinc-800 text-white'
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
                            ? 'bg-slate-50 border-[#E9E5F2] text-[#11182E]'
                            : 'bg-zinc-900 border-zinc-800 text-white'
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
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                            selectedCountry.code === country.code && selectedCountry.name === country.name
                              ? 'bg-[#FF6B00]/15 text-[#FF6B00] font-bold'
                              : isLight
                              ? 'hover:bg-slate-100 text-[#11182E]'
                              : 'hover:bg-zinc-800 text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-base">{country.flag}</span>
                            <span className="truncate">{country.name}</span>
                          </div>
                          <span className="font-mono text-[11px] opacity-75 shrink-0 ml-2">
                            {country.code}
                          </span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-3 py-3 text-center text-xs text-zinc-500">
                          No countries matched
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* National Mobile Number Input */}
              <div className="relative flex-1">
                <Phone className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={selectedCountry.formatPlaceholder}
                  className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                    isLight
                      ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                      : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            <p className={`text-[11px] mt-1.5 ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
              {selectedCountry.code === '+91'
                ? 'Standard 10-digit Indian mobile number (e.g. 98765 43210).'
                : `Enter your ${selectedCountry.name} mobile number without country code.`}
            </p>
          </div>

          {/* Continue with Mobile Button */}
          <button
            type="submit"
            disabled={isLoading || !phoneNumber.trim()}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-98 min-h-[46px] bg-[#FF6B00] hover:bg-[#E05E00] shadow-[#FF6B00]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending OTP Code...</span>
              </div>
            ) : (
              <>
                <span>Continue with OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Privacy & Terms Note */}
          <p className={`text-[10px] text-center leading-tight ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`}>
            By continuing, you agree to receive a 6-digit verification code via SMS. Standard carrier SMS and data rates may apply.
          </p>

          {/* Switch to Email Button */}
          {onSwitchToEmail && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onSwitchToEmail}
                className={`text-xs font-semibold hover:underline cursor-pointer ${
                  isLight ? 'text-[#526581] hover:text-[#11182E]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Prefer email? Continue with email address →
              </button>
            </div>
          )}
        </form>
      )}

      {/* ========================================================= */}
      {/* STEP 2: ENTER 6-DIGIT OTP                                  */}
      {/* ========================================================= */}
      {step === 'enter_otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs animate-in fade-in">
          {/* Target number banner with change button */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isLight
                ? 'bg-slate-50 border-[#E9E5F2] text-[#11182E]'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
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
              className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
            >
              Edit number
            </button>
          </div>

          <div>
            <label className={`block font-semibold mb-2 text-center ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
              Enter 6-Digit Verification Code
            </label>

            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
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
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border transition focus:outline-none select-all ${
                    isLight
                      ? 'bg-white border-[#E9E5F2] text-[#11182E] focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/25'
                      : 'bg-zinc-900 border-zinc-800 text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/30'
                  } ${digit ? 'border-[#FF6B00]/60' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || otpDigits.join('').length !== 6}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-98 min-h-[46px] bg-[#FF6B00] hover:bg-[#E05E00] shadow-[#FF6B00]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Code...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify OTP & Sign In</span>
              </>
            )}
          </button>

          {/* Resend OTP Action */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('enter_phone');
                setErrorMessage(null);
              }}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isLight ? 'text-[#526581] hover:text-[#11182E]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to number</span>
            </button>

            <button
              type="button"
              disabled={cooldown > 0 || isLoading}
              onClick={() => handleSendOtp()}
              className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition ${
                cooldown > 0
                  ? 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  : 'text-[#FF6B00] hover:underline'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* STEP 3: NEW STUDENT REGISTRATION OR LINK ACCOUNT          */}
      {/* ========================================================= */}
      {step === 'register_profile' && (
        <form onSubmit={handleRegisterOrLink} className="space-y-4 text-xs animate-in fade-in">
          {/* Verified Mobile Header */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  Verified Mobile
                </p>
                <p className="text-xs font-mono font-bold">{fullPhoneNumber}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Verified
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className={`grid grid-cols-2 p-1 rounded-xl border ${
              isLight ? 'bg-[#F0F3F8] border-[#E9E5F2]' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setRegisterMode('new_student');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                registerMode === 'new_student'
                  ? isLight
                    ? 'bg-white text-[#11182E] shadow-xs'
                    : 'bg-zinc-800 text-white shadow-xs'
                  : isLight
                  ? 'text-[#526581] hover:text-[#11182E]'
                  : 'text-zinc-400 hover:text-white'
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
              className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                registerMode === 'link_account'
                  ? isLight
                    ? 'bg-white text-[#11182E] shadow-xs'
                    : 'bg-zinc-800 text-white shadow-xs'
                  : isLight
                  ? 'text-[#526581] hover:text-[#11182E]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Link Existing Account</span>
            </button>
          </div>

          {/* Form Fields: New Student Mode */}
          {registerMode === 'new_student' && (
            <div className="space-y-3.5">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Shashikumar S."
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                        : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                  Email Address <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                        : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                    }`}
                  />
                </div>
              </div>

              <p className={`text-[10px] leading-relaxed ${isLight ? 'text-[#526581]' : 'text-zinc-400'}`}>
                Next, you can specify your degree, syllabus, and college in the personalized onboarding step.
              </p>
            </div>
          )}

          {/* Form Fields: Link Account Mode */}
          {registerMode === 'link_account' && (
            <div className="space-y-3.5">
              <div
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                  isLight
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-blue-950/30 border-blue-800/60 text-blue-300'
                }`}
              >
                Already have an EduPredict AI email account? Enter your email credentials to attach this mobile number and preserve all previous academic predictions, goals, and history.
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                  Existing Account Email
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                        : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-[#11182E]' : 'text-zinc-300'}`}>
                  Existing Password
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3 top-3.5 pointer-events-none ${isLight ? 'text-[#526581]' : 'text-zinc-500'}`} />
                  <input
                    type="password"
                    required
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-base sm:text-xs font-medium min-h-[44px] border focus:outline-none transition ${
                      isLight
                        ? 'bg-white border-[#E9E5F2] text-[#11182E] placeholder-[#526581]/60 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                        : 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Complete Registration / Link Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-98 min-h-[46px] bg-[#FF6B00] hover:bg-[#E05E00] shadow-[#FF6B00]/25 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>{registerMode === 'new_student' ? 'Complete Profile & Enter' : 'Link Mobile & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

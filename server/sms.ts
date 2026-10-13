/**
 * EduPredict AI - SMS OTP Authentication Service
 * Supports Twilio Verify v2 API with secure fallback to Twilio Programmable SMS.
 * Features rate-limiting, resend cooldowns, attempt limits, E.164 normalization,
 * and cryptographic HMAC tokens for verified registration & account linking.
 */

import crypto from 'crypto';

export interface SmsProviderConfig {
  isConfigured: boolean;
  provider: 'twilio_verify' | 'twilio_sms' | 'none';
  message?: string;
}

interface PhoneRateLimitState {
  lastRequestedAt: number;
  requestsInWindow: number;
  windowStart: number;
  failedVerificationAttempts: number;
  lockedUntil: number;
  // Used if running direct SMS mode (without Twilio Verify service)
  activeOtpHash?: string;
  otpExpiresAt?: number;
}

// In-memory rate limiting store (cleaned up periodically)
const rateLimitStore = new Map<string, PhoneRateLimitState>();
const ipRateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Periodic cleanup of expired rate limits every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, state] of rateLimitStore.entries()) {
    if (now - state.windowStart > 30 * 60 * 1000 && (!state.otpExpiresAt || now > state.otpExpiresAt)) {
      rateLimitStore.delete(key);
    }
  }
  for (const [ip, state] of ipRateLimitStore.entries()) {
    if (now - state.windowStart > 15 * 60 * 1000) {
      ipRateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

const RESEND_COOLDOWN_SECONDS = 60;
const MAX_REQUESTS_PER_15_MIN = 3;
const MAX_FAILED_VERIFICATIONS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout on 5 failed attempts
const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes code validity

// Secret key for signing temporary registration tokens
const HMAC_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Returns current configuration status of the SMS provider
 */
export function getSmsProviderConfig(): SmsProviderConfig {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const verifyServiceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();
  const fromNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  if (accountSid && authToken && verifyServiceSid) {
    return {
      isConfigured: true,
      provider: 'twilio_verify'
    };
  }

  if (accountSid && authToken && fromNumber) {
    return {
      isConfigured: true,
      provider: 'twilio_sms'
    };
  }

  return {
    isConfigured: false,
    provider: 'none',
    message:
      'SMS authentication provider is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in your environment settings.'
  };
}

/**
 * Normalizes and validates international phone numbers according to E.164.
 * Includes country-specific validation rules (e.g. India 10-digit mobile).
 */
export function normalizePhoneNumber(rawPhone: string): {
  isValid: boolean;
  normalized: string;
  error?: string;
} {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, normalized: '', error: 'Mobile number is required.' };
  }

  // Remove whitespace, dashes, parentheses
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // Add leading '+' if missing but starts with country code or 91
  if (!cleaned.startsWith('+')) {
    if (/^[6-9]\d{9}$/.test(cleaned)) {
      // 10-digit Indian mobile number without prefix -> prepend +91
      cleaned = '+91' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      // 0-prefixed Indian mobile number -> replace 0 with +91
      cleaned = '+91' + cleaned.substring(1);
    } else if (cleaned.length >= 10) {
      cleaned = '+' + cleaned;
    } else {
      return {
        isValid: false,
        normalized: '',
        error: 'Please enter a valid mobile number with country code.'
      };
    }
  }

  // Check E.164 standard: + followed by 7 to 15 digits
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  if (!e164Regex.test(cleaned)) {
    return {
      isValid: false,
      normalized: '',
      error: 'Invalid mobile number format. Number must follow international E.164 standard (+[country code][number]).'
    };
  }

  // Specific check for India (+91): 10 digits starting with 6, 7, 8, or 9
  if (cleaned.startsWith('+91')) {
    const nationalNumber = cleaned.substring(3);
    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
      return {
        isValid: false,
        normalized: '',
        error: 'Invalid Indian mobile number. Must be exactly 10 digits starting with 6, 7, 8, or 9.'
      };
    }
  }

  return { isValid: true, normalized: cleaned };
}

/**
 * Masks a phone number for privacy display (e.g., +91 98*** ***10)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const prefix = phone.slice(0, 5);
  const suffix = phone.slice(-2);
  return `${prefix}*** ***${suffix}`;
}

/**
 * Checks and updates rate limits before sending an OTP
 */
function checkRateLimits(phone: string, clientIp: string): { allowed: boolean; error?: string; cooldownRemaining?: number } {
  const now = Date.now();

  // 1. IP rate limiting (max 10 OTP requests per 15 mins across any numbers)
  const ipState = ipRateLimitStore.get(clientIp);
  if (ipState) {
    if (now - ipState.windowStart > 15 * 60 * 1000) {
      ipRateLimitStore.set(clientIp, { count: 1, windowStart: now });
    } else {
      if (ipState.count >= 10) {
        return {
          allowed: false,
          error: 'Too many requests from this network. Please wait a few minutes before trying again.'
        };
      }
      ipState.count++;
    }
  } else {
    ipRateLimitStore.set(clientIp, { count: 1, windowStart: now });
  }

  // 2. Phone rate limiting & cooldown
  let phoneState = rateLimitStore.get(phone);
  if (!phoneState) {
    phoneState = {
      lastRequestedAt: 0,
      requestsInWindow: 0,
      windowStart: now,
      failedVerificationAttempts: 0,
      lockedUntil: 0
    };
    rateLimitStore.set(phone, phoneState);
  }

  // Check if locked out due to abuse
  if (phoneState.lockedUntil && now < phoneState.lockedUntil) {
    const minutesLeft = Math.ceil((phoneState.lockedUntil - now) / 60000);
    return {
      allowed: false,
      error: `This mobile number is temporarily locked due to too many failed attempts. Please try again in ${minutesLeft} minute(s).`
    };
  }

  // Check resend cooldown
  const elapsedSeconds = Math.floor((now - phoneState.lastRequestedAt) / 1000);
  if (phoneState.lastRequestedAt > 0 && elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
    const remaining = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
    return {
      allowed: false,
      cooldownRemaining: remaining,
      error: `Please wait ${remaining} second${remaining === 1 ? '' : 's'} before requesting a new OTP.`
    };
  }

  // Check 15-minute sliding window limit
  if (now - phoneState.windowStart > 15 * 60 * 1000) {
    phoneState.windowStart = now;
    phoneState.requestsInWindow = 0;
  }

  if (phoneState.requestsInWindow >= MAX_REQUESTS_PER_15_MIN) {
    return {
      allowed: false,
      error: 'Maximum OTP request limit reached for this number (3 requests per 15 minutes). Please try again later.'
    };
  }

  // Advance counters
  phoneState.lastRequestedAt = now;
  phoneState.requestsInWindow++;
  // Reset failed attempts when a new valid OTP is dispatched
  phoneState.failedVerificationAttempts = 0;

  return { allowed: true };
}

/**
 * Dispatches real SMS OTP via Twilio Verify or Twilio Messages.
 * If credentials are not configured, fails securely without faking SMS delivery.
 */
export async function sendOtp(
  phone: string,
  clientIp: string
): Promise<{
  success: boolean;
  status: number;
  message?: string;
  error?: string;
  cooldownSeconds?: number;
  maskedPhone?: string;
}> {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) {
    return { success: false, status: 400, error: norm.error };
  }
  const cleanPhone = norm.normalized;

  const config = getSmsProviderConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      status: 503,
      error:
        'SMS authentication provider is not configured. To enable real SMS OTP delivery, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in your server environment.'
    };
  }

  const rateCheck = checkRateLimits(cleanPhone, clientIp);
  if (!rateCheck.allowed) {
    return {
      success: false,
      status: 429,
      error: rateCheck.error,
      cooldownSeconds: rateCheck.cooldownRemaining
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    if (config.provider === 'twilio_verify') {
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!.trim();
      const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: cleanPhone,
          Channel: 'sms'
        }).toString()
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Twilio Verify API error:', data);
        const twilioMsg = data.message || 'SMS delivery failed with provider';
        // Handle Twilio-specific error codes
        if (data.code === 60200 || data.code === 21211) {
          return { success: false, status: 400, error: 'The mobile number provided cannot receive SMS.' };
        }
        if (data.code === 60203) {
          return { success: false, status: 429, error: 'Max verification attempts reached on SMS gateway. Please wait.' };
        }
        return { success: false, status: response.status || 502, error: `SMS gateway error: ${twilioMsg}` };
      }

      return {
        success: true,
        status: 200,
        message: `OTP sent successfully to ${maskPhoneNumber(cleanPhone)}`,
        cooldownSeconds: RESEND_COOLDOWN_SECONDS,
        maskedPhone: maskPhoneNumber(cleanPhone)
      };
    } else {
      // Fallback: Direct Twilio Messaging
      const fromNumber = process.env.TWILIO_PHONE_NUMBER!.trim();
      const code = crypto.randomInt(100000, 1000000).toString();
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHash('sha256').update(code + salt).digest('hex') + ':' + salt;

      const state = rateLimitStore.get(cleanPhone)!;
      state.activeOtpHash = hash;
      state.otpExpiresAt = Date.now() + OTP_EXPIRATION_MS;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: cleanPhone,
          Body: `Your EduPredict AI verification code is: ${code}. Valid for 10 minutes. Do not share this code with anyone.`
        }).toString()
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error('Twilio SMS API error:', data);
        return { success: false, status: response.status || 502, error: data.message || 'Failed to send SMS.' };
      }

      return {
        success: true,
        status: 200,
        message: `OTP sent successfully to ${maskPhoneNumber(cleanPhone)}`,
        cooldownSeconds: RESEND_COOLDOWN_SECONDS,
        maskedPhone: maskPhoneNumber(cleanPhone)
      };
    }
  } catch (err: any) {
    console.error('Fatal network error sending SMS OTP:', err);
    return {
      success: false,
      status: 500,
      error: 'Network connectivity error contacting SMS delivery service: ' + (err?.message || 'Unknown')
    };
  }
}

/**
 * Securely verifies the 6-digit OTP code against the provider.
 * Enforces attempt limits (max 5 failed attempts) to protect against brute force.
 */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{
  success: boolean;
  status: number;
  error?: string;
}> {
  const norm = normalizePhoneNumber(phone);
  if (!norm.isValid) {
    return { success: false, status: 400, error: norm.error };
  }
  const cleanPhone = norm.normalized;

  if (!code || !/^\d{6}$/.test(code.trim())) {
    return { success: false, status: 400, error: 'Please enter a valid 6-digit verification code.' };
  }
  const cleanCode = code.trim();

  const phoneState = rateLimitStore.get(cleanPhone);
  const now = Date.now();

  // Check lockout status
  if (phoneState && phoneState.lockedUntil && now < phoneState.lockedUntil) {
    const minutesLeft = Math.ceil((phoneState.lockedUntil - now) / 60000);
    return {
      success: false,
      status: 429,
      error: `Too many failed attempts. Mobile verification locked. Please try again in ${minutesLeft} minute(s).`
    };
  }

  const config = getSmsProviderConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      status: 503,
      error: 'SMS provider is not configured. Cannot verify OTP without configured credentials.'
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    if (config.provider === 'twilio_verify') {
      const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!.trim();
      const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: cleanPhone,
          Code: cleanCode
        }).toString()
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === 60202) {
          return { success: false, status: 429, error: 'Maximum verification check attempts reached. Please request a new OTP.' };
        }
        if (data.code === 20404 || data.code === 60200) {
          return { success: false, status: 400, error: 'Verification code has expired or does not exist. Please request a new OTP.' };
        }
        return { success: false, status: 400, error: data.message || 'Verification failed.' };
      }

      if (data.status === 'approved') {
        // Success! Clean up rate limit failed attempts
        if (phoneState) {
          phoneState.failedVerificationAttempts = 0;
          phoneState.lockedUntil = 0;
        }
        return { success: true, status: 200 };
      } else {
        // Failed attempt
        if (phoneState) {
          phoneState.failedVerificationAttempts = (phoneState.failedVerificationAttempts || 0) + 1;
          if (phoneState.failedVerificationAttempts >= MAX_FAILED_VERIFICATIONS) {
            phoneState.lockedUntil = now + LOCKOUT_DURATION_MS;
            return {
              success: false,
              status: 429,
              error: 'Too many incorrect attempts (5/5). Number locked for 15 minutes for your account security.'
            };
          }
        }
        return {
          success: false,
          status: 400,
          error: `Incorrect verification code. Please check your SMS. (${MAX_FAILED_VERIFICATIONS - (phoneState?.failedVerificationAttempts || 1)} attempts remaining)`
        };
      }
    } else {
      // Fallback: Direct Twilio Messaging verification
      if (!phoneState || !phoneState.activeOtpHash || !phoneState.otpExpiresAt) {
        return { success: false, status: 400, error: 'No active verification code found for this number. Please request a new OTP.' };
      }

      if (now > phoneState.otpExpiresAt) {
        phoneState.activeOtpHash = undefined;
        return { success: false, status: 400, error: 'The verification code has expired. Please request a new OTP.' };
      }

      const [storedHash, salt] = phoneState.activeOtpHash.split(':');
      const testHash = crypto.createHash('sha256').update(cleanCode + salt).digest('hex');

      if (testHash === storedHash) {
        phoneState.activeOtpHash = undefined;
        phoneState.otpExpiresAt = undefined;
        phoneState.failedVerificationAttempts = 0;
        return { success: true, status: 200 };
      } else {
        phoneState.failedVerificationAttempts = (phoneState.failedVerificationAttempts || 0) + 1;
        if (phoneState.failedVerificationAttempts >= MAX_FAILED_VERIFICATIONS) {
          phoneState.lockedUntil = now + LOCKOUT_DURATION_MS;
          phoneState.activeOtpHash = undefined;
          return {
            success: false,
            status: 429,
            error: 'Too many incorrect attempts (5/5). Number locked for 15 minutes.'
          };
        }
        return {
          success: false,
          status: 400,
          error: `Incorrect verification code. (${MAX_FAILED_VERIFICATIONS - phoneState.failedVerificationAttempts} attempts remaining)`
        };
      }
    }
  } catch (err: any) {
    console.error('Error during OTP verification:', err);
    return {
      success: false,
      status: 500,
      error: 'Failed to verify code due to server connection error: ' + (err?.message || 'Unknown')
    };
  }
}

/**
 * Creates a signed verification proof token once an OTP is successfully verified.
 * Used to securely allow registration or account linking without re-entering OTP.
 * Valid for 15 minutes.
 */
export function generateVerifiedPhoneToken(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  const cleanPhone = norm.normalized;
  const payload = {
    phone: cleanPhone,
    exp: Date.now() + 15 * 60 * 1000 // 15 minutes
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

/**
 * Validates a signed verification proof token
 */
export function verifyPhoneProofToken(token: string): { isValid: boolean; phone?: string; error?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Verification token is required.' };
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid verification token format.' };
  }
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('base64url');
  if (signature !== expectedSig) {
    return { isValid: false, error: 'Invalid verification token signature.' };
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.phone || !payload.exp) {
      return { isValid: false, error: 'Malformed verification token payload.' };
    }
    if (Date.now() > payload.exp) {
      return { isValid: false, error: 'Verification proof has expired. Please verify your mobile number again.' };
    }
    return { isValid: true, phone: payload.phone };
  } catch {
    return { isValid: false, error: 'Failed to parse verification token.' };
  }
}

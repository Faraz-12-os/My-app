import crypto from 'crypto';
import { otpProviderService } from '../providers/otpProvider.ts';

export interface OtpRecord {
  phoneNumber: string; // Normalized E.164
  otpHash: string; // HMAC-SHA256 hash of the 6-digit code
  expiresAt: number; // Expiration timestamp (5 minutes)
  createdAt: number;
  resendAvailableAt: number; // 60-second cooldown timestamp
  attempts: number; // Failed verification attempts
  maxAttempts: number; // Maximum allowed attempts (5)
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class OTPService {
  // In-memory active OTP store
  private otpRecords = new Map<string, OtpRecord>();

  // Rate limiting maps
  private phoneRateLimits = new Map<string, RateLimitRecord>();
  private ipRateLimits = new Map<string, RateLimitRecord>();

  private readonly OTP_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
  private readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
  private readonly MAX_ATTEMPTS = 5; // Max 5 verification attempts
  private readonly RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS_PER_PHONE = 5;
  private readonly MAX_REQUESTS_PER_IP = 10;

  private getSecret(): string {
    return process.env.JWT_SECRET || 'tempshield_otp_hmac_secret_fallback';
  }

  /**
   * Normalize and validate E.164 phone number
   */
  normalizePhoneNumber(raw: string): string | null {
    if (!raw) return null;
    const cleaned = raw.trim().replace(/[\s\-\(\)]/g, '');
    // Standard E.164 regex: starts with +, followed by 7 to 15 digits
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(cleaned)) {
      return null;
    }
    return cleaned;
  }

  /**
   * Cryptographically secure 6-digit OTP generator
   */
  private generateSecureOTP(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hash OTP using HMAC-SHA256 so plaintext is never retained
   */
  private hashOTP(otp: string): string {
    return crypto
      .createHmac('sha256', this.getSecret())
      .update(otp)
      .digest('hex');
  }

  /**
   * Rate limiting checks
   */
  private checkRateLimit(phone: string, ip: string): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();

    // Check Phone Rate Limit
    const phoneRecord = this.phoneRateLimits.get(phone);
    if (phoneRecord && now < phoneRecord.resetAt) {
      if (phoneRecord.count >= this.MAX_REQUESTS_PER_PHONE) {
        return {
          allowed: false,
          retryAfterSec: Math.ceil((phoneRecord.resetAt - now) / 1000),
        };
      }
    }

    // Check IP Rate Limit
    const ipRecord = this.ipRateLimits.get(ip);
    if (ipRecord && now < ipRecord.resetAt) {
      if (ipRecord.count >= this.MAX_REQUESTS_PER_IP) {
        return {
          allowed: false,
          retryAfterSec: Math.ceil((ipRecord.resetAt - now) / 1000),
        };
      }
    }

    return { allowed: true };
  }

  private incrementRateLimit(phone: string, ip: string): void {
    const now = Date.now();
    const resetAt = now + this.RATE_LIMIT_WINDOW_MS;

    const phoneRecord = this.phoneRateLimits.get(phone);
    if (!phoneRecord || now >= phoneRecord.resetAt) {
      this.phoneRateLimits.set(phone, { count: 1, resetAt });
    } else {
      phoneRecord.count++;
    }

    const ipRecord = this.ipRateLimits.get(ip);
    if (!ipRecord || now >= ipRecord.resetAt) {
      this.ipRateLimits.set(ip, { count: 1, resetAt });
    } else {
      ipRecord.count++;
    }
  }

  /**
   * Request and send a new 6-digit OTP to the phone number
   */
  async requestOTP(
    rawPhone: string,
    ip = '127.0.0.1'
  ): Promise<{
    success: boolean;
    phoneNumber?: string;
    resendAvailableAt?: number;
    expiresInSeconds?: number;
    error?: string;
    errorCode?: string;
    provider?: string;
  }> {
    const phoneNumber = this.normalizePhoneNumber(rawPhone);
    if (!phoneNumber) {
      return {
        success: false,
        errorCode: 'INVALID_PHONE',
        error: 'Please provide a valid phone number in international E.164 format (e.g. +14155552671).',
      };
    }

    // Check rolling rate limits
    const rateCheck = this.checkRateLimit(phoneNumber, ip);
    if (!rateCheck.allowed) {
      return {
        success: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        error: `Too many verification requests. Please wait ${rateCheck.retryAfterSec} seconds before trying again.`,
      };
    }

    const now = Date.now();
    const existing = this.otpRecords.get(phoneNumber);

    // Enforce 60-second resend cooldown
    if (existing && now < existing.resendAvailableAt) {
      const waitSec = Math.ceil((existing.resendAvailableAt - now) / 1000);
      return {
        success: false,
        errorCode: 'COOLDOWN_ACTIVE',
        error: `Please wait ${waitSec} seconds before requesting a new verification code.`,
      };
    }

    // Generate secure 6-digit OTP
    const otp = this.generateSecureOTP();
    const otpHash = this.hashOTP(otp);
    const expiresAt = now + this.OTP_EXPIRATION_MS;
    const resendAvailableAt = now + this.RESEND_COOLDOWN_MS;

    // Dispatch via Primary Twilio SMS Provider
    const dispatchResult = await otpProviderService.dispatchOTP({
      phoneNumber,
      otp,
      expiresInMinutes: 5,
    });

    if (!dispatchResult.success) {
      return {
        success: false,
        errorCode: 'DISPATCH_FAILED',
        error: dispatchResult.error || 'Failed to dispatch verification SMS via Twilio.',
        provider: dispatchResult.provider,
      };
    }

    // Save hashed OTP record in memory
    this.otpRecords.set(phoneNumber, {
      phoneNumber,
      otpHash,
      expiresAt,
      createdAt: now,
      resendAvailableAt,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
    });

    this.incrementRateLimit(phoneNumber, ip);

    return {
      success: true,
      phoneNumber,
      resendAvailableAt,
      expiresInSeconds: 300,
      provider: dispatchResult.provider,
    };
  }

  /**
   * Verify provided OTP
   */
  verifyOTP(
    rawPhone: string,
    candidateCode: string
  ): {
    success: boolean;
    phoneNumber?: string;
    error?: string;
    errorCode?: string;
    remainingAttempts?: number;
  } {
    const phoneNumber = this.normalizePhoneNumber(rawPhone);
    if (!phoneNumber) {
      return {
        success: false,
        errorCode: 'INVALID_PHONE',
        error: 'Invalid phone number format.',
      };
    }

    const record = this.otpRecords.get(phoneNumber);
    if (!record) {
      return {
        success: false,
        errorCode: 'OTP_NOT_FOUND',
        error: 'No active verification session found for this phone number. Please request a new code.',
      };
    }

    const now = Date.now();

    // Check expiration (5 minutes)
    if (now > record.expiresAt) {
      this.otpRecords.delete(phoneNumber);
      return {
        success: false,
        errorCode: 'OTP_EXPIRED',
        error: 'Verification code has expired. Please request a new one.',
      };
    }

    // Check max attempts
    if (record.attempts >= record.maxAttempts) {
      this.otpRecords.delete(phoneNumber);
      return {
        success: false,
        errorCode: 'MAX_ATTEMPTS_EXCEEDED',
        error: 'Maximum verification attempts exceeded. This code has been invalidated. Please request a new one.',
      };
    }

    // Verify candidate code against hash
    const candidateHash = this.hashOTP(candidateCode.trim());
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(candidateHash, 'hex'),
      Buffer.from(record.otpHash, 'hex')
    );

    if (!isMatch) {
      record.attempts++;
      const remaining = record.maxAttempts - record.attempts;

      if (remaining <= 0) {
        this.otpRecords.delete(phoneNumber);
        return {
          success: false,
          errorCode: 'MAX_ATTEMPTS_EXCEEDED',
          error: 'Incorrect code. Maximum attempts exceeded. Code invalidated.',
          remainingAttempts: 0,
        };
      }

      return {
        success: false,
        errorCode: 'INVALID_OTP',
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining,
      };
    }

    // Success: One-time use -> destroy OTP immediately to prevent reuse
    this.otpRecords.delete(phoneNumber);

    return {
      success: true,
      phoneNumber,
    };
  }
}

export const otpService = new OTPService();

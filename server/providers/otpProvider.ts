/**
 * Twilio SMS & OTP Provider Architecture
 * Responsible for dispatching real one-time passwords via telecom carrier routes.
 */

export interface SendOTPParams {
  phoneNumber: string; // E.164 formatted phone number (e.g. +14155552671)
  otp: string;
  expiresInMinutes: number;
}

export interface SendOTPResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  isSimulated?: boolean;
}

export interface IOTPProvider {
  name: string;
  sendOTP(params: SendOTPParams): Promise<SendOTPResult>;
}

export class TwilioOTPProvider implements IOTPProvider {
  name = 'Twilio';

  async sendOTP({ phoneNumber, otp, expiresInMinutes }: SendOTPParams): Promise<SendOTPResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();

    // Check if real credentials are configured or if placeholder values are still present
    const isPlaceholder =
      !accountSid ||
      !authToken ||
      accountSid.startsWith('REPLACE_WITH_') ||
      authToken.startsWith('REPLACE_WITH_');

    if (isPlaceholder) {
      console.warn(
        `[TwilioOTPProvider] Twilio credentials contain placeholder values in .env. Real SMS dispatch to ${phoneNumber} requires active TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.`
      );
      // In development when credentials are placeholders, provide clear diagnostic error
      return {
        success: false,
        provider: 'Twilio',
        error:
          'Twilio credentials not configured. Please replace TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env with your real Twilio API credentials to deliver real SMS.',
      };
    }

    const messageBody = `Your TempShield verification code is: ${otp}. It expires in ${expiresInMinutes} minutes. Never share this code with anyone.`;

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', phoneNumber);
      formData.append('Body', messageBody);

      if (fromNumber && !fromNumber.startsWith('REPLACE_WITH_')) {
        formData.append('From', fromNumber);
      } else {
        // Twilio Messaging Service or Alpha Sender ID fallback
        formData.append('From', 'TempShield');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[TwilioOTPProvider] Twilio API Error:', data);
        const twilioMessage = data?.message || `Twilio dispatch failed with HTTP ${response.status}`;
        return {
          success: false,
          provider: 'Twilio',
          error: twilioMessage,
        };
      }

      return {
        success: true,
        messageId: data.sid,
        provider: 'Twilio',
      };
    } catch (err: any) {
      console.error('[TwilioOTPProvider] Network or connection error:', err);
      return {
        success: false,
        provider: 'Twilio',
        error: err.message || 'Failed to connect to Twilio SMS gateway',
      };
    }
  }
}

// Provider Manager: Easily swap or fallback providers in the future
export class OTPProviderService {
  private activeProvider: IOTPProvider;

  constructor() {
    this.activeProvider = new TwilioOTPProvider();
  }

  setProvider(provider: IOTPProvider) {
    this.activeProvider = provider;
  }

  getProviderName(): string {
    return this.activeProvider.name;
  }

  async dispatchOTP(params: SendOTPParams): Promise<SendOTPResult> {
    return this.activeProvider.sendOTP(params);
  }
}

export const otpProviderService = new OTPProviderService();

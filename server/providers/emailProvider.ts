import { db } from '../db.ts';

export class EmailProviderService {
  /**
   * Generates sample test verification email into inbox for quick testing
   */
  generateTestEmail(emailId: string, serviceName = 'GitHub Security'): void {
    const email = db.getEmailById(emailId);
    if (!email) return;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const serviceTemplates: Record<string, { sender: string; name: string; subject: string; body: string }> = {
      'GitHub Security': {
        sender: 'security@github.com',
        name: 'GitHub Security',
        subject: `[GitHub] Device verification code: ${otp}`,
        body: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Verify your GitHub account</h2>
            </div>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">A request was made to authenticate from a new browser or location.</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #4338ca; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This verification code is valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
        `,
      },
      'Netflix': {
        sender: 'info@mailer.netflix.com',
        name: 'Netflix',
        subject: `Your Netflix temporary access code is ${otp}`,
        body: `
          <div style="font-family: sans-serif; padding: 20px; color: #222;">
            <h1 style="color: #e50914;">Netflix</h1>
            <p>Here is your temporary passcode to access your household profile:</p>
            <p style="font-size: 28px; font-weight: bold; background: #eee; padding: 12px 20px; display: inline-block;">${otp}</p>
            <p style="color: #888; font-size: 12px;">Need help? Visit our Help Center.</p>
          </div>
        `,
      },
      'OpenAI': {
        sender: 'noreply@tm.openai.com',
        name: 'OpenAI Verification',
        subject: `${otp} is your OpenAI verification code`,
        body: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h3>Your OpenAI verification code</h3>
            <p>Enter the code below to complete your login or registration:</p>
            <h2 style="letter-spacing: 4px; color: #10a37f;">${otp}</h2>
            <p>Code valid for 15 minutes.</p>
          </div>
        `,
      },
    };

    const template = serviceTemplates[serviceName] || serviceTemplates['GitHub Security'];
    db.addEmailMessage(
      emailId,
      template.sender,
      template.name,
      template.subject,
      template.body,
      `Your verification code is ${otp}. Valid for 10 minutes.`,
      otp
    );
  }
}

export const emailProvider = new EmailProviderService();

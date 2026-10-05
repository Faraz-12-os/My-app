import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { otpService } from '../services/otpService.ts';

const router = Router();

// ==========================================================
// OTP Authentication Routes (Twilio-Powered Phone Verification)
// ==========================================================

router.post('/otp/send', async (req, res) => {
  const { phoneNumber } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!phoneNumber) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const result = await otpService.requestOTP(phoneNumber, clientIp);

  if (!result.success) {
    const statusCode =
      result.errorCode === 'COOLDOWN_ACTIVE'
        ? 429
        : result.errorCode === 'RATE_LIMIT_EXCEEDED'
        ? 429
        : result.errorCode === 'INVALID_PHONE'
        ? 400
        : 500;

    res.status(statusCode).json({
      error: result.error,
      errorCode: result.errorCode,
      provider: result.provider,
    });
    return;
  }

  res.json({
    success: true,
    message: `Verification code sent to ${result.phoneNumber}`,
    phoneNumber: result.phoneNumber,
    resendAvailableAt: result.resendAvailableAt,
    expiresInSeconds: result.expiresInSeconds,
    provider: result.provider,
  });
});

router.post('/otp/resend', async (req, res) => {
  const { phoneNumber } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!phoneNumber) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }

  const result = await otpService.requestOTP(phoneNumber, clientIp);

  if (!result.success) {
    const statusCode =
      result.errorCode === 'COOLDOWN_ACTIVE'
        ? 429
        : result.errorCode === 'RATE_LIMIT_EXCEEDED'
        ? 429
        : 400;

    res.status(statusCode).json({
      error: result.error,
      errorCode: result.errorCode,
    });
    return;
  }

  res.json({
    success: true,
    message: `New verification code sent to ${result.phoneNumber}`,
    phoneNumber: result.phoneNumber,
    resendAvailableAt: result.resendAvailableAt,
    expiresInSeconds: result.expiresInSeconds,
  });
});

router.post('/otp/verify', (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    res.status(400).json({ error: 'Phone number and 6-digit verification code are required' });
    return;
  }

  const result = otpService.verifyOTP(phoneNumber, code);

  if (!result.success) {
    const statusCode =
      result.errorCode === 'MAX_ATTEMPTS_EXCEEDED'
        ? 403
        : result.errorCode === 'OTP_EXPIRED'
        ? 410
        : 400;

    res.status(statusCode).json({
      error: result.error,
      errorCode: result.errorCode,
      remainingAttempts: result.remainingAttempts,
    });
    return;
  }

  // Find or create user account linked to the verified phone number
  const user = db.findOrCreateUserByPhone(result.phoneNumber!);

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'Account suspended. Contact support.' });
    return;
  }

  const token = generateToken(user);
  const wallet = db.getWalletByUserId(user.id);

  res.json({
    success: true,
    message: 'Phone verification successful! Authenticated.',
    token,
    user: {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    wallet: {
      balance: wallet?.balance || 0,
    },
  });
});

// ==========================================================
// Standard Email/Password Authentication Routes
// ==========================================================

router.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = db.createUser(email, passwordHash, 'user');
  const token = generateToken(user);
  const wallet = db.getWalletByUserId(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    wallet: {
      balance: wallet?.balance || 0,
    },
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  if (user.status === 'suspended') {
    res.status(403).json({ error: 'Account suspended. Contact support.' });
    return;
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  db.updateUserLastLogin(user.id);
  const token = generateToken(user);
  const wallet = db.getWalletByUserId(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    wallet: {
      balance: wallet?.balance || 0,
    },
  });
});

router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const wallet = db.getWalletByUserId(user.id);
  const emails = db.getUserEmails(user.id);
  const phones = db.getUserPhoneNumbers(user.id).filter(p => p.status === 'active');

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
    wallet: {
      balance: wallet?.balance || 0,
    },
    stats: {
      activeEmailsCount: emails.length,
      activePhonesCount: phones.length,
    },
  });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email address is required' });
    return;
  }
  // Safe response regardless of email existence to prevent user enumeration
  res.json({
    message: 'If an account matches that email address, password reset instructions have been generated.',
  });
});

router.post('/verify-email', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  user.emailVerified = true;
  res.json({ message: 'Email address successfully verified', verified: true });
});

export const authRouter = router;

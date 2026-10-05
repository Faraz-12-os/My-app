import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { smsProvider } from '../providers/smsProvider.ts';

const router = Router();

// Get list of supported countries
router.get('/countries', (_req, res) => {
  const countries = db.getCountries().filter(c => c.isEnabled);
  res.json({ countries });
});

// Get list of supported verification services
router.get('/services', (_req, res) => {
  const services = db.getServices();
  res.json({ services });
});

// Get user's active/recent rented numbers
router.get('/active', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const numbers = db.getUserPhoneNumbers(user.id);
  res.json({ numbers });
});

// Rent a new virtual number
router.post('/rent', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { countryCode, serviceCode } = req.body;

  if (!countryCode || !serviceCode) {
    res.status(400).json({ error: 'Country code and service code are required' });
    return;
  }

  // Attempt rental via DB & Provider
  const result = db.rentPhoneNumber(user.id, countryCode, serviceCode);
  if (!result.success || !result.phone) {
    res.status(400).json({ error: result.error || 'Failed to rent virtual number' });
    return;
  }

  // Check external provider if configured
  try {
    const providerRes = await smsProvider.rentNumber(countryCode, serviceCode);
    if (providerRes.success && providerRes.number) {
      result.phone.number = providerRes.number;
      result.phone.provider = providerRes.provider;
    }
  } catch (err) {
    console.error('Provider error during rent:', err);
  }

  const wallet = db.getWalletByUserId(user.id);

  res.status(201).json({
    phone: result.phone,
    walletBalance: wallet?.balance || 0,
    message: 'Virtual number successfully activated',
  });
});

// Get SMS messages for a rented number
router.get('/:id/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const phone = db.getPhoneNumberById(req.params.id);

  if (!phone) {
    res.status(404).json({ error: 'Virtual phone number not found' });
    return;
  }

  if (phone.userId !== user.id && user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized to view this number' });
    return;
  }

  const messages = db.getSMSMessages(phone.id);
  res.json({ phone, messages });
});

// Release a number
router.post('/:id/release', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const success = db.releasePhoneNumber(req.params.id, user.id);

  if (!success) {
    res.status(404).json({ error: 'Number not found or already released' });
    return;
  }

  res.json({ success: true, message: 'Virtual number released' });
});

// Simulate incoming OTP / SMS for live instant testing
router.post('/:id/simulate-sms', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const phone = db.getPhoneNumberById(req.params.id);

  if (!phone || (phone.userId !== user.id && user.role !== 'admin')) {
    res.status(404).json({ error: 'Virtual phone number not found' });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const serviceTemplates: Record<string, string> = {
    'wa': `Your WhatsApp code: ${otp.slice(0, 3)}-${otp.slice(3, 6)}. Do not share it with anyone.`,
    'tg': `Telegram code: ${otp}. You can also tap this link to log in.`,
    'go': `G-${otp} is your Google verification code.`,
    'oa': `${otp} is your OpenAI verification code.`,
    'ub': `Your Uber code is ${otp}. Never share this code.`,
    'dc': `Your Discord verification code is: ${otp}`,
    'tt': `[TikTok] ${otp} is your verification code. Valid for 5 minutes.`,
    'az': `${otp} is your Amazon OTP. Do not share it with anyone.`,
  };

  const text = serviceTemplates[phone.serviceCode] || `Your verification code is ${otp}. Use this to verify your account.`;

  const msg = db.addSMSMessage(phone.id, phone.serviceName, text, otp);
  const messages = db.getSMSMessages(phone.id);

  res.json({
    success: true,
    message: 'SMS verification code arrived',
    receivedMessage: msg,
    messages,
  });
});

export const numberRouter = router;

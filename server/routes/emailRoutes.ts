import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { emailProvider } from '../providers/emailProvider.ts';

const router = Router();

// Get active emails for current user
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const emails = db.getUserEmails(user.id);
  res.json({ emails });
});

// Get available domains
router.get('/domains', (_req, res) => {
  const settings = db.getSettings();
  res.json({ domains: settings.domains });
});

// Generate new temporary email
router.post('/generate', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { customUsername, domain, durationMinutes } = req.body;

  const email = db.createTemporaryEmail(
    user.id,
    customUsername,
    domain,
    durationMinutes ? Number(durationMinutes) : 60
  );

  res.status(201).json({ email });
});

// Get messages for an email
router.get('/:id/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const email = db.getEmailById(req.params.id);

  if (!email) {
    res.status(404).json({ error: 'Temporary email not found' });
    return;
  }

  if (email.userId !== user.id && user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized to view this inbox' });
    return;
  }

  const messages = db.getEmailMessages(email.id);
  res.json({ email, messages });
});

// Mark message as read
router.post('/messages/:msgId/read', authenticate, (req, res) => {
  db.markEmailMessageRead(req.params.msgId);
  res.json({ success: true });
});

// Delete email
router.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const success = db.deleteTemporaryEmail(req.params.id, user.id);
  if (!success) {
    res.status(404).json({ error: 'Email not found or already deleted' });
    return;
  }
  res.json({ success: true, message: 'Temporary email address deleted' });
});

// Extend email expiration
router.post('/:id/extend', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const email = db.getEmailById(req.params.id);

  if (!email || email.userId !== user.id) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }

  const extended = db.extendEmailDuration(email.id, 60);
  res.json({ email: extended });
});

// Instant test verification message trigger (so users can test OTP extraction right away)
router.post('/:id/simulate-test', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const email = db.getEmailById(req.params.id);

  if (!email || (email.userId !== user.id && user.role !== 'admin')) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }

  const { serviceName } = req.body;
  emailProvider.generateTestEmail(email.id, serviceName || 'GitHub Security');
  const messages = db.getEmailMessages(email.id);

  res.json({
    success: true,
    message: 'Sample verification email dispatched to inbox',
    messages,
  });
});

export const emailRouter = router;

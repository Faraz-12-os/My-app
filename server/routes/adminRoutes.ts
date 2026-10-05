import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Apply requireAdmin to all admin endpoints
router.use(requireAdmin);

// Dashboard overview stats
router.get('/stats', (_req, res) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

// Users management
router.get('/users', (_req, res) => {
  const users = db.getAllUsers();
  res.json({ users });
});

router.post('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { status } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    res.status(400).json({ error: 'Status must be active or suspended' });
    return;
  }

  const updated = db.updateUserStatus(req.params.id, status, { id: admin.id, email: admin.email });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user: updated, message: `User status changed to ${status}` });
});

router.post('/users/:id/adjust-balance', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { amount, type, note } = req.body;

  if (!amount || Number(amount) <= 0) {
    res.status(400).json({ error: 'Valid amount is required' });
    return;
  }

  if (type !== 'credit' && type !== 'debit') {
    res.status(400).json({ error: 'Type must be credit or debit' });
    return;
  }

  const result = db.adjustWalletBalance(
    req.params.id,
    Number(amount),
    type,
    note || `Admin balance adjustment by ${admin.email}`,
    'admin_adjustment'
  );

  if (!result.success) {
    res.status(400).json({ error: result.error || 'Failed to adjust balance' });
    return;
  }

  db.logAudit(
    admin.id,
    admin.email,
    'ADJUST_USER_BALANCE',
    `USER:${req.params.id}`,
    `${type === 'credit' ? 'Credited' : 'Debited'} ${amount} credits. Note: ${note || 'None'}`
  );

  res.json({ success: true, newBalance: result.newBalance, message: 'Balance adjusted successfully' });
});

// Transactions list
router.get('/transactions', (_req, res) => {
  const transactions = db.getAllTransactions();
  res.json({ transactions });
});

// Pricing Packages management
router.get('/packages', (_req, res) => {
  const packages = db.getAllPackages();
  res.json({ packages });
});

router.post('/packages', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { name, credits, priceUsd, bonusCredits, isPopular, isActive, sortOrder } = req.body;

  const pkg = {
    id: `pkg_${Date.now()}`,
    name: name || 'New Package',
    credits: Number(credits) || 10,
    priceUsd: Number(priceUsd) || 1,
    bonusCredits: Number(bonusCredits) || 0,
    isPopular: Boolean(isPopular),
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: Number(sortOrder) || 10,
  };

  db.savePackage(pkg, { id: admin.id, email: admin.email });
  res.status(201).json({ package: pkg });
});

router.put('/packages/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const pkg = db.getPackageById(req.params.id);
  if (!pkg) {
    res.status(404).json({ error: 'Package not found' });
    return;
  }

  const updated = {
    ...pkg,
    ...req.body,
    credits: req.body.credits !== undefined ? Number(req.body.credits) : pkg.credits,
    priceUsd: req.body.priceUsd !== undefined ? Number(req.body.priceUsd) : pkg.priceUsd,
    bonusCredits: req.body.bonusCredits !== undefined ? Number(req.body.bonusCredits) : pkg.bonusCredits,
  };

  db.savePackage(updated, { id: admin.id, email: admin.email });
  res.json({ package: updated });
});

router.delete('/packages/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const success = db.deletePackage(req.params.id, { id: admin.id, email: admin.email });
  if (!success) {
    res.status(404).json({ error: 'Package not found' });
    return;
  }
  res.json({ success: true, message: 'Package deleted' });
});

// Providers configuration
router.get('/providers', (_req, res) => {
  const providers = db.getProviders();
  res.json({ providers });
});

router.put('/providers/:id', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const updated = db.updateProvider(req.params.id, req.body, { id: admin.id, email: admin.email });
  if (!updated) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  res.json({ provider: updated });
});

// Countries configuration
router.get('/countries', (_req, res) => {
  const countries = db.getCountries();
  res.json({ countries });
});

router.put('/countries/:code', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const updated = db.updateCountry(req.params.code, req.body, { id: admin.id, email: admin.email });
  if (!updated) {
    res.status(404).json({ error: 'Country not found' });
    return;
  }
  res.json({ country: updated });
});

// Support tickets management
router.get('/tickets', (_req, res) => {
  const tickets = db.getAllTickets();
  res.json({ tickets });
});

router.post('/tickets/:id/reply', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  const reply = db.addTicketReply(
    req.params.id,
    admin.id,
    'admin',
    'TempShield Staff',
    message
  );

  if (!reply) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const messages = db.getTicketMessages(req.params.id);
  const ticket = db.getTicketById(req.params.id);
  res.json({ message: reply, messages, ticket });
});

router.put('/tickets/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const success = db.updateTicketStatus(req.params.id, status);
  if (!success) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json({ success: true, message: 'Ticket status updated' });
});

// Audit logs
router.get('/audit-logs', (_req, res) => {
  const logs = db.getAuditLogs();
  res.json({ logs });
});

// Site settings
router.get('/settings', (_req, res) => {
  const settings = db.getSettings();
  res.json({ settings });
});

router.put('/settings', (req: AuthenticatedRequest, res: Response) => {
  const admin = req.user!;
  const updated = db.updateSettings(req.body, { id: admin.id, email: admin.email });
  res.json({ settings: updated });
});

export const adminRouter = router;

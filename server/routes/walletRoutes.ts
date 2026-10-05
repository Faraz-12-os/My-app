import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Get balance & recent ledger transactions
router.get('/balance', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const wallet = db.getWalletByUserId(user.id);
  res.json({
    balance: wallet?.balance || 0,
    currency: 'CREDITS',
  });
});

// Get available packages
router.get('/packages', (_req, res) => {
  const packages = db.getPackages();
  res.json({ packages });
});

// Get user transaction history
router.get('/transactions', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const transactions = db.getUserTransactions(user.id);
  res.json({ transactions });
});

// Create checkout order
router.post('/create-order', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { packageId, provider } = req.body;

  if (!packageId) {
    res.status(400).json({ error: 'Package ID is required' });
    return;
  }

  const pkg = db.getPackageById(packageId);
  if (!pkg) {
    res.status(404).json({ error: 'Package not found' });
    return;
  }

  const order = db.createOrder(user.id, packageId, provider || 'stripe');

  res.status(201).json({
    order,
    package: pkg,
  });
});

// Confirm payment / webhook execution
router.post('/confirm-payment', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { orderId, reference } = req.body;

  if (!orderId) {
    res.status(400).json({ error: 'Order ID is required' });
    return;
  }

  const order = db.confirmOrderPayment(orderId, reference || `PAY_${Date.now()}`);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const wallet = db.getWalletByUserId(user.id);

  res.json({
    success: true,
    order,
    balance: wallet?.balance || 0,
    message: `Payment confirmed! Added ${order.creditsGranted} credits to your account.`,
  });
});

export const walletRouter = router;

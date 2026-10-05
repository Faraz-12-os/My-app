import { Router, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// Get tickets for user
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const tickets = db.getUserTickets(user.id);
  res.json({ tickets });
});

// Create new ticket
router.post('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { subject, category, priority, message } = req.body;

  if (!subject || !message) {
    res.status(400).json({ error: 'Subject and message are required' });
    return;
  }

  const ticket = db.createTicket(
    user.id,
    user.email,
    subject,
    category || 'service',
    priority || 'medium',
    message
  );

  res.status(201).json({ ticket });
});

// Get ticket details and conversation messages
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const ticket = db.getTicketById(req.params.id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  if (ticket.userId !== user.id && user.role !== 'admin') {
    res.status(403).json({ error: 'Unauthorized to view this ticket' });
    return;
  }

  const messages = db.getTicketMessages(ticket.id);
  res.json({ ticket, messages });
});

// Add reply to ticket
router.post('/:id/messages', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  const ticket = db.getTicketById(req.params.id);
  if (!ticket || (ticket.userId !== user.id && user.role !== 'admin')) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const senderRole = user.role === 'admin' ? 'admin' : 'user';
  const reply = db.addTicketReply(
    ticket.id,
    user.id,
    senderRole,
    user.email.split('@')[0],
    message
  );

  const messages = db.getTicketMessages(ticket.id);
  res.json({ message: reply, messages, ticket });
});

export const ticketRouter = router;

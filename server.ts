import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/authRoutes.ts';
import { emailRouter } from './server/routes/emailRoutes.ts';
import { numberRouter } from './server/routes/numberRoutes.ts';
import { walletRouter } from './server/routes/walletRoutes.ts';
import { ticketRouter } from './server/routes/ticketRoutes.ts';
import { adminRouter } from './server/routes/adminRoutes.ts';
import { rateLimit } from './server/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '5mb' }));

  // Basic request rate limiting
  app.use('/api', rateLimit(200, 60000));

  // Mount API endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/emails', emailRouter);
  app.use('/api/numbers', numberRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/tickets', ticketRouter);
  app.use('/api/admin', adminRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'TempShield Core API',
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TempShield Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

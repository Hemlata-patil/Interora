import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import apiRouter from './routes';
import rootRouter from './routes/root.routes';

// ─────────────────────────────────────────────────────────────────────────────
// Express application factory.
//
// Middleware order matters:
//  1. Security (helmet)
//  2. CORS  ← must be before route handlers
//  3. Body parsers
//  4. Cookie parser
//  5. Request logger
//  6. Routes
//  7. 404 handler
//  8. Error handler  ← must be last
// ─────────────────────────────────────────────────────────────────────────────

export function createApp(): Application {
  const app = express();

  // ── 1. Security headers ────────────────────────────────────────────────────
  app.use(helmet());

  // ── 2. CORS ────────────────────────────────────────────────────────────────
  // Allow the Vite frontend to send cookies (credentials: true).
  // The origin must be explicit (not '*') when credentials are enabled.
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,                // Required for HTTP-only cookies
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── 3. Body parsers ────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── 4. Cookie parser ───────────────────────────────────────────────────────
  // Parses Cookie header into req.cookies.
  // Future auth middleware will read env.COOKIE_NAME from req.cookies.
  app.use(cookieParser());

  // ── 5. Request logger ─────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── 6. Routes ─────────────────────────────────────────────────────────────
  app.use('/', rootRouter);       // GET /
  app.use('/api', apiRouter);     // GET /api/health, future /api/* routes

  // ── 7. 404 handler ────────────────────────────────────────────────────────
  app.use(notFound);

  // ── 8. Centralised error handler ──────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cookie helpers — re-exported from utils/cookie.ts.
// Auth controllers should import directly from './utils/cookie'.
// ─────────────────────────────────────────────────────────────────────────────
export { buildCookieOptions, parseExpiryToMs } from './utils/cookie';

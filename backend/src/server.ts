import { env } from './config/env';
import { createApp } from './app';

// ─────────────────────────────────────────────────────────────────────────────
// Server entry point.
//
// Responsibilities:
//  1. Load environment (via config/env.ts — already loaded by the import)
//  2. Create the Express application
//  3. Start listening on the configured port
//  4. Handle unhandled promise rejections and uncaught exceptions gracefully
//
// NOTE: Socket.IO will be attached here in a future phase.
// ─────────────────────────────────────────────────────────────────────────────

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log('');
  console.log('\x1b[36m╔══════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║       Interora Backend — Phase 0             ║\x1b[0m');
  console.log('\x1b[36m╚══════════════════════════════════════════════╝\x1b[0m');
  console.log(`\x1b[32m  ✔ Server running on http://localhost:${env.PORT}\x1b[0m`);
  console.log(`\x1b[32m  ✔ Environment: ${env.NODE_ENV}\x1b[0m`);
  console.log(`\x1b[32m  ✔ CORS origin: ${env.FRONTEND_URL}\x1b[0m`);
  console.log(`\x1b[32m  ✔ Health: http://localhost:${env.PORT}/api/health\x1b[0m`);
  console.log('');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────

function shutdown(signal: string) {
  console.log(`\n[server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[server] HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10 seconds if connections don't drain
  setTimeout(() => {
    console.error('[server] Forced exit after timeout.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Unhandled errors ──────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason: unknown) => {
  console.error('[server] Unhandled Promise Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err: Error) => {
  console.error('[server] Uncaught Exception:', err);
  shutdown('uncaughtException');
});

export default server;

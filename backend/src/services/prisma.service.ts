import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// Prisma client singleton.
//
// In development, ts-node-dev restarts the module system on every file save,
// which would create a new PrismaClient on each restart and exhaust the DB
// connection pool.  We cache the instance on `globalThis` to prevent that.
//
// In production, the module is loaded once per process — no caching needed.
// ─────────────────────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['error', 'warn'] : ['error'],
  });

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

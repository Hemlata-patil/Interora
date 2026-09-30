// ─────────────────────────────────────────────────────────────────────────────
// src/types/express/index.d.ts
//
// Extends Express's Request type so TypeScript recognises req.user globally
// after auth middleware attaches it.
// ─────────────────────────────────────────────────────────────────────────────

import { AuthenticatedUser } from '../index';

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by authMiddleware after JWT verification.
       * Undefined on unauthenticated / public routes.
       */
      user?: AuthenticatedUser;
    }
  }
}

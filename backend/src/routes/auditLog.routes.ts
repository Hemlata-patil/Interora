import { Router } from 'express';
import {
  listAuditLogsController,
  getAuditLogByIdController,
} from '../controllers/auditLog.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Routes — mounted at /api/audit-logs
//
// Audit logs are security/history records and are treated as strictly
// append-only. No public mutation endpoints (POST, PATCH, PUT, DELETE) are exposed.
// All read operations are strictly restricted to administrators.
// ─────────────────────────────────────────────────────────────────────────────

const auditLogRouter = Router();

// List audit logs with pagination and filters (Admin only)
auditLogRouter.get('/', authenticate, requireRole('admin'), listAuditLogsController);

// Get single audit log by ID (Admin only)
auditLogRouter.get('/:id', authenticate, requireRole('admin'), getAuditLogByIdController);

export default auditLogRouter;

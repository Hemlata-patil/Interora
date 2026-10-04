import { Router } from 'express';
import {
  listCertificatesController,
  getCertificateByIdController,
  issueCertificateController,
  updateCertificateController,
  revokeCertificateController,
  verifyCertificateController,
  listCertificateVerificationLogsController,
} from '../controllers/certificate.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Certificate Routes — mounted at /api/certificates
// ─────────────────────────────────────────────────────────────────────────────

const certificateRouter = Router();

// Public verification route for employers and third-party verifiers
// Logs scan timestamp, IP, and user-agent into CertificateVerificationLog
certificateRouter.get('/verify/:token', verifyCertificateController);

// List certificates (scoped to user role / ownership)
certificateRouter.get('/', authenticate, listCertificatesController);

// Get single certificate by ID
certificateRouter.get('/:id', authenticate, getCertificateByIdController);

// Issue a new certificate (Company hosting assignment, or Admin)
certificateRouter.post(
  '/',
  authenticate,
  requireRole('company', 'admin'),
  issueCertificateController
);

// Update certificate metadata
certificateRouter.patch(
  '/:id',
  authenticate,
  requireRole('company', 'admin'),
  updateCertificateController
);

// Revoke certificate with reason
certificateRouter.post(
  '/:id/revoke',
  authenticate,
  requireRole('company', 'admin'),
  revokeCertificateController
);

// List verification logs for a certificate
certificateRouter.get(
  '/:id/logs',
  authenticate,
  listCertificateVerificationLogsController
);

export default certificateRouter;

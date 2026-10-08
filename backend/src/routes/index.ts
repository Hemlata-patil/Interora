import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import departmentRouter from './department.routes';
import postingRouter from './posting.routes';
import applicationRouter from './application.routes';
import assignmentRouter from './assignment.routes';
import attendanceRouter from './attendance.routes';
import taskRouter from './task.routes';
import milestoneRouter from './milestone.routes';
import worklogRouter from './worklog.routes';
import weeklyReportRouter from './weeklyReport.routes';
import evaluationRouter from './evaluation.routes';
import healthScoreRouter, { riskFlagRouter } from './healthScore.routes';
import learningResourceRouter, { learningProgressRouter } from './learningResource.routes';
import placementReadinessRouter from './placementReadiness.routes';
import ppoOfferRouter from './ppoOffer.routes';
import certificateRouter from './certificate.routes';
import chatRouter from './chat.routes';
import notificationRouter from './notification.routes';
import auditLogRouter from './auditLog.routes';
import systemSettingRouter from './systemSetting.routes';
import adminRouter from './admin.routes';
import facultyRouter from './faculty.routes';
import mentorRouter from './mentor.routes';
import companyRouter from './company.routes';
import hodRouter from './hod.routes';
import { getPostingApplicationsController } from '../controllers/application.controller';
import { getAssignmentAttendanceController } from '../controllers/attendance.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

// ─────────────────────────────────────────────────────────────────────────────
// Central route aggregator.
//
// All feature routers will be imported and mounted here as the project grows.
// This keeps app.ts clean and routes self-contained.
//
// Prefix convention: /api/<resource>
// ─────────────────────────────────────────────────────────────────────────────

const router = Router();

// ── Phase 0: Infrastructure routes ───────────────────────────────────────────
router.use('/health', healthRouter);

// ── Phase 1: Authentication ───────────────────────────────────────────────────
router.use('/auth', authRouter);

// ── Department management ─────────────────────────────────────────────────────
router.use('/departments', departmentRouter);

// ── Applications for a specific posting (Company / Admin) ─────────────────────
router.get(
  '/postings/:postingId/applications',
  authenticate,
  requireRole('company', 'admin'),
  getPostingApplicationsController
);

// ── Internship Postings & Templates ───────────────────────────────────────────
router.use('/postings', postingRouter);

// ── Student Applications ──────────────────────────────────────────────────────
router.use('/applications', applicationRouter);

// ── Assignment Attendance ─────────────────────────────────────────────────────
router.get(
  '/assignments/:assignmentId/attendance',
  authenticate,
  getAssignmentAttendanceController
);

// ── Internship Assignments ────────────────────────────────────────────────────
router.use('/assignments', assignmentRouter);

// ── Attendance Records ────────────────────────────────────────────────────────
router.use('/attendance', attendanceRouter);

// ── Tasks & Task Submissions ──────────────────────────────────────────────────
router.use('/tasks', taskRouter);

// ── Operational Milestones ───────────────────────────────────────────────────
router.use('/milestones', milestoneRouter);

// ── Daily Work Logs ───────────────────────────────────────────────────────────
router.use('/work-logs', worklogRouter);

// ── Weekly Performance Reports ────────────────────────────────────────────────
router.use('/weekly-reports', weeklyReportRouter);

// ── Performance Evaluations ───────────────────────────────────────────────────
router.use('/evaluations', evaluationRouter);

// ── Health Score Snapshots ────────────────────────────────────────────────────
router.use('/health-scores', healthScoreRouter);

// ── Risk Flags ────────────────────────────────────────────────────────────────
router.use('/risk-flags', riskFlagRouter);

// ── Learning Resources ────────────────────────────────────────────────────────
router.use('/learning-resources', learningResourceRouter);

// ── Student Learning Progress ─────────────────────────────────────────────────
router.use('/learning-progress', learningProgressRouter);

// ── Placement Readiness ───────────────────────────────────────────────────────
router.use('/placement-readiness', placementReadinessRouter);

// ── PPO Offers ────────────────────────────────────────────────────────────────
router.use('/ppo-offers', ppoOfferRouter);

// ── Certificates & Verification ───────────────────────────────────────────────
router.use('/certificates', certificateRouter);

// ── Real-time Chat & Collaboration ────────────────────────────────────────────
router.use('/chat', chatRouter);

// ── Notifications ─────────────────────────────────────────────────────────────
router.use('/notifications', notificationRouter);

// ── Audit Logs ────────────────────────────────────────────────────────────────
router.use('/audit-logs', auditLogRouter);

// ── System Settings ───────────────────────────────────────────────────────────
router.use('/system-settings', systemSettingRouter);

// ── Admin Management & Governance ─────────────────────────────────────────────
router.use('/admin', adminRouter);

// ── Faculty Mentorship & Cohort Oversight ──────────────────────────────────
router.use('/faculty', facultyRouter);

// ── Company Mentor & Intern Supervision ────────────────────────────────────
router.use('/mentor', mentorRouter);

// ── Company Operations & Mentor Management ─────────────────────────────────
router.use('/company', companyRouter);

// ── HOD Operations ────────────────────────────────────────────────────────
router.use('/hod', hodRouter);

// ── Binary File Uploads (Resumes & Attendance Photos) ───────────────────────
import uploadRouter from './upload.routes';
router.use('/uploads', uploadRouter);

export default router;

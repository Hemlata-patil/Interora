import { Router } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';

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
// router.use('/internships',  internshipsRouter);
// router.use('/applications', applicationsRouter);
// router.use('/attendance',   attendanceRouter);
// router.use('/tasks',        tasksRouter);
// router.use('/milestones',   milestonesRouter);
// router.use('/certificates', certificatesRouter);
// router.use('/chat',         chatRouter);
// router.use('/faculty',      facultyRouter);
// router.use('/company',      companyRouter);
// router.use('/mentor',       mentorRouter);
// router.use('/admin',        adminRouter);

export default router;

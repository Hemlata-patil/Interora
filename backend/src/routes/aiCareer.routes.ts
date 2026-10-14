import { Router } from 'express';
import { analyzeCareerController, chatCareerController } from '../controllers/aiCareer.controller';
import { analyzeResumeController, getResumeAnalysisController } from '../controllers/aiResume.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const aiCareerRouter = Router();

// POST /api/ai/career/analyze – requires authenticated student or other role
aiCareerRouter.post('/career/analyze', authenticate, analyzeCareerController);

// POST /api/ai/career/chat – authenticated users can chat with career assistant
aiCareerRouter.post('/career/chat', authenticate, chatCareerController);

// POST /api/ai/resume/analyze – analyze authenticated student's uploaded resume
aiCareerRouter.post('/resume/analyze', authenticate, analyzeResumeController);

// GET /api/ai/resume/analysis – get cached resume analysis for authenticated student
aiCareerRouter.get('/resume/analysis', authenticate, getResumeAnalysisController);

export default aiCareerRouter;


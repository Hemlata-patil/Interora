// aiCareer.routes.ts
// Routes for AI career analysis and chat integration
import { Router } from 'express';
import { analyzeCareerController, chatCareerController } from '../controllers/aiCareer.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const aiCareerRouter = Router();

// POST /api/ai/career/analyze – requires authenticated student or other role
aiCareerRouter.post('/career/analyze', authenticate, analyzeCareerController);

// POST /api/ai/career/chat – authenticated users can chat with career assistant
aiCareerRouter.post('/career/chat', authenticate, chatCareerController);

export default aiCareerRouter;

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { analyzeCareer, chatCareer } from '../services/groqAi.service';

import prisma from '../services/prisma.service';

/**
 * POST /api/ai/career/analyze
 * Body: CareerAnalysisInput
 */
export async function analyzeCareerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body;
    if (!input || typeof input !== 'object' || !input.student || !input.internship) {
      throw new AppError(400, 'Missing or invalid CareerAnalysisInput request body');
    }

    // Authoritative verification against authenticated student profile
    if (req.user?.id) {
      const authProfile = await prisma.profile.findUnique({
        where: { id: req.user.id },
        include: { studentProfile: true },
      });

      if (authProfile) {
        // Enforce the authenticated student's real identity
        input.student.name = authProfile.fullName;
        if (authProfile.studentProfile?.course && (!input.student.education || input.student.education.includes('Senior Year'))) {
          input.student.education = authProfile.studentProfile.course;
        }
        if (Array.isArray(authProfile.studentProfile?.skills) && authProfile.studentProfile.skills.length > 0) {
          input.skills = input.skills || { technical: [], tools: [], languages: [] };
          input.skills.technical = authProfile.studentProfile.skills;
        }
      }
    }

    // Validate that student name is not empty or a demo placeholder
    if (!input.student.name || !input.student.name.trim()) {
      throw new AppError(400, 'Authenticated student name is required for career analysis');
    }

    const result = await analyzeCareer(input);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/career/chat
 * Body: { input: CareerAnalysisInput, userQuery: string, history: ChatMessage[] }
 */
export async function chatCareerController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input, userQuery, history } = req.body;
    if (!input || typeof userQuery !== 'string' || !Array.isArray(history)) {
      throw new AppError(400, 'Invalid request payload');
    }
    const reply = await chatCareer(input, userQuery, history);
    res.status(200).json({ success: true, data: reply });
  } catch (err) {
    next(err);
  }
}

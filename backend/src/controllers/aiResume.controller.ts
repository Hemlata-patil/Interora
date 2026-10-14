import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import prisma from '../services/prisma.service';
import { validateAndResolveResumePath, extractTextFromPdf } from '../utils/pdfExtractor';
import { analyzeResumeText, type ResumeAnalysisResult } from '../services/groqAi.service';

/**
 * POST /api/ai/resume/analyze
 * Body: { targetRole?: string; forceReanalyze?: boolean }
 * Analyzes the authenticated student's uploaded PDF resume with Groq AI.
 */
export async function analyzeResumeController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(401, 'Authentication required');
    }

    const { targetRole, forceReanalyze } = req.body || {};

    const profile = await prisma.profile.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!profile) {
      throw new AppError(404, 'User profile not found');
    }

    const studentProfile = profile.studentProfile;
    if (!studentProfile || !studentProfile.resumeUrl) {
      throw new AppError(
        404,
        'No uploaded resume found for your account. Please upload a PDF resume before requesting AI analysis.'
      );
    }

    // Return cached analysis if valid and forceReanalyze is false (Requirement 5)
    if (studentProfile.resumeAnalysis && !forceReanalyze) {
      res.status(200).json({
        success: true,
        data: studentProfile.resumeAnalysis,
        cached: true,
      });
      return;
    }

    // 1. Resolve and validate physical file path
    const safeFilePath = validateAndResolveResumePath(studentProfile.resumeUrl);

    // 2. Extract text with security and format validation
    const extractedText = await extractTextFromPdf(safeFilePath);

    // 3. Analyze extracted resume text via Groq AI
    const analysis: ResumeAnalysisResult = await analyzeResumeText(extractedText, {
      studentName: profile.fullName || 'Student',
      enrolledCourse: studentProfile.course || 'Computer Science & Engineering',
      targetRole: typeof targetRole === 'string' && targetRole.trim() ? targetRole.trim() : (studentProfile.course || 'Software Engineer'),
    });

    // 4. Persist result in PostgreSQL via Prisma
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        resumeAnalysis: analysis as any,
      },
    });

    res.status(200).json({
      success: true,
      data: analysis,
      cached: false,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/resume/analysis
 * Retrieves the cached resume analysis for the authenticated student.
 */
export async function getResumeAnalysisController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studentId = req.user?.id;
    if (!studentId) {
      throw new AppError(401, 'Authentication required');
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: {
        resumeUrl: true,
        resumeAnalysis: true,
      },
    });

    if (!studentProfile) {
      throw new AppError(404, 'Student profile not found');
    }

    res.status(200).json({
      success: true,
      data: studentProfile.resumeAnalysis || null,
      hasResume: !!studentProfile.resumeUrl,
      resumeUrl: studentProfile.resumeUrl || null,
    });
  } catch (err) {
    next(err);
  }
}

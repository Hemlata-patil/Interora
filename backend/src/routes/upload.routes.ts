import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../services/prisma.service';

const router = Router();

// Ensure upload directories exist
const uploadBaseDir = path.join(process.cwd(), 'uploads');
const resumesDir = path.join(uploadBaseDir, 'resumes');
const attendanceDir = path.join(uploadBaseDir, 'attendance');

[uploadBaseDir, resumesDir, attendanceDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, resumesDir);
    } else {
      cb(null, attendanceDir);
    }
  },
  filename: (req, file, cb) => {
    const user = (req as any).user;
    const userId = user?.id || 'anon';
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${userId}_${Date.now()}_${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// 1. Resume Upload (Student & authenticated users)
router.post(
  '/resume',
  authenticate,
  upload.single('resume'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(400, 'No resume file uploaded.');
      }

      const relativeUrl = `/uploads/resumes/${req.file.filename}`;
      const user = (req as any).user;

      // Update student profile if user is a student
      if (user && user.role === 'student') {
        await prisma.studentProfile
          .update({
            where: { id: user.id },
            data: { resumeUrl: relativeUrl },
          })
          .catch(() => {
            // Ignore if profile doesn't exist yet
          });
      }

      res.status(200).json({
        success: true,
        resumeUrl: relativeUrl,
        fileName: req.file.originalname,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 2. Attendance Photo Upload (Student check-in / check-out)
router.post(
  '/attendance-photo',
  authenticate,
  upload.single('photo'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(400, 'No attendance photo uploaded.');
      }

      const relativeUrl = `/uploads/attendance/${req.file.filename}`;
      res.status(200).json({
        success: true,
        photoUrl: relativeUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

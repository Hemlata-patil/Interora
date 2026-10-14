import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../services/prisma.service';
import { Prisma } from '@prisma/client';

const router = Router();

// Ensure upload directories exist
const uploadBaseDir = path.join(process.cwd(), 'uploads');
const resumesDir = path.join(uploadBaseDir, 'resumes');
const attendanceDir = path.join(uploadBaseDir, 'attendance');
const avatarsDir = path.join(uploadBaseDir, 'avatars');

[uploadBaseDir, resumesDir, attendanceDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, resumesDir);
    } else if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
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
    fileSize: 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'avatar' || file.fieldname === 'photo') {
      if (!ALLOWED_IMAGE_MIME.includes(file.mimetype.toLowerCase())) {
        return cb(new AppError(400, 'Invalid file type. Only JPG, JPEG, PNG, and WebP images are supported.'));
      }
    }
    cb(null, true);
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
            data: {
              resumeUrl: relativeUrl,
              resumeAnalysis: Prisma.DbNull,
            },
          })
          .catch(() => {
            // Ignore if profile doesn't exist yet
          });
      }

      res.status(200).json({
        success: true,
        data: {
          resumeUrl: relativeUrl,
          fileName: req.file.originalname,
        },
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

// 3. Profile Picture (Avatar) Upload
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(400, 'No avatar image file uploaded.');
      }

      // Check size specifically for avatar (max 5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        throw new AppError(400, 'Avatar image exceeds 5MB size limit.');
      }

      const relativeUrl = `/uploads/avatars/${req.file.filename}`;
      const user = (req as any).user;

      if (user?.id) {
        await prisma.profile.update({
          where: { id: user.id },
          data: { avatarUrl: relativeUrl },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          avatarUrl: relativeUrl,
          fileName: req.file.originalname,
        },
        avatarUrl: relativeUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4. Profile Picture (Avatar) Removal
router.delete(
  '/avatar',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user?.id) {
        throw new AppError(401, 'Unauthorized');
      }

      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      });

      if (profile?.avatarUrl) {
        const filePath = path.join(process.cwd(), profile.avatarUrl.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch {
            // Ignore unlink failure
          }
        }
      }

      await prisma.profile.update({
        where: { id: user.id },
        data: { avatarUrl: null },
      });

      res.status(200).json({
        success: true,
        message: 'Profile picture removed successfully.',
        avatarUrl: null,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

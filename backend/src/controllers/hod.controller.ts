import { Request, Response, NextFunction } from 'express';
import * as hodService from '../services/hod.service';
import type { ApiSuccess } from '../types';
import { AppRole } from '@prisma/client';

export async function getDashboardController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    const data = await hodService.getDashboardMetrics(hodId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    const data = await hodService.getDepartmentFaculty(hodId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getStudentsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    const data = await hodService.getDepartmentStudents(hodId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function assignFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    const { studentId, facultyId } = req.body;
    
    if (!studentId || !facultyId) {
      res.status(400).json({ success: false, error: { code: 400, message: 'Missing studentId or facultyId' }});
      return;
    }
    
    const data = await hodService.assignFacultyToStudent(hodId, studentId, facultyId);
    res.status(200).json({ success: true, message: 'Faculty assigned successfully.', data });
  } catch (err) {
    next(err);
  }
}

export async function createFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    
    const { name, email, designation, phone, password } = req.body;
    if (!name || !email) {
      res.status(400).json({ success: false, error: { code: 400, message: 'Missing name or email' }});
      return;
    }
    
    const data = await hodService.createDepartmentFaculty(hodId, {
      name,
      email,
      designation,
      phone,
      password
    });
    
    res.status(201).json({ success: true, message: 'Faculty created successfully', data });
  } catch (err) {
    next(err);
  }
}

export async function deactivateFacultyController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    
    const facultyId = req.params.id;
    const { status } = req.body;
    
    if (status !== 'active' && status !== 'inactive') {
      res.status(400).json({ success: false, error: { code: 400, message: 'Invalid status' }});
      return;
    }
    
    const data = await hodService.updateFacultyStatus(hodId, facultyId, status);
    res.status(200).json({ success: true, message: 'Faculty status updated successfully', data });
  } catch (err) {
    next(err);
  }
}

export async function getInternshipsController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    const data = await hodService.getDepartmentInternships(hodId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getProgressController(
  req: Request,
  res: Response<ApiSuccess>,
  next: NextFunction
): Promise<void> {
  try {
    const hodId = req.user?.id;
    if (!hodId) throw new Error('Unauthorized');
    const data = await hodService.getDepartmentStudentProgress(hodId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

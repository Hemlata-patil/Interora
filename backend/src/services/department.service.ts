import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Department Service — business logic and database interactions for departments.
// ─────────────────────────────────────────────────────────────────────────────

export interface DepartmentRecord {
  id: string;
  code: string;
  name: string;
  program: string;
  headOfDepartmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentInput {
  code: string;
  name: string;
  program?: string;
  headOfDepartmentId?: string | null;
}

export interface UpdateDepartmentInput {
  code?: string;
  name?: string;
  program?: string;
  headOfDepartmentId?: string | null;
}

const DEPARTMENT_SELECT = {
  id: true,
  code: true,
  name: true,
  program: true,
  headOfDepartmentId: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Lists all departments, ordered by name (or code) ascending by default.
 */
export async function listDepartments(options?: {
  sortBy?: 'name' | 'code';
  sortOrder?: 'asc' | 'desc';
}): Promise<DepartmentRecord[]> {
  const orderField = options?.sortBy === 'code' ? 'code' : 'name';
  const orderDirection = options?.sortOrder === 'desc' ? 'desc' : 'asc';

  return prisma.department.findMany({
    select: DEPARTMENT_SELECT,
    orderBy: {
      [orderField]: orderDirection,
    },
  });
}

/**
 * Retrieves a single department by its UUID.
 * Throws 404 AppError if not found.
 */
export async function getDepartmentById(id: string): Promise<DepartmentRecord> {
  const department = await prisma.department.findUnique({
    where: { id },
    select: DEPARTMENT_SELECT,
  });

  if (!department) {
    throw new AppError(404, `Department with ID '${id}' not found.`);
  }

  return department;
}

/**
 * Creates a new department.
 * Throws 409 AppError if code is already taken.
 */
export async function createDepartment(input: CreateDepartmentInput): Promise<DepartmentRecord> {
  const trimmedCode = input.code.trim().toUpperCase();
  const trimmedName = input.name.trim();
  const program = input.program?.trim() || 'B.Tech';

  // 1. Check duplicate department code
  const existing = await prisma.department.findUnique({
    where: { code: trimmedCode },
  });
  if (existing) {
    throw new AppError(409, `Department with code '${trimmedCode}' already exists.`);
  }

  // 2. Validate head of department profile if provided
  if (input.headOfDepartmentId) {
    const hod = await prisma.profile.findUnique({
      where: { id: input.headOfDepartmentId },
    });
    if (!hod) {
      throw new AppError(404, `Profile with ID '${input.headOfDepartmentId}' not found.`);
    }
  }

  return prisma.department.create({
    data: {
      code: trimmedCode,
      name: trimmedName,
      program,
      headOfDepartmentId: input.headOfDepartmentId ?? null,
    },
    select: DEPARTMENT_SELECT,
  });
}

/**
 * Updates an existing department.
 * Throws 404 if department not found.
 * Throws 409 if new code conflicts with another department.
 */
export async function updateDepartment(
  id: string,
  input: UpdateDepartmentInput
): Promise<DepartmentRecord> {
  const department = await prisma.department.findUnique({
    where: { id },
  });

  if (!department) {
    throw new AppError(404, `Department with ID '${id}' not found.`);
  }

  let codeToUpdate: string | undefined;
  if (input.code !== undefined) {
    const trimmedCode = input.code.trim().toUpperCase();
    if (trimmedCode !== department.code) {
      const codeExists = await prisma.department.findUnique({
        where: { code: trimmedCode },
      });
      if (codeExists) {
        throw new AppError(409, `Department with code '${trimmedCode}' already exists.`);
      }
    }
    codeToUpdate = trimmedCode;
  }

  // Validate head of department if provided
  if (input.headOfDepartmentId) {
    const hod = await prisma.profile.findUnique({
      where: { id: input.headOfDepartmentId },
    });
    if (!hod) {
      throw new AppError(404, `Profile with ID '${input.headOfDepartmentId}' not found.`);
    }
  }

  return prisma.department.update({
    where: { id },
    data: {
      ...(codeToUpdate !== undefined && { code: codeToUpdate }),
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.program !== undefined && { program: input.program.trim() }),
      ...(input.headOfDepartmentId !== undefined && { headOfDepartmentId: input.headOfDepartmentId }),
    },
    select: DEPARTMENT_SELECT,
  });
}

/**
 * Deletes a department by ID.
 * Throws 404 if not found.
 * Throws 409 if the department is referenced by any student or faculty member.
 */
export async function deleteDepartment(id: string): Promise<{ id: string; code: string; name: string }> {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          students: true,
          facultyMembers: true,
        },
      },
    },
  });

  if (!department) {
    throw new AppError(404, `Department with ID '${id}' not found.`);
  }

  // Enforce referential integrity guard before deletion
  const studentCount = department._count.students;
  const facultyCount = department._count.facultyMembers;

  if (studentCount > 0 || facultyCount > 0) {
    throw new AppError(
      409,
      `Cannot delete department '${department.name}' (${department.code}) because it is currently assigned to ${studentCount} student(s) and ${facultyCount} faculty member(s).`
    );
  }

  await prisma.department.delete({
    where: { id },
  });

  return {
    id: department.id,
    code: department.code,
    name: department.name,
  };
}

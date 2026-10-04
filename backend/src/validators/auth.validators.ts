import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Authentication Zod validators.
//
// Mirrors the registration rules from the Supabase auth trigger:
//   - Only 'student' and 'company' may self-register.
//   - Faculty / admin accounts are provisioned by an administrator.
// ─────────────────────────────────────────────────────────────────────────────

// ── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('A valid email address is required')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password cannot exceed 72 characters'), // bcrypt processes max 72 bytes

  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(1, 'Full name cannot be empty')
    .max(255, 'Full name is too long')
    .trim(),

  role: z
    .enum(['student', 'company'], {
      errorMap: () => ({ message: "Role must be 'student' or 'company'" }),
    })
    .optional()
    .default('student'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('A valid email address is required')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Update Profile (PATCH /api/auth/me) ──────────────────────────────────────

export const PROHIBITED_PROFILE_FIELDS = [
  'role',
  'accountStatus',
  'account_status',
  'email',
  'id',
  'password',
  'passwordHash',
  'password_hash',
  'approvalStatus',
  'approval_status',
  'studentId',
  'student_id',
  'departmentId',
  'department_id',
  'createdAt',
  'created_at',
  'updatedAt',
  'updated_at',
];

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(150, 'Full name is too long').optional(),
  phone: z.string().trim().max(30, 'Phone number is too long').optional().nullable(),
  avatarUrl: z.string().trim().max(1000, 'Avatar URL is too long').optional().nullable(),
  course: z.string().trim().max(100, 'Course is too long').optional(),
  currentSemester: z
    .union([z.string().trim().max(20, 'Current semester is too long'), z.number()])
    .transform((v) => String(v))
    .optional(),
  batchYear: z
    .union([z.string().trim().max(10, 'Batch year is too long'), z.number()])
    .transform((v) => String(v))
    .optional(),
  batchDivision: z.string().trim().max(10, 'Batch division is too long').optional(),
  skills: z.array(z.string().trim().min(1).max(50)).max(50, 'Too many skills').optional(),
  resumeUrl: z.string().trim().max(1000, 'Resume URL is too long').optional().nullable(),
  designation: z.string().trim().max(100, 'Designation is too long').optional(),
  cabinLocation: z.string().trim().max(100, 'Cabin location is too long').optional().nullable(),
  officePhone: z.string().trim().max(30, 'Office phone is too long').optional().nullable(),
  companyName: z.string().trim().max(200, 'Company name is too long').optional(),
  industryDomain: z.string().trim().max(100, 'Industry domain is too long').optional(),
  contactPerson: z.string().trim().max(150, 'Contact person is too long').optional(),
  website: z.string().trim().max(255, 'Website is too long').optional().nullable(),
  companyAddress: z.string().trim().max(500, 'Company address is too long').optional().nullable(),
  geoLat: z.number().optional().nullable(),
  geoLng: z.number().optional().nullable(),
  geoFenceRadiusM: z.number().min(10).max(10000).optional(),
});

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  course?: string;
  currentSemester?: string | number;
  batchYear?: string | number;
  batchDivision?: string;
  skills?: string[];
  resumeUrl?: string | null;
  designation?: string;
  cabinLocation?: string | null;
  officePhone?: string | null;
  companyName?: string;
  industryDomain?: string;
  contactPerson?: string;
  website?: string | null;
  companyAddress?: string | null;
  geoLat?: number | null;
  geoLng?: number | null;
  geoFenceRadiusM?: number;
}

// ── Shared validation helper ──────────────────────────────────────────────────

/**
 * Parses a Zod schema against raw input.
 * Returns `{ success, data }` or `{ success: false, errors }`.
 * The caller decides whether to throw or return early.
 */
export function parseSchema<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join('.') || '_';
    if (!errors[field]) errors[field] = [];
    errors[field].push(issue.message);
  }
  return { success: false, errors };
}

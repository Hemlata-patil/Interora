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

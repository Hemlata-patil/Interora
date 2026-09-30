// ─────────────────────────────────────────────────────────────────────────────
// src/utils/index.ts
//
// General-purpose utility functions.
// Add helpers here as they are needed across phases.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a camelCase or PascalCase string to snake_case.
 * Useful for mapping TypeScript field names to database column names.
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Converts a snake_case string to camelCase.
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * Useful for rate limiting and testing.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strips undefined fields from an object (shallow).
 * Useful before passing update payloads to Prisma.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

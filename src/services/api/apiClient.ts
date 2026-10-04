// ─────────────────────────────────────────────────────────────────────────────
// Interora Frontend API Client
//
// Typed native fetch wrapper configured for the Express + Prisma backend.
// Uses HTTP-only cookie session authentication via the Vite dev proxy (/api).
// Tokens are NEVER stored in localStorage or accessible to client-side scripts.
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

const BASE_URL = '/api';

/**
 * Builds a query string from a params dictionary, omitting undefined and null values.
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null) {
      searchParams.append(key, String(val));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Normalizes an API path to always resolve against BASE_URL.
 */
function resolveUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const fullPath = cleanPath.startsWith(BASE_URL) ? cleanPath : `${BASE_URL}${cleanPath}`;
  return `${fullPath}${buildQueryString(params)}`;
}

/**
 * Core HTTP request handler.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, headers, ...restOptions } = options;
  const url = resolveUrl(path, params);

  const mergedHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  };

  if (restOptions.body && typeof restOptions.body === 'string' && !('Content-Type' in (mergedHeaders as Record<string, string>))) {
    (mergedHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: mergedHeaders,
    credentials: 'include', // Guarantees HTTP-only session cookie is attached
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (networkErr: any) {
    throw new ApiClientError(0, networkErr.message || 'Network request failed. Is the backend server running?');
  }

  // Parse response body safely
  const text = await response.text();
  let parsed: any = null;
  if (text && text.trim().length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Non-JSON response (e.g. gateway error or HTML)
      parsed = { success: response.ok, message: text };
    }
  } else {
    parsed = { success: response.ok };
  }

  if (!response.ok) {
    const errorMsg =
      parsed?.message ||
      (parsed?.errors ? Object.values(parsed.errors).flat().join(', ') : response.statusText) ||
      'Request failed';
    throw new ApiClientError(response.status, errorMsg, parsed?.errors);
  }

  return parsed as ApiResponse<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) => {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: isFormData ? (body as BodyInit) : (body !== undefined ? JSON.stringify(body) : undefined),
    });
  },

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export default apiClient;

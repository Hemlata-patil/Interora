/**
 * Resolves a media or avatar URL to a reliable absolute or proxied path.
 * Supports:
 * - Local blob URLs (blob:http://...)
 * - Data URLs (data:image/...)
 * - External absolute URLs (http://... or https://...)
 * - Backend relative uploads (/uploads/avatars/...)
 */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Blob and data URLs are used for local client previews
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // If environment specifies an explicit backend origin
  const backendUrl =
    (import.meta as any).env?.VITE_BACKEND_URL ||
    (import.meta as any).env?.VITE_API_BASE_URL;

  if (backendUrl) {
    return `${backendUrl.replace(/\/$/, '')}${cleanPath}`;
  }

  // By default in dev, Vite proxies /uploads to http://localhost:3001
  return cleanPath;
}

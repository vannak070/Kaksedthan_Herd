/**
 * Utility function to resolve image URLs safely across Development (localhost) and Production environments.
 * - Preserves base64 Data URLs
 * - Resolves relative static assets (/logo.png, /apple-touch-icon.png)
 * - Normalizes /uploads/... paths
 * - Strips accidental hardcoded localhost/127.0.0.1 domain prefixes
 */
export function resolveImageUrl(src?: string | null, fallback: string = '/logo.png'): string {
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return fallback;
  }

  const trimmed = src.trim();

  // 1. Base64 Data URLs (e.g., data:image/jpeg;base64,...) -> Return directly
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  // 2. Strip hardcoded localhost / 127.0.0.1 domain prefixes
  let normalized = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');

  // 3. External HTTP/HTTPS URLs -> Return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  // 4. Ensure relative path has a leading slash
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  return normalized;
}

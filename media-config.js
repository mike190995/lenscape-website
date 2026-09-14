/**
 * LENSCAPE — MEDIA CDN & STREAMING CONFIGURATION
 * Resolves media paths against Cloud Storage / CDN bucket when configured,
 * with zero-config local fallback for development and offline serving.
 */

export const MEDIA_CDN_BASE = (
  (typeof window !== 'undefined' && window.LENSCAPE_CONFIG?.mediaCdnUrl) ||
  import.meta.env?.VITE_MEDIA_CDN_URL ||
  ''
).replace(/\/+$/, '');

/**
 * Resolves asset URL against CDN base
 * @param {string} path - Relative asset path (e.g., '/Portfolio/Our Work/Videos/...')
 * @returns {string} - Fully qualified CDN URL or local path
 */
export function resolveMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Dynamically map legacy JPG/PNG formats inside public/Portfolio to optimized WebP
  if (cleanPath.startsWith('/Portfolio/') && /\.(jpe?g|png)$/i.test(cleanPath)) {
    cleanPath = cleanPath.replace(/\.(jpe?g|png)$/i, '.webp');
  }

  return MEDIA_CDN_BASE ? `${MEDIA_CDN_BASE}${cleanPath}` : cleanPath;
}

/**
 * Resolves HLS stream URL if available, falling back to standard video source
 * @param {string} videoPath - Original video path
 * @returns {Object} { hlsUrl: string, mp4Url: string }
 */
export function resolveVideoStream(videoPath) {
  const mp4Url = resolveMediaUrl(videoPath);
  // HLS stream replaces .mp4 with .m3u8 if hosted on CDN
  const hlsUrl = MEDIA_CDN_BASE && videoPath.endsWith('.mp4')
    ? resolveMediaUrl(videoPath.replace(/\.mp4$/i, '/index.m3u8'))
    : '';

  return { mp4Url, hlsUrl };
}

if (typeof window !== 'undefined') {
  window.resolveMediaUrl = resolveMediaUrl;
  window.resolveVideoStream = resolveVideoStream;
}

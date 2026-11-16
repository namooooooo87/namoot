export function resolveAssetUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  if (url.startsWith('/assets/') || url.startsWith('/src/assets/')) {
    return `${normalizedBase}${url.slice(1)}`;
  }
  return url;
}

export function encodeSecureToken(rawToken: string): string {
  if (!rawToken) return '';
  return btoa(rawToken).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeSecureToken(encodedToken: string): string {
  if (!encodedToken) return '';
  const normalized = encodedToken.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingNeeded);

  try {
    return atob(padded);
  } catch {
    return encodedToken;
  }
}

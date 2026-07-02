const VERIFICATION_SESSION_KEY = 'panelist_verification_session';

export interface VerificationSession {
  token?: string;
  verificationParams: Record<string, string>;
  verifiedAt: string;
}

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function saveVerificationSession(session: VerificationSession) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(VERIFICATION_SESSION_KEY, JSON.stringify(session));
}

export function getVerificationSession(): VerificationSession | null {
  if (!canUseSessionStorage()) return null;
  const raw = window.sessionStorage.getItem(VERIFICATION_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as VerificationSession;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.verifiedAt || !parsed.verificationParams) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearVerificationSession() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(VERIFICATION_SESSION_KEY);
}

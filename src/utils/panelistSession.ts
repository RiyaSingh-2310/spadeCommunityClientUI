export interface PanelistUser {
  id: number;
  name: string;
  email: string;
  balance_point: number;
  questionnaire?: string;
  questionnaire_url?: string;
  profile_image?: string | null;
}

interface PanelistSession {
  token: string;
  user: PanelistUser;
}

const SESSION_KEY = 'panelist_auth_session';

export function getPanelistSession(): PanelistSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PanelistSession;
    if (!parsed?.token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePanelistSession(session: PanelistSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem('panelist_ui_logged_in', 'true');
  window.dispatchEvent(new CustomEvent('panelist-auth-changed'));
}

export function clearPanelistSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem('panelist_ui_logged_in');
  window.dispatchEvent(new CustomEvent('panelist-auth-changed'));
}

export function getPanelistAuthToken(): string {
  return getPanelistSession()?.token ?? '';
}

export function isPanelistLoggedIn(): boolean {
  return Boolean(getPanelistSession()?.token);
}

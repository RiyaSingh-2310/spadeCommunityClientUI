const ACTIVATION_SUCCESS_KEY = 'panelist_activation_success';

export interface ActivationSuccessState {
  token: string;
  activatedAt: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Persist activation in localStorage so Home state survives refresh
 * (and matches signup/member session durability).
 */
export function saveActivationSuccess(token: string) {
  if (!canUseStorage()) return;
  const state: ActivationSuccessState = {
    token,
    activatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(ACTIVATION_SUCCESS_KEY, JSON.stringify(state));
  // Clear legacy sessionStorage key if present.
  try {
    window.sessionStorage.removeItem(ACTIVATION_SUCCESS_KEY);
  } catch {
    // ignore
  }
}

export function getActivationSuccess(): ActivationSuccessState | null {
  if (!canUseStorage()) return null;

  const raw =
    window.localStorage.getItem(ACTIVATION_SUCCESS_KEY) ??
    (typeof window.sessionStorage !== 'undefined'
      ? window.sessionStorage.getItem(ACTIVATION_SUCCESS_KEY)
      : null);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ActivationSuccessState;
    if (!parsed?.token || !parsed.activatedAt) return null;

    // Migrate legacy sessionStorage entries to localStorage.
    if (!window.localStorage.getItem(ACTIVATION_SUCCESS_KEY)) {
      window.localStorage.setItem(ACTIVATION_SUCCESS_KEY, raw);
    }

    return parsed;
  } catch {
    return null;
  }
}

export function wasTokenActivated(token: string): boolean {
  const session = getActivationSuccess();
  return session?.token === token;
}

export function clearActivationSuccess(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACTIVATION_SUCCESS_KEY);
  try {
    window.sessionStorage.removeItem(ACTIVATION_SUCCESS_KEY);
  } catch {
    // ignore
  }
}

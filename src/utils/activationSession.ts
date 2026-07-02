const ACTIVATION_SUCCESS_KEY = 'panelist_activation_success';

export interface ActivationSuccessState {
  token: string;
  activatedAt: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function saveActivationSuccess(token: string) {
  if (!canUseStorage()) return;
  const state: ActivationSuccessState = {
    token,
    activatedAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(ACTIVATION_SUCCESS_KEY, JSON.stringify(state));
}

export function getActivationSuccess(): ActivationSuccessState | null {
  if (!canUseStorage()) return null;
  const raw = window.sessionStorage.getItem(ACTIVATION_SUCCESS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ActivationSuccessState;
    if (!parsed?.token || !parsed.activatedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function wasTokenActivated(token: string): boolean {
  const session = getActivationSuccess();
  return session?.token === token;
}

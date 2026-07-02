const SIGNUP_SUCCESS_KEY = 'panelist_signup_success';

export interface SignupSuccessState {
  message: string;
  email: string;
  completedAt: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveSignupSuccess(state: SignupSuccessState) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SIGNUP_SUCCESS_KEY, JSON.stringify(state));
}

export function getSignupSuccess(): SignupSuccessState | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(SIGNUP_SUCCESS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SignupSuccessState;
    if (!parsed?.completedAt || !parsed.message) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSignupSuccess() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SIGNUP_SUCCESS_KEY);
}

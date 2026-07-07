const MEMBER_COMPLETE_KEY = 'panelist_onboarding_complete';

export interface MemberCompleteState {
  email?: string;
  completedAt: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveMemberComplete(state: MemberCompleteState) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(MEMBER_COMPLETE_KEY, JSON.stringify(state));
}

export function getMemberComplete(): MemberCompleteState | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(MEMBER_COMPLETE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as MemberCompleteState;
    if (!parsed?.completedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMemberComplete() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(MEMBER_COMPLETE_KEY);
}

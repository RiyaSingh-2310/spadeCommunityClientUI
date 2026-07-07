import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getActivationSuccess } from '../utils/activationSession';
import { getMemberComplete } from '../utils/memberSession';
import { getSignupSuccess } from '../utils/signupSession';

export type OnboardingPhase = 'none' | 'registered' | 'activated' | 'member';

export interface OnboardingState {
  phase: OnboardingPhase;
  email?: string;
}

export function useOnboardingState(refreshKey = 0): OnboardingState {
  const { pathname } = useLocation();
  const [storageVersion, setStorageVersion] = useState(0);

  useEffect(() => {
    const bump = () => setStorageVersion((v) => v + 1);
    window.addEventListener('storage', bump);
    window.addEventListener('focus', bump);
    window.addEventListener('onboarding-updated', bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener('focus', bump);
      window.removeEventListener('onboarding-updated', bump);
    };
  }, []);

  return useMemo(() => {
    void pathname;
    void refreshKey;
    void storageVersion;

    const member = getMemberComplete();
    if (member) {
      return { phase: 'member', email: member.email };
    }

    const activation = getActivationSuccess();
    if (activation) {
      const signup = getSignupSuccess();
      return { phase: 'activated', email: signup?.email };
    }

    const signup = getSignupSuccess();
    if (signup) {
      return { phase: 'registered', email: signup.email };
    }

    return { phase: 'none' };
  }, [pathname, refreshKey, storageVersion]);
}

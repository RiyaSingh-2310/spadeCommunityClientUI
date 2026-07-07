import { clearActivationSuccess } from './activationSession';
import { clearMemberComplete } from './memberSession';
import { clearSignupSuccess } from './signupSession';
import { clearVerificationSession } from './verificationSession';

/** Clears persisted signup, activation, and questionnaire invitation state. */
export function clearOnboardingState(): void {
  clearSignupSuccess();
  clearActivationSuccess();
  clearVerificationSession();
}

/** Clears all onboarding state including completed member profile. */
export function clearAllOnboardingState(): void {
  clearOnboardingState();
  clearMemberComplete();
}

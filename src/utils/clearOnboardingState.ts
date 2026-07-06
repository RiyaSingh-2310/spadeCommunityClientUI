import { clearActivationSuccess } from './activationSession';
import { clearSignupSuccess } from './signupSession';
import { clearVerificationSession } from './verificationSession';

/** Clears persisted signup, activation, and questionnaire invitation state. */
export function clearOnboardingState(): void {
  clearSignupSuccess();
  clearActivationSuccess();
  clearVerificationSession();
}

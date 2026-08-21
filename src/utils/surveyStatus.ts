import { getActivationSuccess } from './activationSession';
import { getMemberComplete } from './memberSession';
import type { PanelistUser } from './panelistSession';
import { getQuestionnaireUrlData } from './questionnaireLink';
import { getSignupSuccess } from './signupSession';

const COMPLETE_STATUSES = new Set([
  'complete',
  'completed',
  'done',
  'finished',
  'yes',
  '1',
  'true',
  'submitted',
]);

const PENDING_STATUSES = new Set([
  'pending',
  'incomplete',
  'not_completed',
  'not completed',
  'in_progress',
  'in progress',
  'open',
  '0',
  'false',
  'no',
]);

/**
 * Whether the panelist has finished the onboarding questionnaire/survey.
 * Prefers local member completion, then profile questionnaire fields from the API.
 */
export function isSurveyCompleted(user?: PanelistUser | null): boolean {
  if (getMemberComplete()) return true;

  if (user) {
    const status = (user.questionnaire ?? '').toLowerCase().trim();
    if (COMPLETE_STATUSES.has(status)) return true;
    if (PENDING_STATUSES.has(status)) return false;
    if (user.questionnaire_url?.trim()) return false;
  }

  // Locally verified, but survey not finished yet.
  if (getActivationSuccess()) return false;

  // Authenticated panelist with no incomplete signals — treat survey as complete for Home UX.
  return Boolean(user);
}

/** Resolve an in-app questionnaire path from profile or signup session data. */
export function getSurveyPath(user?: PanelistUser | null): string | null {
  const candidates = [user?.questionnaire_url, getSignupSuccess()?.questionnaireUrl];

  for (const raw of candidates) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const data = getQuestionnaireUrlData(trimmed);
    if (data?.path) return data.path;
  }

  return null;
}

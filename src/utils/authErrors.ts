import { ApiError } from '../api/ApiError';
import { getApiBaseUrl, isApiUsingProductionFallback } from '../config/api';
import { contactInfo } from '../data/mockData';

export type AuthErrorKind =
  | 'unverified_existing'
  | 'already_exists'
  | 'not_verified'
  | 'invalid_credentials'
  | 'questionnaire_incomplete'
  | 'network'
  | 'generic';

export interface AuthErrorInfo {
  kind: AuthErrorKind;
  message: string;
  suggestContactSupport: boolean;
  suggestLogin: boolean;
  supportEmail: string;
}

function normalizeMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message.trim();
  if (error instanceof Error) return error.message.trim();
  if (typeof error === 'string') return error.trim();
  return '';
}

function getStatus(error: unknown): number | null {
  return error instanceof ApiError ? error.status : null;
}

function includesAny(text: string, needles: string[]) {
  const lower = text.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

function getNetworkMessage(): string {
  const apiBase = getApiBaseUrl();
  if (apiBase.includes('localhost') || apiBase.includes('127.0.0.1')) {
    return (
      'Unable to reach the server. This deployment is misconfigured ' +
      '(API points to localhost). Please contact support.'
    );
  }

  if (isApiUsingProductionFallback()) {
    return (
      'Unable to connect to the server. Please check your internet connection and try again. ' +
      'If the problem continues, contact support.'
    );
  }

  return 'Unable to connect to the server. Please check your internet connection and try again.';
}

/**
 * Classify signup / login API failures into actionable UX messages.
 */
export function classifyAuthError(
  error: unknown,
  context: 'signup' | 'login' = 'login'
): AuthErrorInfo {
  const supportEmail = contactInfo.email;
  const raw = normalizeMessage(error);
  const status = getStatus(error);

  if (isNetworkError(error)) {
    return {
      kind: 'network',
      message: getNetworkMessage(),
      suggestContactSupport: true,
      suggestLogin: false,
      supportEmail,
    };
  }

  const mentionsExists = includesAny(raw, [
    'already exists',
    'already registered',
    'email exists',
    'already taken',
    'duplicate',
    'already in use',
  ]);
  const mentionsNotVerified = includesAny(raw, [
    'not verified',
    'not yet verified',
    'unverified',
    'verify your email',
    'email is not verified',
    'account is not verified',
    'please verify',
    'activation',
  ]);
  const mentionsQuestionnaire = includesAny(raw, [
    'questionnaire',
    'survey',
    'complete your panel',
    'profile incomplete',
    'onboarding',
  ]);
  const mentionsInvalidCredentials = includesAny(raw, [
    'invalid credentials',
    'incorrect password',
    'wrong password',
    'invalid email or password',
    'invalid login',
    'authentication failed',
  ]);

  // Signup: existing email that is not verified (or "already exists" dead-end).
  if (context === 'signup' && (mentionsExists || (mentionsNotVerified && status === 409))) {
    if (mentionsNotVerified || mentionsExists) {
      return {
        kind: 'unverified_existing',
        message:
          'Your account is already registered but not yet verified. Please check your email for the verification link.',
        suggestContactSupport: true,
        suggestLogin: true,
        supportEmail,
      };
    }
  }

  if (mentionsNotVerified) {
    return {
      kind: 'not_verified',
      message:
        raw ||
        'Your email is not verified yet. Please check your inbox for the verification link before signing in.',
      suggestContactSupport: true,
      suggestLogin: false,
      supportEmail,
    };
  }

  if (context === 'signup' && mentionsExists) {
    return {
      kind: 'already_exists',
      message:
        'An account with this email already exists. If you have not verified your email yet, please check your inbox for the verification link.',
      suggestContactSupport: true,
      suggestLogin: true,
      supportEmail,
    };
  }

  if (mentionsQuestionnaire || (context === 'login' && status === 403 && !mentionsNotVerified)) {
    return {
      kind: 'questionnaire_incomplete',
      message:
        raw ||
        'Please complete your panel questionnaire before logging in. Use the questionnaire link sent to your email.',
      suggestContactSupport: true,
      suggestLogin: false,
      supportEmail,
    };
  }

  if (mentionsInvalidCredentials || (context === 'login' && (status === 401 || status === 400))) {
    return {
      kind: 'invalid_credentials',
      message: raw || 'Invalid email or password. Please check your credentials and try again.',
      suggestContactSupport: false,
      suggestLogin: false,
      supportEmail,
    };
  }

  return {
    kind: 'generic',
    message:
      raw ||
      (context === 'signup'
        ? 'Signup failed. Please try again.'
        : 'Unable to sign in right now. Please try again.'),
    suggestContactSupport: true,
    suggestLogin: false,
    supportEmail,
  };
}

export function getSignupRequestErrorMessage(error: unknown): string {
  return classifyAuthError(error, 'signup').message;
}

export function getLoginRequestErrorMessage(error: unknown): string {
  return classifyAuthError(error, 'login').message;
}

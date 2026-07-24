import { classifyAuthError, getSignupRequestErrorMessage as classifySignupMessage } from './authErrors';
import { ApiError } from '../api/ApiError';
import { getApiBaseUrl, isApiUsingProductionFallback } from '../config/api';

/** @deprecated Prefer classifyAuthError — kept for existing imports */
export function getSignupRequestErrorMessage(error: unknown): string {
  return classifySignupMessage(error);
}

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message.trim()) {
    return error.message;
  }

  if (error instanceof TypeError) {
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

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export { classifyAuthError };

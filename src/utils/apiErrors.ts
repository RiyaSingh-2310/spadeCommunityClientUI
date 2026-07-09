import { ApiError } from '../api/ApiError';
import { getApiBaseUrl, isApiUsingProductionFallback } from '../config/api';

export function getSignupRequestErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    const apiBase = getApiBaseUrl();
    if (apiBase.includes('localhost') || apiBase.includes('127.0.0.1')) {
      return (
        'Unable to reach the signup server. This deployment is misconfigured ' +
        '(API points to localhost). Please contact support.'
      );
    }

    if (isApiUsingProductionFallback()) {
      return (
        'Unable to connect to the signup server. Please check your internet connection and try again. ' +
        'If the problem continues, contact support.'
      );
    }

    return 'Unable to connect to the signup server. Please check your internet connection and try again.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Signup failed. Please try again.';
}

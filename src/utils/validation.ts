import { isSignupCaptchaRequired } from '../config/signup';

export interface SignupFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  captchaToken: string;
}

export function getSignupValidationErrors(
  fields: SignupFields,
  options: { requireCaptcha?: boolean } = {}
): Partial<Record<keyof SignupFields, string>> {
  const { requireCaptcha = isSignupCaptchaRequired() } = options;
  const errors: Partial<Record<keyof SignupFields, string>> = {};

  if (!fields.name.trim()) {
    errors.name = 'Please enter your full name';
  } else if (fields.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!fields.email.trim()) {
    errors.email = 'Please enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!fields.password) {
    errors.password = 'Please enter a password';
  } else if (fields.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!fields.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (requireCaptcha && !fields.captchaToken) {
    errors.captchaToken = 'Please complete the reCAPTCHA verification';
  }

  return errors;
}

export function isSignupFormValid(fields: SignupFields): boolean {
  return Object.keys(getSignupValidationErrors(fields)).length === 0;
}

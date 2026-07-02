export interface SignupFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  captchaVerified: boolean;
}

export function getSignupValidationErrors(
  fields: SignupFields
): Partial<Record<keyof SignupFields, string>> {
  const errors: Partial<Record<keyof SignupFields, string>> = {};

  if (!fields.name.trim()) {
    errors.name = 'Please enter your full name';
  }

  if (!fields.email.trim()) {
    errors.email = 'Please enter your email address';
  } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
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

  if (!fields.captchaVerified) {
    errors.captchaVerified = 'Please complete the reCAPTCHA verification';
  }

  return errors;
}

export function isSignupFormValid(fields: SignupFields): boolean {
  return Object.keys(getSignupValidationErrors(fields)).length === 0;
}

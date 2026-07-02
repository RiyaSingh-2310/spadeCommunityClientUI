export function getRecaptchaSiteKey(): string {
  return import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

export function isRecaptchaConfigured(): boolean {
  return getRecaptchaSiteKey().length > 0;
}

export function getRecaptchaConfigError(): string | null {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) {
    return 'reCAPTCHA is not configured. Please contact support.';
  }
  if (siteKey.length < 20) {
    return 'Invalid reCAPTCHA site key. Please contact support.';
  }
  return null;
}

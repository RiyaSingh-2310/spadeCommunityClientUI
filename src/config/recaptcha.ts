/** Google reCAPTCHA v2 Checkbox ("I'm not a robot") — not v3, Invisible, or Enterprise. */
export const RECAPTCHA_IMPLEMENTATION_LABEL = "reCAPTCHA v2 Checkbox (\"I'm not a robot\")";

export function getRecaptchaSiteKey(): string {
  return import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

export function isRecaptchaConfigured(): boolean {
  return getRecaptchaSiteKey().length > 0;
}

export function getRecaptchaConfigError(): string | null {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) {
    return 'reCAPTCHA is not configured. Set VITE_RECAPTCHA_SITE_KEY in .env and restart the dev server.';
  }
  if (siteKey.length < 20) {
    return 'Invalid reCAPTCHA site key. Please contact support.';
  }
  return null;
}

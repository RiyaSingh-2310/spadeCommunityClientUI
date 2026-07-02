export function getRecaptchaSiteKey(): string {
  return import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? '';
}

export function isRecaptchaConfigured(): boolean {
  return getRecaptchaSiteKey().length > 0;
}

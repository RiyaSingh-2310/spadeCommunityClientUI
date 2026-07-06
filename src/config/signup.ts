/**
 * Sign-up reCAPTCHA configuration
 *
 * Requires reCAPTCHA v2 Checkbox site key in VITE_RECAPTCHA_SITE_KEY.
 * Secret key: backend only — never in this app.
 */
export const REQUIRE_SIGNUP_CAPTCHA = true;

export function isSignupCaptchaRequired(): boolean {
  return REQUIRE_SIGNUP_CAPTCHA;
}

/** Token from v2 Checkbox verification (used for client-side validation). */
export function getSignupCaptchaToken(completedToken: string): string {
  return completedToken.trim();
}

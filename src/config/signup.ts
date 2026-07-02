/**
 * Sign-up reCAPTCHA configuration
 *
 * Site key: set `VITE_RECAPTCHA_SITE_KEY` in `.env` (public, used by the widget).
 * Secret key: configure on the backend only — never expose it in this app.
 *
 * Set `REQUIRE_SIGNUP_CAPTCHA` to `true` when ready to block sign-up until
 * the user completes reCAPTCHA verification.
 */
export const REQUIRE_SIGNUP_CAPTCHA = false;

export function isSignupCaptchaRequired(): boolean {
  return REQUIRE_SIGNUP_CAPTCHA;
}

/** Token sent to the sign-up API. Uses a real token when the user completes the widget. */
export function getSignupCaptchaToken(completedToken: string): string {
  if (completedToken.trim()) return completedToken;
  if (!REQUIRE_SIGNUP_CAPTCHA) return 'temp-bypass';
  return '';
}

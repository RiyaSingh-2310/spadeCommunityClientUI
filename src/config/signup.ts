/**
 * Sign-up reCAPTCHA configuration
 *
 * Requires reCAPTCHA v2 Checkbox site key in VITE_RECAPTCHA_SITE_KEY.
 * Secret key: backend only — never in this app.
 */

// TEMPORARY: reCAPTCHA validation bypassed for development/testing.
// Re-enable before production release.
export const REQUIRE_SIGNUP_CAPTCHA = false;

/** Token sent to the API when validation is bypassed (backend test bypass). */
export const SIGNUP_CAPTCHA_BYPASS_TOKEN = 'test_bypass';

export function isSignupCaptchaRequired(): boolean {
  return REQUIRE_SIGNUP_CAPTCHA;
}

/** Token sent to the sign-up API after v2 Checkbox verification (or bypass token when disabled). */
export function getSignupCaptchaToken(completedToken: string): string {
  // TEMPORARY: reCAPTCHA validation bypassed for development/testing.
  // Re-enable before production release.
  if (!REQUIRE_SIGNUP_CAPTCHA) {
    return SIGNUP_CAPTCHA_BYPASS_TOKEN;
  }
  return completedToken.trim();
}

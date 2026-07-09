import { RECAPTCHA_IMPLEMENTATION_LABEL } from '../config/recaptcha';

export type RecaptchaWidgetIssue =
  | 'healthy'
  | 'invalid-key-type'
  | 'invalid-site-key'
  | 'domain-error'
  | 'owner-error'
  | 'no-widget';

export interface RecaptchaHealthResult {
  status: RecaptchaWidgetIssue;
  message: string;
}

export const INVALID_KEY_TYPE_MESSAGE =
  'This site key is not a reCAPTCHA v2 Checkbox key. In Google reCAPTCHA Admin, create a site with type "Challenge (v2)" and option "I\'m not a robot" Checkbox, then update VITE_RECAPTCHA_SITE_KEY.';

export const INVALID_SITE_KEY_MESSAGE =
  'The reCAPTCHA site key is invalid. Verify VITE_RECAPTCHA_SITE_KEY in .env matches your v2 Checkbox site key.';

export const DOMAIN_ERROR_MESSAGE =
  'This domain is not authorized for your reCAPTCHA site key. Add the exact hostname (e.g. your-app.vercel.app or your custom domain) in Google reCAPTCHA Admin → Domains, then redeploy if you also changed env vars.';

export const NETWORK_ERROR_MESSAGE =
  'Unable to load reCAPTCHA. Check your internet connection, disable ad blockers for this site, and try again.';

export const TIMEOUT_ERROR_MESSAGE =
  'reCAPTCHA is taking longer than expected to load. Please try again.';

export const AD_BLOCKER_HINT =
  'An ad blocker or privacy extension may be blocking reCAPTCHA. Allow scripts from google.com and gstatic.com, then retry.';

export function getUserFriendlyRecaptchaError(rawMessage: string): string {
  const lower = rawMessage.toLowerCase();

  if (lower.includes('invalid key type')) return INVALID_KEY_TYPE_MESSAGE;
  if (lower.includes('invalid site key')) return INVALID_SITE_KEY_MESSAGE;
  if (
    lower.includes('invalid domain') ||
    lower.includes('does not match the list of supported domains') ||
    lower.includes('invalid domain for site key')
  ) {
    return DOMAIN_ERROR_MESSAGE;
  }
  if (lower.includes('error for site owner')) {
    return 'reCAPTCHA reported a configuration error. Confirm you are using a v2 Checkbox site key and this domain is whitelisted.';
  }
  if (lower.includes('already been rendered')) {
    return 'reCAPTCHA encountered a display conflict. Please retry.';
  }
  if (lower.includes('failed to load') || lower.includes('network') || lower.includes('script')) {
    return NETWORK_ERROR_MESSAGE;
  }
  if (lower.includes('not visible') || lower.includes('timeout') || lower.includes('did not render')) {
    return TIMEOUT_ERROR_MESSAGE;
  }
  if (lower.includes('not available') || lower.includes('missing recaptcha')) {
    return NETWORK_ERROR_MESSAGE;
  }

  return rawMessage || TIMEOUT_ERROR_MESSAGE;
}

function readContainerText(container: HTMLElement): string {
  return (container.innerText || container.textContent || '').toLowerCase();
}

function classifyWidgetText(text: string): RecaptchaHealthResult | null {
  if (text.includes('invalid key type')) {
    return { status: 'invalid-key-type', message: INVALID_KEY_TYPE_MESSAGE };
  }
  if (text.includes('invalid site key')) {
    return { status: 'invalid-site-key', message: INVALID_SITE_KEY_MESSAGE };
  }
  if (text.includes('invalid domain') || text.includes('does not match the list of supported domains') || text.includes('invalid domain for site key')) {
    return { status: 'domain-error', message: DOMAIN_ERROR_MESSAGE };
  }
  if (text.includes('error for site owner')) {
    return {
      status: 'owner-error',
      message:
        'reCAPTCHA reported a configuration error. Confirm you are using a v2 Checkbox site key and this domain is whitelisted.',
    };
  }
  return null;
}

export function inspectRecaptchaWidgetHealth(
  container: HTMLElement,
  maxWaitMs = 3500
): Promise<RecaptchaHealthResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const check = () => {
      const text = readContainerText(container);
      const classified = classifyWidgetText(text);
      if (classified) {
        resolve(classified);
        return;
      }

      const iframe = container.querySelector('iframe[src*="recaptcha"]');
      const checkboxAnchor = container.querySelector('.rc-anchor, .g-recaptcha');

      if ((iframe || checkboxAnchor) && !text.includes('error')) {
        resolve({
          status: 'healthy',
          message: `Widget rendered successfully (${RECAPTCHA_IMPLEMENTATION_LABEL})`,
        });
        return;
      }

      if (Date.now() - startedAt >= maxWaitMs) {
        const fallbackText = classifyWidgetText(text);
        if (fallbackText) {
          resolve(fallbackText);
          return;
        }

        resolve(
          iframe
            ? { status: 'healthy', message: 'Widget iframe detected' }
            : {
                status: 'no-widget',
                message: 'reCAPTCHA widget did not render. Check site key type and domain whitelist.',
              }
        );
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

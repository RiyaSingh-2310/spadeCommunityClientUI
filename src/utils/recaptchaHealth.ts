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
  'This domain is not authorized for your reCAPTCHA site key. Add the current hostname in Google reCAPTCHA Admin → Domains.';

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
  if (text.includes('invalid domain') || text.includes('does not match the list of supported domains')) {
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

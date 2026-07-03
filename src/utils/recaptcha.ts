import { getRecaptchaSiteKey } from '../config/recaptcha';
import { inspectRecaptchaWidgetHealth } from './recaptchaHealth';

let scriptLoadPromise: Promise<void> | null = null;

export interface RecaptchaRenderOptions {
  sitekey?: string;
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, parameters: RecaptchaRenderOptions) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

const RECAPTCHA_SCRIPT_URL =
  'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';

export function getRecaptchaScriptUrl(): string {
  return RECAPTCHA_SCRIPT_URL;
}

export function whenRecaptchaReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.grecaptcha?.ready) {
      reject(new Error('reCAPTCHA is not available'));
      return;
    }

    window.grecaptcha.ready(() => resolve());
  });
}

export function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha?.ready) {
    return whenRecaptchaReady();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="true"]');

    const finish = () => {
      whenRecaptchaReady()
        .then(() => resolve())
        .catch((error) => {
          scriptLoadPromise = null;
          reject(error);
        });
    };

    if (existing) {
      if (window.grecaptcha?.ready) {
        finish();
        return;
      }

      if (existing.getAttribute('data-loaded') === 'true') {
        finish();
        return;
      }

      existing.addEventListener(
        'load',
        () => {
          existing.setAttribute('data-loaded', 'true');
          finish();
        },
        { once: true }
      );
      existing.addEventListener(
        'error',
        () => {
          scriptLoadPromise = null;
          reject(new Error('Failed to load reCAPTCHA script'));
        },
        { once: true }
      );
      return;
    }

    window.onRecaptchaLoad = () => {
      window.onRecaptchaLoad = undefined;
      finish();
    };

    const script = document.createElement('script');
    script.src = RECAPTCHA_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.onload = () => script.setAttribute('data-loaded', 'true');
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function preloadRecaptchaScript(): void {
  if (!getRecaptchaSiteKey()) return;
  void loadRecaptchaScript().catch(() => undefined);
}

export function resetRecaptcha(widgetId: number | null) {
  if (widgetId !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId);
  }
}

export function clearRecaptchaContainer(container: HTMLElement | null) {
  if (container) {
    container.innerHTML = '';
  }
}

export function waitForVisibleContainer(
  container: HTMLElement,
  timeoutMs = 8000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      const rect = container.getBoundingClientRect();
      const style = window.getComputedStyle(container);
      const hidden =
        rect.width <= 0 ||
        rect.height <= 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden';

      if (!hidden) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('reCAPTCHA container is not visible'));
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

export async function mountRecaptchaWidget(
  container: HTMLElement,
  options: RecaptchaRenderOptions = {}
): Promise<number> {
  const sitekey = options.sitekey ?? getRecaptchaSiteKey();

  if (!sitekey) {
    throw new Error('Missing reCAPTCHA site key');
  }

  await loadRecaptchaScript();

  if (!window.grecaptcha?.render) {
    throw new Error('grecaptcha.render is not available');
  }

  await waitForVisibleContainer(container);

  clearRecaptchaContainer(container);

  const widgetId = window.grecaptcha.render(container, {
    sitekey,
    callback: (token: string) => options.callback?.(token),
    'expired-callback': () => options['expired-callback']?.(),
    'error-callback': () => options['error-callback']?.(),
  });

  const health = await inspectRecaptchaWidgetHealth(container);
  if (health.status !== 'healthy') {
    throw new Error(health.message);
  }

  return widgetId;
}

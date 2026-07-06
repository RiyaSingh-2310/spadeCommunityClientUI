import { getRecaptchaSiteKey } from '../config/recaptcha';
import { inspectRecaptchaWidgetHealth } from './recaptchaHealth';
import { logRecaptchaDiag } from './recaptchaDiagnostics';

let scriptLoadPromise: Promise<void> | null = null;

const widgetRegistry = new WeakMap<HTMLElement, number>();
const pendingMounts = new WeakMap<HTMLElement, Promise<number>>();

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

function hasWidgetDom(container: HTMLElement): boolean {
  return Boolean(container.querySelector('iframe[src*="recaptcha"], .g-recaptcha'));
}

export function getWidgetIdForContainer(container: HTMLElement): number | null {
  const registered = widgetRegistry.get(container);
  if (registered !== undefined) return registered;

  const stored = container.dataset.recaptchaWidgetId;
  if (stored) {
    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      widgetRegistry.set(container, parsed);
      return parsed;
    }
  }

  return null;
}

function registerWidget(container: HTMLElement, widgetId: number) {
  widgetRegistry.set(container, widgetId);
  container.dataset.recaptchaWidgetId = String(widgetId);
}

export function unregisterRecaptchaWidget(container: HTMLElement) {
  widgetRegistry.delete(container);
  delete container.dataset.recaptchaWidgetId;
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
        .then(() => {
          logRecaptchaDiag('Script loaded', {
            scriptUrl: RECAPTCHA_SCRIPT_URL,
            grecaptchaAvailable: Boolean(window.grecaptcha?.render),
          });
          resolve();
        })
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

function buildRenderOptions(options: RecaptchaRenderOptions): RecaptchaRenderOptions {
  const sitekey = options.sitekey ?? getRecaptchaSiteKey();

  return {
    sitekey,
    callback: (token: string) => {
      logRecaptchaDiag('Token received', { tokenLength: token.length });
      options.callback?.(token);
    },
    'expired-callback': () => {
      logRecaptchaDiag('Token expired');
      options['expired-callback']?.();
    },
    'error-callback': () => options['error-callback']?.(),
  };
}

async function renderNewWidget(
  container: HTMLElement,
  options: RecaptchaRenderOptions
): Promise<number> {
  if (!window.grecaptcha?.render) {
    throw new Error('grecaptcha.render is not available');
  }

  if (hasWidgetDom(container)) {
    const existingId = getWidgetIdForContainer(container);
    if (existingId !== null) {
      resetRecaptcha(existingId);
      return existingId;
    }
    throw new Error('reCAPTCHA has already been rendered in this element');
  }

  const widgetId = window.grecaptcha.render(container, buildRenderOptions(options));
  registerWidget(container, widgetId);

  const health = await inspectRecaptchaWidgetHealth(container);
  if (health.status !== 'healthy') {
    throw new Error(health.message);
  }

  logRecaptchaDiag('Widget rendered', {
    widgetId,
    healthStatus: health.status,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'n/a',
  });

  return widgetId;
}

/**
 * Mount or reuse a reCAPTCHA widget for a container.
 * grecaptcha.render() is called at most once per container element.
 */
export async function mountRecaptchaWidget(
  container: HTMLElement,
  options: RecaptchaRenderOptions = {}
): Promise<number> {
  const sitekey = options.sitekey ?? getRecaptchaSiteKey();

  if (!sitekey) {
    throw new Error('Missing reCAPTCHA site key');
  }

  const existingId = getWidgetIdForContainer(container);
  if (existingId !== null && hasWidgetDom(container)) {
    resetRecaptcha(existingId);
    logRecaptchaDiag('Widget rendered', {
      widgetId: existingId,
      reused: true,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'n/a',
    });
    return existingId;
  }

  const pending = pendingMounts.get(container);
  if (pending) {
    return pending;
  }

  const mountPromise = (async () => {
    await loadRecaptchaScript();
    await waitForVisibleContainer(container);

    const resolvedId = getWidgetIdForContainer(container);
    if (resolvedId !== null && hasWidgetDom(container)) {
      resetRecaptcha(resolvedId);
      return resolvedId;
    }

    return renderNewWidget(container, options);
  })();

  pendingMounts.set(container, mountPromise);

  try {
    return await mountPromise;
  } finally {
    pendingMounts.delete(container);
  }
}

/** Soft reset for modal close / hide — keeps widget mounted for reuse. */
export function softResetRecaptchaWidget(widgetId: number | null) {
  resetRecaptcha(widgetId);
}

/** Hard reset after failed submit — clears registry so a fresh container can render. */
export function hardResetRecaptchaWidget(container: HTMLElement | null, widgetId: number | null) {
  resetRecaptcha(widgetId);
  if (container) {
    unregisterRecaptchaWidget(container);
  }
}

let scriptLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
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
      whenRecaptchaReady().then(resolve).catch(reject);
    };

    if (existing) {
      if (window.grecaptcha?.ready) {
        finish();
        return;
      }

      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA')), {
        once: true,
      });
      return;
    }

    window.onRecaptchaLoad = () => {
      window.onRecaptchaLoad = undefined;
      finish();
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function preloadRecaptchaScript(): void {
  if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim()) return;
  void loadRecaptchaScript().catch(() => {
    // Preload is best-effort; the widget handles user-facing errors.
  });
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

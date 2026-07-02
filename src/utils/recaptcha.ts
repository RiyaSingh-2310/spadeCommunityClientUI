let scriptLoadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    grecaptcha?: {
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

export function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA')), {
        once: true,
      });
      return;
    }

    window.onRecaptchaLoad = () => {
      resolve();
      window.onRecaptchaLoad = undefined;
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function resetRecaptcha(widgetId: number | null) {
  if (widgetId !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId);
  }
}

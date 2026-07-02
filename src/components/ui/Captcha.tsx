import { useEffect, useId, useRef, useState } from 'react';
import {
  getRecaptchaConfigError,
  getRecaptchaSiteKey,
  isRecaptchaConfigured,
} from '../../config/recaptcha';
import {
  clearRecaptchaContainer,
  loadRecaptchaScript,
  resetRecaptcha,
} from '../../utils/recaptcha';
import './Captcha.css';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError?: () => void;
  variant?: 'default' | 'modal';
  error?: string;
  disabled?: boolean;
  resetKey?: number;
  /** When false, the widget is not rendered (e.g. modal closed). */
  active?: boolean;
}

function waitForVisibleContainer(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

export default function Captcha({
  onVerify,
  onExpire,
  onError,
  variant = 'default',
  error,
  disabled = false,
  resetKey = 0,
  active = true,
}: CaptchaProps) {
  const configError = getRecaptchaConfigError();
  const useGoogleRecaptcha = isRecaptchaConfigured() && !configError;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const checkboxId = useId();
  const [mockChecked, setMockChecked] = useState(false);
  const [mockVerifying, setMockVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!useGoogleRecaptcha || !active) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const container = containerRef.current;

    const mountRecaptcha = async () => {
      if (!container) return;

      setIsLoading(true);
      setLoadError('');

      try {
        await loadRecaptchaScript();
        if (cancelled || !containerRef.current || !window.grecaptcha) return;

        await waitForVisibleContainer(containerRef.current);

        if (cancelled || !containerRef.current) return;

        if (widgetIdRef.current !== null) {
          resetRecaptcha(widgetIdRef.current);
          setIsLoading(false);
          return;
        }

        clearRecaptchaContainer(containerRef.current);

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: getRecaptchaSiteKey(),
          callback: (token: string) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current(),
          'error-callback': () => {
            setLoadError('reCAPTCHA verification failed. Please try again.');
            onErrorRef.current?.();
          },
        });
      } catch {
        if (!cancelled) {
          setLoadError('Unable to load reCAPTCHA. Check your connection and try again.');
          onErrorRef.current?.();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void mountRecaptcha();

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null) {
        resetRecaptcha(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      clearRecaptchaContainer(container);
    };
  }, [useGoogleRecaptcha, active, resetKey]);

  useEffect(() => {
    if (useGoogleRecaptcha || resetKey === 0) return;
    setMockChecked(false);
    setMockVerifying(false);
  }, [resetKey, useGoogleRecaptcha]);

  const handleMockChange = (checked: boolean) => {
    if (disabled) return;

    setMockChecked(checked);

    if (!checked) {
      setMockVerifying(false);
      onExpire();
      return;
    }

    setMockVerifying(true);
    window.setTimeout(() => {
      setMockVerifying(false);
      onVerify('mock-captcha-token');
    }, 600);
  };

  if (configError) {
    return (
      <div className={`captcha captcha--error-state ${variant === 'modal' ? 'captcha--modal' : ''}`}>
        <p className="captcha__error" role="alert">
          {configError}
        </p>
      </div>
    );
  }

  if (useGoogleRecaptcha) {
    return (
      <div
        className={`captcha captcha--recaptcha ${variant === 'modal' ? 'captcha--modal' : ''} ${
          error || loadError ? 'captcha--error' : ''
        } ${disabled ? 'captcha--disabled' : ''}`}
      >
        <div className="captcha__widget-shell" aria-live="polite">
          {isLoading && active && (
            <div className="captcha__widget-placeholder" aria-hidden="true" />
          )}
          <div
            ref={containerRef}
            className={`captcha__widget ${active ? '' : 'captcha__widget--hidden'}`}
            aria-hidden={!active}
          />
        </div>
        {loadError && (
          <p className="captcha__error" role="alert">
            {loadError}
          </p>
        )}
        {error && !loadError && (
          <p className="captcha__error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (!active) return null;

  return (
    <div
      className={`captcha captcha--mock ${variant === 'modal' ? 'captcha--modal' : ''} ${
        error ? 'captcha--error' : ''
      } ${disabled ? 'captcha--disabled' : ''}`}
    >
      <div className="captcha__mock-box">
        <label className="captcha__mock-label" htmlFor={checkboxId}>
          <input
            id={checkboxId}
            type="checkbox"
            checked={mockChecked}
            onChange={(e) => handleMockChange(e.target.checked)}
            disabled={disabled || mockVerifying}
            aria-describedby={error ? `${checkboxId}-error` : undefined}
          />
          <span className="captcha__mock-checkbox" aria-hidden="true" />
          <span className="captcha__mock-text">I&apos;m not a robot</span>
        </label>
        <span className="captcha__mock-badge" aria-hidden="true">
          reCAPTCHA
        </span>
      </div>
      {mockVerifying && <p className="captcha__hint">Verifying...</p>}
      {error && (
        <p className="captcha__error" id={`${checkboxId}-error`} role="alert">
          {error}
        </p>
      )}
      {import.meta.env.DEV && (
        <p className="captcha__dev-note">Development mode: mock CAPTCHA active</p>
      )}
    </div>
  );
}

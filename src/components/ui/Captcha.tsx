import { useEffect, useId, useRef, useState } from 'react';
import { getRecaptchaSiteKey, isRecaptchaConfigured } from '../../config/recaptcha';
import { loadRecaptchaScript } from '../../utils/recaptcha';
import './Captcha.css';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError?: () => void;
  variant?: 'default' | 'modal';
  error?: string;
  disabled?: boolean;
  resetKey?: number;
}

export default function Captcha({
  onVerify,
  onExpire,
  onError,
  variant = 'default',
  error,
  disabled = false,
  resetKey = 0,
}: CaptchaProps) {
  const useGoogleRecaptcha = isRecaptchaConfigured();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const mountedRef = useRef(false);
  const checkboxId = useId();
  const [mockChecked, setMockChecked] = useState(false);
  const [mockVerifying, setMockVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(useGoogleRecaptcha);
  const [loadError, setLoadError] = useState('');

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!useGoogleRecaptcha) return;

    let cancelled = false;

    const mountRecaptcha = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        await loadRecaptchaScript();
        if (cancelled || !containerRef.current || !window.grecaptcha) return;

        if (widgetIdRef.current !== null && mountedRef.current) {
          window.grecaptcha.reset(widgetIdRef.current);
          return;
        }

        if (containerRef.current.childElementCount > 0) {
          containerRef.current.innerHTML = '';
        }

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: getRecaptchaSiteKey(),
          callback: (token: string) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current(),
          'error-callback': () => onErrorRef.current?.(),
        });
        mountedRef.current = true;
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
    };
  }, [useGoogleRecaptcha, resetKey]);

  useEffect(() => {
    if (!useGoogleRecaptcha || resetKey === 0) return;
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

  if (useGoogleRecaptcha) {
    return (
      <div
        className={`captcha captcha--recaptcha ${variant === 'modal' ? 'captcha--modal' : ''} ${
          error ? 'captcha--error' : ''
        } ${disabled ? 'captcha--disabled' : ''}`}
      >
        <div className="captcha__widget-shell" aria-live="polite">
          {isLoading && <div className="captcha__widget-placeholder" aria-hidden="true" />}
          <div ref={containerRef} className="captcha__widget" />
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
      {!useGoogleRecaptcha && import.meta.env.DEV && (
        <p className="captcha__dev-note">Development mode: mock CAPTCHA active</p>
      )}
    </div>
  );
}

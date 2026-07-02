import { useEffect, useId, useRef, useState } from 'react';
import { getRecaptchaSiteKey, isRecaptchaConfigured } from '../../config/recaptcha';
import { loadRecaptchaScript } from '../../utils/recaptcha';
import './Captcha.css';

interface CaptchaProps {
  verified: boolean;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError?: () => void;
  variant?: 'default' | 'modal';
  error?: string;
  disabled?: boolean;
  resetKey?: number;
}

export default function Captcha({
  verified,
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
  const checkboxId = useId();
  const [mockChecked, setMockChecked] = useState(false);
  const [mockVerifying, setMockVerifying] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!useGoogleRecaptcha) return;

    let cancelled = false;

    const mountRecaptcha = async () => {
      try {
        await loadRecaptchaScript();
        if (cancelled || !containerRef.current || !window.grecaptcha) return;

        if (containerRef.current.childElementCount > 0) {
          containerRef.current.innerHTML = '';
        }

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: getRecaptchaSiteKey(),
          callback: (token: string) => onVerify(token),
          'expired-callback': onExpire,
          'error-callback': () => {
            onError?.();
            onExpire();
          },
        });
        setLoadError('');
      } catch {
        if (!cancelled) {
          setLoadError('Unable to load reCAPTCHA. Please refresh and try again.');
          onError?.();
        }
      }
    };

    mountRecaptcha();

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
    };
  }, [useGoogleRecaptcha, resetKey, onVerify, onExpire, onError]);

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
        <div ref={containerRef} className="captcha__widget" aria-live="polite" />
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
        {verified && !error && !loadError && (
          <p className="captcha__success">Verification complete</p>
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

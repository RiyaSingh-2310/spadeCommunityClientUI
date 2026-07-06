import { useEffect, useId, useRef, useState } from 'react';
import { getRecaptchaConfigError, isRecaptchaConfigured } from '../../config/recaptcha';
import { isSignupCaptchaRequired } from '../../config/signup';
import {
  clearRecaptchaContainer,
  mountRecaptchaWidget,
  resetRecaptcha,
} from '../../utils/recaptcha';
import './Captcha.css';

/** Intrinsic size of the Google reCAPTCHA v2 Checkbox widget. */
const RECAPTCHA_WIDGET_WIDTH = 304;
const RECAPTCHA_WIDGET_HEIGHT = 78;
/** Slight downscale so the widget matches input field proportions (never scale above this). */
const RECAPTCHA_COMPACT_SCALE = 0.92;

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError?: () => void;
  variant?: 'default' | 'modal';
  error?: string;
  disabled?: boolean;
  resetKey?: number;
  /** When false, skip mounting (e.g. modal closed). */
  active?: boolean;
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
  const captchaValidationRequired = isSignupCaptchaRequired();
  const useGoogleRecaptcha = captchaValidationRequired && isRecaptchaConfigured() && !configError;
  const shellRef = useRef<HTMLDivElement>(null);
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
    if (!useGoogleRecaptcha || !active) return;

    const shell = shellRef.current;
    const widget = containerRef.current;
    if (!shell || !widget) return;

    const applyScale = () => {
      const width = shell.clientWidth;
      if (width <= 0) return;

      const fitScale = width / RECAPTCHA_WIDGET_WIDTH;
      const scale = Math.min(fitScale, RECAPTCHA_COMPACT_SCALE);
      const scaledWidth = RECAPTCHA_WIDGET_WIDTH * scale;
      const scaledHeight = RECAPTCHA_WIDGET_HEIGHT * scale;
      const offsetX = Math.max(0, (width - scaledWidth) / 2);

      widget.style.width = `${RECAPTCHA_WIDGET_WIDTH}px`;
      widget.style.height = `${RECAPTCHA_WIDGET_HEIGHT}px`;
      widget.style.transform = `translateX(${offsetX}px) scale(${scale})`;
      widget.style.transformOrigin = '0 0';
      shell.style.height = `${scaledHeight}px`;
    };

    applyScale();

    const resizeObserver = new ResizeObserver(applyScale);
    resizeObserver.observe(shell);

    const mutationObserver = new MutationObserver(applyScale);
    mutationObserver.observe(widget, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      shell.style.height = '';
      widget.style.transform = '';
      widget.style.width = '';
      widget.style.height = '';
    };
  }, [useGoogleRecaptcha, active, resetKey, isLoading]);

  useEffect(() => {
    if (!useGoogleRecaptcha || !active) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const container = containerRef.current;

    const mountWidget = async () => {
      if (!container) return;

      setIsLoading(true);
      setLoadError('');

      try {
        if (widgetIdRef.current !== null) {
          resetRecaptcha(widgetIdRef.current);
          widgetIdRef.current = null;
          clearRecaptchaContainer(container);
        }

        const widgetId = await mountRecaptchaWidget(container, {
          callback: (token) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current(),
          'error-callback': () => onErrorRef.current?.(),
        });

        if (!cancelled) {
          widgetIdRef.current = widgetId;
        }
      } catch (mountError) {
        if (!cancelled) {
          const message =
            mountError instanceof Error
              ? mountError.message
              : 'Unable to load reCAPTCHA.';
          console.error('[reCAPTCHA] Widget initialization failed', {
            message,
            hostname: window.location.hostname,
            origin: window.location.origin,
            diagnostics: window.__RECAPTCHA_DIAGNOSTICS__,
          });
          setLoadError(message);
          onErrorRef.current?.();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void mountWidget();

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

  // TEMPORARY: reCAPTCHA validation bypassed for development/testing.
  // Re-enable before production release.
  if (!captchaValidationRequired) {
    return (
      <div
        className={`captcha captcha--bypass ${variant === 'modal' ? 'captcha--modal' : ''}`}
        aria-live="polite"
      >
        <div className="captcha__bypass-placeholder">
          reCAPTCHA temporarily disabled in development mode.
        </div>
      </div>
    );
  }

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
        <div ref={shellRef} className="captcha__widget-shell" aria-live="polite">
          {isLoading && active && (
            <div className="captcha__widget-placeholder" aria-hidden="true" />
          )}
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
        <p className="captcha__dev-note">Development mode: mock CAPTCHA active (no site key)</p>
      )}
    </div>
  );
}

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getRecaptchaConfigError, isRecaptchaConfigured } from '../../config/recaptcha';
import {
  hardResetRecaptchaWidget,
  mountRecaptchaWidget,
} from '../../utils/recaptcha';
import {
  AD_BLOCKER_HINT,
  getUserFriendlyRecaptchaError,
} from '../../utils/recaptchaHealth';
import './Captcha.css';

/** Intrinsic size of the Google reCAPTCHA v2 Checkbox widget. */
const RECAPTCHA_WIDGET_WIDTH = 304;
const RECAPTCHA_WIDGET_HEIGHT = 78;
/** Slight downscale so the widget matches input field proportions (never scale above this). */
const RECAPTCHA_COMPACT_SCALE = 0.92;
const LOAD_TIMEOUT_MS = 15000;
const MAX_AUTO_RETRIES = 3;
const AUTO_RETRY_DELAY_MS = 2000;

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
  const useGoogleRecaptcha = isRecaptchaConfigured() && !configError;
  const shellRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const mountGenerationRef = useRef(0);
  const autoRetryCountRef = useRef(0);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const checkboxId = useId();
  const [mockChecked, setMockChecked] = useState(false);
  const [mockVerifying, setMockVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [retryNonce, setRetryNonce] = useState(0);

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onErrorRef.current = onError;

  const handleManualRetry = useCallback(() => {
    autoRetryCountRef.current = 0;
    setLoadError('');
    setRetryNonce((value) => value + 1);
  }, []);

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
  }, [useGoogleRecaptcha, active, resetKey, retryNonce, isLoading]);

  useEffect(() => {
    if (!useGoogleRecaptcha || !active) {
      setIsLoading(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const generation = ++mountGenerationRef.current;
    let cancelled = false;
    let timeoutId = 0;
    let retryTimeoutId = 0;

    const scheduleAutoRetry = (message: string) => {
      if (cancelled || generation !== mountGenerationRef.current) return;

      if (autoRetryCountRef.current < MAX_AUTO_RETRIES) {
        autoRetryCountRef.current += 1;
        setLoadError(`Loading reCAPTCHA… (attempt ${autoRetryCountRef.current + 1} of ${MAX_AUTO_RETRIES + 1})`);
        retryTimeoutId = window.setTimeout(() => {
          if (!cancelled && generation === mountGenerationRef.current) {
            setRetryNonce((value) => value + 1);
          }
        }, AUTO_RETRY_DELAY_MS * autoRetryCountRef.current);
        return;
      }

      const friendlyMessage = getUserFriendlyRecaptchaError(message);
      setLoadError(friendlyMessage);
      setIsLoading(false);
      onErrorRef.current?.();
    };

    const mountWidget = async () => {
      setIsLoading(true);
      setLoadError('');

      timeoutId = window.setTimeout(() => {
        if (!cancelled && generation === mountGenerationRef.current) {
          scheduleAutoRetry('reCAPTCHA widget did not render in time');
        }
      }, LOAD_TIMEOUT_MS);

      try {
        const widgetId = await mountRecaptchaWidget(container, {
          callback: (token) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current(),
          'error-callback': () => onErrorRef.current?.(),
        });

        if (cancelled || generation !== mountGenerationRef.current) return;

        widgetIdRef.current = widgetId;
        autoRetryCountRef.current = 0;
        setLoadError('');
      } catch (mountError) {
        if (cancelled || generation !== mountGenerationRef.current) return;

        const message =
          mountError instanceof Error ? mountError.message : 'Unable to load reCAPTCHA.';
        console.error('[reCAPTCHA] Widget initialization failed', {
          message,
          hostname: window.location.hostname,
          origin: window.location.origin,
          diagnostics: window.__RECAPTCHA_DIAGNOSTICS__,
        });
        hardResetRecaptchaWidget(container, widgetIdRef.current);
        widgetIdRef.current = null;
        scheduleAutoRetry(message);
        return;
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled && generation === mountGenerationRef.current) {
          setIsLoading(false);
        }
      }
    };

    void mountWidget();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearTimeout(retryTimeoutId);
      hardResetRecaptchaWidget(container, widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, [useGoogleRecaptcha, active, resetKey, retryNonce]);

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
    const showAdBlockerHint =
      loadError &&
      (loadError.includes('connection') ||
        loadError.includes('load') ||
        loadError.includes('longer than expected'));

    return (
      <div
        className={`captcha captcha--recaptcha ${variant === 'modal' ? 'captcha--modal' : ''} ${
          error || loadError ? 'captcha--error' : ''
        } ${disabled ? 'captcha--disabled' : ''}`}
      >
        <div ref={shellRef} className="captcha__widget-shell" aria-live="polite">
          {isLoading && active && !loadError && (
            <div className="captcha__widget-placeholder" aria-hidden="true" />
          )}
          <div
            key={`${resetKey}-${retryNonce}`}
            ref={containerRef}
            className="captcha__widget"
          />
        </div>
        {loadError && (
          <div className="captcha__fallback" role="alert">
            <p className="captcha__error">{loadError}</p>
            {showAdBlockerHint && <p className="captcha__hint">{AD_BLOCKER_HINT}</p>}
            {!isLoading && (
              <button
                type="button"
                className="captcha__retry-btn"
                onClick={handleManualRetry}
                disabled={disabled}
              >
                Retry reCAPTCHA
              </button>
            )}
          </div>
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

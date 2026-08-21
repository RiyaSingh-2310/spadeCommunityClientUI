import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import Captcha from './Captcha';
import { signup } from '../../api/auth';
import { useAuthModal } from '../../context/AuthModalContext';
import { getSignupCaptchaToken, isSignupCaptchaRequired } from '../../config/signup';
import { classifyAuthError, type AuthErrorInfo } from '../../utils/authErrors';
import { getSignupValidationErrors, isSignupFormValid } from '../../utils/validation';
import { getMemberComplete } from '../../utils/memberSession';
import { getSignupSuccess, saveSignupSuccess } from '../../utils/signupSession';

interface JoinFormProps {
  onSubmit?: (data: JoinFormData) => void;
  className?: string;
  variant?: 'hero' | 'modal';
  onSwitchToLogin?: () => void;
  onSignupSuccess?: () => void;
  onSignupModalClose?: () => void;
  /** Controls when the reCAPTCHA widget is active (modal visibility). */
  captchaActive?: boolean;
}

export interface JoinFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  captchaToken: string;
}

export default function JoinForm({
  onSubmit,
  className = '',
  variant = 'hero',
  onSwitchToLogin,
  onSignupSuccess,
  onSignupModalClose,
  captchaActive = true,
}: JoinFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitErrorInfo, setSubmitErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const location = useLocation();
  const isModal = variant === 'modal';
  const inputVariant = 'default';
  const captchaRequired = isSignupCaptchaRequired();
  const { activeModal, openLogin } = useAuthModal();
  const shouldMountCaptcha = isModal
    ? captchaActive
    : captchaActive && activeModal !== 'signup';

  const handleTryLogin = useCallback(() => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
      return;
    }
    openLogin();
  }, [onSwitchToLogin, openLogin]);

  const resetFormState = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
    setErrors({});
    setSubmitted(false);
    setSubmitError('');
    setShowValidation(false);
    setIsSubmitting(false);
    setSubmitErrorInfo(null);
  }, []);

  useEffect(() => {
    // Create Account modal must always open on a fresh registration form.
    if (isModal) {
      if (activeModal === 'signup') {
        resetFormState();
      }
      return;
    }

    if (getMemberComplete()) {
      setSubmitted(false);
      return;
    }

    const saved = getSignupSuccess();
    setSubmitted(Boolean(saved));
  }, [isModal, location.pathname, resetFormState, activeModal]);

  useEffect(() => {
    if (!captchaActive) {
      setCaptchaToken('');
    }
  }, [captchaActive]);

  const validationFields = useMemo(
    () => ({
      ...formData,
      captchaToken,
    }),
    [formData, captchaToken]
  );

  const isFormValid = useMemo(() => isSignupFormValid(validationFields), [validationFields]);

  const validate = useCallback(() => {
    const newErrors = getSignupValidationErrors(validationFields);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationFields]);

  const handleCaptchaVerify = useCallback((token: string) => {
    if (!token) return;
    setCaptchaToken(token);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.captchaToken;
      return next;
    });
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken('');
    if (!captchaRequired) return;
    setErrors((prev) => ({
      ...prev,
      captchaToken: 'reCAPTCHA has expired. Please verify again.',
    }));
  }, [captchaRequired]);

  const handleCaptchaError = useCallback(() => {
    setCaptchaToken('');
    if (!captchaRequired) return;
    setErrors((prev) => ({
      ...prev,
      captchaToken: 'reCAPTCHA verification failed. Please try again.',
    }));
  }, [captchaRequired]);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.captchaToken;
      return next;
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitErrorInfo(null);
    setShowValidation(true);

    if (!validate()) return;

    if (captchaRequired && !getSignupCaptchaToken(captchaToken)) {
      setErrors((prev) => ({
        ...prev,
        captchaToken: 'Please complete the reCAPTCHA verification.',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedEmail = formData.email.trim();
      const response = await signup({
        name: formData.name.trim(),
        email: trimmedEmail,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      onSubmit?.({
        ...formData,
        captchaToken,
      });

      const message =
        response.message ||
        'Signup successful! A survey link has been sent to your email. Please check your email to continue.';

      saveSignupSuccess({
        message,
        email: trimmedEmail,
        completedAt: new Date().toISOString(),
        questionnaireUrl: response.data?.questionnaire_url,
      });

      onSignupSuccess?.();
      window.dispatchEvent(new CustomEvent('onboarding-updated'));

      // Create Account modal: always close to a clean state — never show success/verify UI.
      if (isModal) {
        resetFormState();
        onSignupModalClose?.();
        return;
      }

      setSubmitted(true);
    } catch (error) {
      const info = classifyAuthError(error, 'signup');
      setSubmitErrorInfo(info);
      setSubmitError(info.message);
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (showValidation) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submitError) {
      setSubmitError('');
      setSubmitErrorInfo(null);
    }
  };

  const displayErrors = useMemo(() => {
    if (showValidation) return errors;
    return captchaRequired && errors.captchaToken ? { captchaToken: errors.captchaToken } : {};
  }, [showValidation, errors, captchaRequired]);

  // Hero form yields to the Verify Email card after successful registration.
  if (submitted && !isModal) {
    return null;
  }

  return (
    <form
      className={`join-form ${isModal ? 'join-form--modal' : ''} ${className}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {!isModal && (
        <div className="join-form__header">
          <h2 className="join-form__title">Join For Free</h2>
          <span className="join-form__bonus">Bonus $2</span>
        </div>
      )}

      {submitError ? (
        <div className="join-form__error" role="alert">
          <p className="join-form__error-text">{submitError}</p>
          {submitErrorInfo?.suggestContactSupport || submitErrorInfo?.suggestLogin ? (
            <div className="join-form__error-actions">
              {submitErrorInfo.suggestLogin ? (
                <button type="button" onClick={handleTryLogin} disabled={isSubmitting}>
                  Try Login
                </button>
              ) : null}
              {submitErrorInfo.suggestContactSupport ? (
                <a href={`mailto:${submitErrorInfo.supportEmail}`}>Contact Support</a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <Input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        icon={<User size={16} />}
        error={displayErrors.name}
        variant={inputVariant}
        disabled={isSubmitting}
        autoComplete="name"
      />

      <Input
        name="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        icon={<Mail size={16} />}
        error={displayErrors.email}
        variant={inputVariant}
        disabled={isSubmitting}
        autoComplete="email"
      />

      <Input
        name="password"
        placeholder="Enter Password"
        value={formData.password}
        onChange={(e) => updateField('password', e.target.value)}
        icon={<Lock size={16} />}
        error={displayErrors.password}
        variant={inputVariant}
        disabled={isSubmitting}
        showPasswordToggle
        autoComplete="new-password"
      />

      <Input
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
        icon={<Lock size={16} />}
        error={displayErrors.confirmPassword}
        variant={inputVariant}
        disabled={isSubmitting}
        showPasswordToggle
        autoComplete="new-password"
      />

      <Captcha
        onVerify={handleCaptchaVerify}
        onExpire={handleCaptchaExpire}
        onError={handleCaptchaError}
        variant={inputVariant}
        error={displayErrors.captchaToken}
        disabled={isSubmitting}
        resetKey={captchaResetKey}
        active={shouldMountCaptcha}
      />

      {isModal ? (
        <>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? 'Joining...' : 'Join Us'}
          </Button>
          <p className="auth-modal__footer-link">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin} disabled={isSubmitting}>
              Please Login
            </button>
          </p>
        </>
      ) : (
        <div className="join-form__footer">
          <div className="join-form__social">
            <button type="button" className="join-form__social-btn join-form__social-btn--facebook" aria-label="Sign up with Facebook" disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
            <button type="button" className="join-form__social-btn join-form__social-btn--twitter" aria-label="Sign up with Twitter" disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button type="button" className="join-form__social-btn join-form__social-btn--google" aria-label="Sign up with Google" disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>
          </div>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? 'Joining...' : 'Join Us'}
          </Button>
        </div>
      )}
    </form>
  );
}

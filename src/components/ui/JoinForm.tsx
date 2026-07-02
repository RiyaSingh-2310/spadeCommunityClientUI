import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import Captcha from './Captcha';
import { signup } from '../../api/auth';
import { ApiError } from '../../api/ApiError';
import { getSignupValidationErrors, isSignupFormValid } from '../../utils/validation';
import { encodeSecureToken } from '../../utils/secureToken';

interface JoinFormProps {
  onSubmit?: (data: JoinFormData) => void;
  className?: string;
  variant?: 'hero' | 'modal';
  onSwitchToLogin?: () => void;
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
}: JoinFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const isModal = variant === 'modal';
  const inputVariant = isModal ? 'modal' : 'default';

  const validationFields = useMemo(
    () => ({
      ...formData,
      captchaVerified,
    }),
    [formData, captchaVerified]
  );

  const isFormValid = useMemo(() => isSignupFormValid(validationFields), [validationFields]);

  const validate = useCallback(() => {
    const newErrors = getSignupValidationErrors(validationFields);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationFields]);

  const handleCaptchaVerify = useCallback((token: string) => {
    if (!token) return;
    setCaptchaVerified(true);
    setCaptchaToken(token);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.captchaVerified;
      return next;
    });
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaVerified(false);
    setCaptchaToken('');
    setErrors((prev) => ({
      ...prev,
      captchaVerified: 'reCAPTCHA has expired. Please verify again.',
    }));
  }, []);

  const handleCaptchaError = useCallback(() => {
    setCaptchaVerified(false);
    setCaptchaToken('');
    setErrors((prev) => ({
      ...prev,
      captchaVerified: 'reCAPTCHA verification failed. Please try again.',
    }));
  }, []);

  const resetCaptcha = useCallback(() => {
    setCaptchaVerified(false);
    setCaptchaToken('');
    setCaptchaResetKey((key) => key + 1);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setShowValidation(true);

    if (!validate()) return;

    if (!captchaToken) {
      setErrors((prev) => ({
        ...prev,
        captchaVerified: 'Please complete the reCAPTCHA verification.',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        captcha_token: captchaToken,
      });

      onSubmit?.({
        ...formData,
        captchaToken,
      });
      setSuccessMessage(
        response.message || 'Signup successful! Please check your email to activate your account.'
      );
      const questionnaireUrl = response.data?.questionnaire_url ?? '';
      if (questionnaireUrl) {
        const parsed = new URL(questionnaireUrl, window.location.origin);
        const rawToken = parsed.searchParams.get('Userid') ?? '';
        const secureToken = encodeSecureToken(rawToken);
        setVerificationLink(secureToken ? `/questionnaire/${secureToken}` : questionnaireUrl);
      } else {
        setVerificationLink('');
      }
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Signup failed. Please try again.';
      setSubmitError(message);
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
    if (submitError) setSubmitError('');
  };

  const displayErrors = useMemo(() => {
    if (showValidation) return errors;
    return errors.captchaVerified ? { captchaVerified: errors.captchaVerified } : {};
  }, [showValidation, errors]);

  if (submitted) {
    return (
      <div className={`join-form join-form--success ${isModal ? 'join-form--modal' : ''} ${className}`}>
        <div className="join-form__success-message">
          <h3>Registration Complete!</h3>
          <p>{successMessage}</p>
          {/* {verificationLink && (
            <a href={verificationLink} className="join-form__resend">
              Fill Questionnaire
            </a>
          )} */}
        </div>
      </div>
    );
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

      {submitError && (
        <div className="join-form__error" role="alert">
          {submitError}
        </div>
      )}

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
        verified={captchaVerified}
        onVerify={handleCaptchaVerify}
        onExpire={handleCaptchaExpire}
        onError={handleCaptchaError}
        variant={inputVariant}
        error={displayErrors.captchaVerified}
        disabled={isSubmitting}
        resetKey={captchaResetKey}
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
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
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
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
      )}
    </form>
  );
}

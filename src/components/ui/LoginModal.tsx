import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/ApiError';
import { requestPasswordReset, resetPasswordWithOtp } from '../../api/auth';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import SocialLoginButtons from './SocialLoginButtons';
import SuccessState from './SuccessState';
import { useAuthModal } from '../../context/AuthModalContext';
import { usePanelistAuth } from '../../context/PanelistAuthContext';
import { classifyAuthError, type AuthErrorInfo } from '../../utils/authErrors';
import { contactInfo } from '../../data/mockData';
import './AuthModal.css';

export default function LoginModal() {
  const navigate = useNavigate();
  const { activeModal, closeModal, switchToSignup } = useAuthModal();
  const { login } = usePanelistAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errorInfo, setErrorInfo] = useState<AuthErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'forgot' | 'forgotOtp' | 'forgotReset' | 'forgotSuccess'>(
    'login'
  );

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSupportEmail, setForgotSupportEmail] = useState<string | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isForgotResetSubmitting, setIsForgotResetSubmitting] = useState(false);

  const isOpen = activeModal === 'login';

  const handleClose = useCallback(() => {
    closeModal();
    setSubmitted(false);
    setIsClosing(false);
    setAuthStep('login');
    setEmail('');
    setPassword('');
    setForgotEmail('');
    setForgotOtp('');
    setForgotError('');
    setForgotSupportEmail(null);
    setIsForgotSubmitting(false);
    setNewPassword('');
    setConfirmPassword('');
    setIsForgotResetSubmitting(false);
    setError('');
    setErrorInfo(null);
  }, [closeModal]);

  const initiateClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(handleClose, 380);
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) return;

    const timer = window.setTimeout(() => {
      setSubmitted(false);
      setIsClosing(false);
      setAuthStep('login');
      setError('');
      setErrorInfo(null);
      setForgotEmail('');
      setForgotOtp('');
      setForgotError('');
      setForgotSupportEmail(null);
      setIsForgotSubmitting(false);
      setNewPassword('');
      setConfirmPassword('');
      setIsForgotResetSubmitting(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const isForgotEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim());
  const isForgotOtpValid = /^[0-9]{4,8}$/.test(forgotOtp.trim());
  const isForgotNewPasswordValid = newPassword.trim().length > 0;
  const isForgotPasswordsMatching = newPassword.trim().length > 0 && newPassword === confirmPassword;
  const isForgotResetFormValid = isForgotNewPasswordValid && isForgotPasswordsMatching;

  const backToLogin = useCallback(() => {
    setAuthStep('login');
    setForgotEmail('');
    setForgotOtp('');
    setForgotError('');
    setForgotSupportEmail(null);
    setIsForgotSubmitting(false);
    setNewPassword('');
    setConfirmPassword('');
    setIsForgotResetSubmitting(false);
  }, []);

  const openForgotPassword = useCallback(() => {
    // Preserve login fields, but reset the login error (it shouldn't carry over to Forgot Password).
    setSubmitted(false);
    setError('');
    setErrorInfo(null);

    setAuthStep('forgot');
    setForgotEmail('');
    setForgotOtp('');
    setForgotError('');
    setForgotSupportEmail(null);
    setIsForgotSubmitting(false);
    setNewPassword('');
    setConfirmPassword('');
    setIsForgotResetSubmitting(false);
  }, []);

  useEffect(() => {
    if (authStep !== 'forgotSuccess') return;
    const timer = window.setTimeout(() => {
      backToLogin();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [authStep, backToLogin]);

  const classifyForgotPasswordError = (errorValue: unknown): { message: string; supportEmail?: string } => {
    if (errorValue instanceof TypeError) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        supportEmail: contactInfo.email,
      };
    }

    if (errorValue instanceof ApiError) {
      const raw = errorValue.message.trim();
      const lower = raw.toLowerCase();

      if (lower.includes('otp') || lower.includes('one-time') || lower.includes('one time') || lower.includes('verification code') || lower.includes('invalid otp')) {
        return { message: 'Invalid or expired OTP. Please enter the code again.', supportEmail: contactInfo.email };
      }

      if (errorValue.status === 404) {
        return { message: 'No account found with that email address.', supportEmail: contactInfo.email };
      }

      if (
        lower.includes('not found') ||
        lower.includes('no account') ||
        lower.includes('does not exist') ||
        lower.includes('unregistered')
      ) {
        return { message: 'No account found with that email address.', supportEmail: contactInfo.email };
      }

      if (lower.includes('invalid') || lower.includes('format') || lower.includes('email')) {
        return { message: 'Please enter a valid email address.', supportEmail: contactInfo.email };
      }

      if (errorValue.status >= 500) {
        return { message: 'Server error. Please try again later.', supportEmail: contactInfo.email };
      }

      return {
        message: raw || 'Unable to send reset OTP. Please try again.',
        supportEmail: contactInfo.email,
      };
    }

    if (errorValue instanceof Error) {
      return { message: errorValue.message.trim() || 'Unable to send reset OTP. Please try again.', supportEmail: contactInfo.email };
    }

    return { message: 'Unable to send reset OTP. Please try again.', supportEmail: contactInfo.email };
  };

  const handleForgotSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setForgotError('');
    setForgotSupportEmail(null);

    if (!isForgotEmailValid) return;

    setIsForgotSubmitting(true);
    try {
      await requestPasswordReset({ email: forgotEmail.trim() });
      setAuthStep('forgotOtp');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      const classified = classifyForgotPasswordError(submitError);
      setForgotError(classified.message);
      setForgotSupportEmail(classified.supportEmail ?? null);
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const handleOtpContinue = (event: FormEvent) => {
    event.preventDefault();
    setForgotError('');
    setForgotSupportEmail(null);

    if (!isForgotOtpValid) return;
    setAuthStep('forgotReset');
  };

  const handleResetPasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setForgotError('');
    setForgotSupportEmail(null);

    if (!isForgotResetFormValid) return;

    setIsForgotResetSubmitting(true);
    try {
      await resetPasswordWithOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setAuthStep('forgotSuccess');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      const classified = classifyForgotPasswordError(submitError);
      setForgotError(classified.message);
      setForgotSupportEmail(classified.supportEmail ?? null);
    } finally {
      setIsForgotResetSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setErrorInfo(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      setSubmitted(true);
      window.setTimeout(() => {
        initiateClose();
        navigate('/dashboard');
      }, 320);
    } catch (submitError) {
      const info = classifyAuthError(submitError, 'login');
      setErrorInfo(info);
      setError(info.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitted ? initiateClose : handleClose}
      title={
        authStep === 'login'
          ? 'Welcome back'
          : authStep === 'forgot'
            ? 'Forgot Password?'
            : authStep === 'forgotOtp'
              ? 'Verify OTP'
              : authStep === 'forgotReset'
                ? 'Reset Password'
                : 'Password Updated'
      }
      id="login-modal"
      variant="split"
      brandTitle="Access your panelist account"
      brandDescription="Sign in to manage your profile, track rewards, and submit redemption requests."
      isClosing={isClosing}
    >
      {submitted ? (
        <SuccessState
          icon={CheckCircle2}
          eyebrow="Signed In"
          title="Welcome Back"
          body="Redirecting you to your dashboard..."
          autoHint="Opening your dashboard…"
          exiting={isClosing}
        />
      ) : (
        <div key={authStep} className="auth-modal__step">
          {authStep === 'login' ? (
            <>
              <form className="auth-modal__form" onSubmit={(event) => void handleSubmit(event)}>
                {error ? (
                  <div className="auth-modal__error" role="alert">
                    <p className="auth-modal__error-text">{error}</p>
                    {errorInfo?.suggestContactSupport ? (
                      <a
                        className="auth-modal__error-link"
                        href={`mailto:${errorInfo.supportEmail}`}
                      >
                        Contact Support
                      </a>
                    ) : null}
                  </div>
                ) : null}
                <Input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  icon={<Mail size={16} />}
                  variant="default"
                  required
                  autoComplete="email"
                />
                <Input
                  name="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  icon={<Lock size={16} />}
                  variant="default"
                  required
                  showPasswordToggle
                  autoComplete="current-password"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="auth-modal__links">
                  <button type="button" onClick={openForgotPassword}>
                    Forgot Password
                  </button>
                  <button type="button" onClick={switchToSignup}>
                    Create account
                  </button>
                </div>
              </form>
              <SocialLoginButtons />
            </>
          ) : authStep === 'forgot' ? (
            <form className="auth-modal__form" onSubmit={(event) => void handleForgotSubmit(event)}>
              {forgotError ? (
                <div className="auth-modal__error" role="alert">
                  <p className="auth-modal__error-text">{forgotError}</p>
                  {forgotSupportEmail ? (
                    <a className="auth-modal__error-link" href={`mailto:${forgotSupportEmail}`}>
                      Contact Support
                    </a>
                  ) : null}
                </div>
              ) : null}

              <p className="auth-modal__forgot-subtitle">
                Enter your registered email address and we&apos;ll send you a password reset code (OTP).
              </p>

              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={forgotEmail}
                onChange={(event) => setForgotEmail(event.target.value)}
                icon={<Mail size={16} />}
                variant="default"
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isForgotSubmitting || !isForgotEmailValid}
              >
                {isForgotSubmitting ? 'Sending...' : 'Send Reset OTP'}
              </Button>

              <p className="auth-modal__footer-link">
                <button type="button" onClick={backToLogin} disabled={isForgotSubmitting}>
                  Back to Login
                </button>
              </p>
            </form>
          ) : authStep === 'forgotOtp' ? (
            <form className="auth-modal__form" onSubmit={(event) => void handleOtpContinue(event)}>
              {forgotError ? (
                <div className="auth-modal__error" role="alert">
                  <p className="auth-modal__error-text">{forgotError}</p>
                  {forgotSupportEmail ? (
                    <a className="auth-modal__error-link" href={`mailto:${forgotSupportEmail}`}>
                      Contact Support
                    </a>
                  ) : null}
                </div>
              ) : null}

              <p className="auth-modal__forgot-subtitle">
                Enter the one-time password (OTP) sent to your registered email address.
              </p>

              <Input
                name="otp"
                type="text"
                placeholder="Enter OTP"
                value={forgotOtp}
                onChange={(event) => setForgotOtp(event.target.value)}
                icon={<Lock size={16} />}
                variant="default"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isForgotOtpValid}
              >
                Verify OTP
              </Button>

              <p className="auth-modal__footer-link">
                <button type="button" onClick={backToLogin}>
                  Back to Login
                </button>
              </p>
            </form>
          ) : authStep === 'forgotReset' ? (
            <form className="auth-modal__form" onSubmit={(event) => void handleResetPasswordSubmit(event)}>
              {forgotError ? (
                <div className="auth-modal__error" role="alert">
                  <p className="auth-modal__error-text">{forgotError}</p>
                  {forgotSupportEmail ? (
                    <a className="auth-modal__error-link" href={`mailto:${forgotSupportEmail}`}>
                      Contact Support
                    </a>
                  ) : null}
                </div>
              ) : null}

              <p className="auth-modal__forgot-subtitle">Set your new password.</p>

              <Input
                name="newPassword"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                icon={<Lock size={16} />}
                variant="default"
                required
                showPasswordToggle
                autoComplete="new-password"
              />

              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                icon={<Lock size={16} />}
                variant="default"
                required
                showPasswordToggle
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!isForgotResetFormValid || isForgotResetSubmitting}
              >
                {isForgotResetSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>

              <p className="auth-modal__footer-link">
                <button type="button" onClick={backToLogin} disabled={isForgotResetSubmitting}>
                  Back to Login
                </button>
              </p>
            </form>
          ) : (
            <div className="auth-modal__success" role="status">
              <CheckCircle2 className="auth-modal__success-icon" size={54} strokeWidth={1.75} aria-hidden="true" />
              <p className="auth-modal__success-message">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <p className="auth-modal__footer-link">
                <button type="button" onClick={backToLogin}>
                  Back to Login
                </button>
              </p>
            </div>
          )}
        </div>
      )}
      {submitted && (
        <button
          type="button"
          className="auth-modal__skip-close"
          onClick={() => {
            initiateClose();
            navigate('/dashboard');
          }}
        >
          Open dashboard now
        </button>
      )}
    </Modal>
  );
}

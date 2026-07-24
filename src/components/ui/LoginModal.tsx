import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  const isOpen = activeModal === 'login';

  const handleClose = useCallback(() => {
    closeModal();
    setSubmitted(false);
    setIsClosing(false);
    setEmail('');
    setPassword('');
    setError('');
    setErrorInfo(null);
  }, [closeModal]);

  const initiateClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(handleClose, 380);
  }, [handleClose]);

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setIsClosing(false);
      setError('');
      setErrorInfo(null);
    }
  }, [isOpen]);

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
      title="Welcome back"
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
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="auth-modal__links">
              <a href={`mailto:${contactInfo.email}?subject=Password%20reset%20request`}>
                Forgot Password
              </a>
              <button type="button" onClick={switchToSignup}>
                Create account
              </button>
            </div>
          </form>
          <SocialLoginButtons />
        </>
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

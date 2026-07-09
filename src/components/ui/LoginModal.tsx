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
import { useAutoDismiss } from '../../hooks/useAutoDismiss';
import { ApiError } from '../../api/ApiError';
import './AuthModal.css';

const AUTO_CLOSE_MS = 2500;

export default function LoginModal() {
  const navigate = useNavigate();
  const { activeModal, closeModal, switchToSignup } = useAuthModal();
  const { login } = usePanelistAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
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
  }, [closeModal]);

  const initiateClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(handleClose, 380);
  }, [handleClose]);

  const { exiting, dismissNow } = useAutoDismiss({
    active: submitted && isOpen,
    delayMs: AUTO_CLOSE_MS,
    onDismiss: () => {
      initiateClose();
      navigate('/member');
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setIsClosing(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      setSubmitted(true);
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 403) {
        setError(
          submitError.message ||
            'Please complete your panel questionnaire before logging in.'
        );
      } else {
        setError(
          submitError instanceof ApiError
            ? submitError.message
            : 'Unable to sign in right now. Please try again.'
        );
      }
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
          body="Redirecting you to your Panelist Portal..."
          autoHint="Opening your dashboard…"
          exiting={exiting || isClosing}
        />
      ) : (
        <>
          <form className="auth-modal__form" onSubmit={(event) => void handleSubmit(event)}>
            {error ? <p className="auth-modal__error">{error}</p> : null}
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
              <a href="#">Forgot Password</a>
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
            dismissNow();
            navigate('/member');
          }}
        >
          Open dashboard now
        </button>
      )}
    </Modal>
  );
}

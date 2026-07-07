import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import SocialLoginButtons from './SocialLoginButtons';
import SuccessState from './SuccessState';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAutoDismiss } from '../../hooks/useAutoDismiss';
import './AuthModal.css';

const AUTO_CLOSE_MS = 3500;
const UI_AUTH_STATE_KEY = 'panelist_ui_logged_in';

export default function LoginModal() {
  const { activeModal, closeModal, switchToSignup } = useAuthModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isOpen = activeModal === 'login';

  const handleClose = useCallback(() => {
    closeModal();
    setSubmitted(false);
    setIsClosing(false);
    setEmail('');
    setPassword('');
  }, [closeModal]);

  const initiateClose = useCallback(() => {
    setIsClosing(true);
    window.setTimeout(handleClose, 380);
  }, [handleClose]);

  const { exiting, dismissNow } = useAutoDismiss({
    active: submitted && isOpen,
    delayMs: AUTO_CLOSE_MS,
    onDismiss: initiateClose,
  });

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem(UI_AUTH_STATE_KEY, 'true');
    window.dispatchEvent(new CustomEvent('ui-auth-changed'));
    setSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitted ? initiateClose : handleClose}
      title="Welcome back"
      id="login-modal"
      variant="split"
      brandTitle="Access your research profile"
      brandDescription="Sign in to manage surveys, track rewards, and stay connected with the Spade Community panel."
      isClosing={isClosing}
    >
      {submitted ? (
        <SuccessState
          icon={CheckCircle2}
          eyebrow="Signed In"
          title="Welcome Back"
          body="You have been logged in successfully."
          note="(Demo mode)"
          autoHint="Closing automatically…"
          exiting={exiting || isClosing}
        />
      ) : (
        <>
          <form className="auth-modal__form" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              variant="default"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              variant="default"
              required
              showPasswordToggle
              autoComplete="current-password"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Sign In
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
          onClick={dismissNow}
        >
          Close now
        </button>
      )}
    </Modal>
  );
}

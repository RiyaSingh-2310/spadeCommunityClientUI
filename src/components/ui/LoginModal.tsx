import { useState, type FormEvent } from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import SocialLoginButtons from './SocialLoginButtons';
import { useAuthModal } from '../../context/AuthModalContext';
import './AuthModal.css';

export default function LoginModal() {
  const { activeModal, closeModal, switchToSignup } = useAuthModal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isOpen = activeModal === 'login';

  const handleClose = () => {
    closeModal();
    setSubmitted(false);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log In" id="login-modal">
      {submitted ? (
        <div className="auth-modal__success">
          <CheckCircle2 size={48} className="auth-modal__success-icon" />
          <h3>Welcome back!</h3>
          <p>You have been logged in successfully. (Demo mode)</p>
        </div>
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
              variant="modal"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              variant="modal"
              required
              showPasswordToggle
              autoComplete="current-password"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Login
            </Button>
            <div className="auth-modal__links">
              <a href="#">Forgot Password</a>
              <button type="button" onClick={switchToSignup}>
                Sign Up
              </button>
            </div>
          </form>
          <SocialLoginButtons />
        </>
      )}
    </Modal>
  );
}

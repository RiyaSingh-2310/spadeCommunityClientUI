import { useEffect, useState } from 'react';
import Modal from './Modal';
import JoinForm from './JoinForm';
import { useAuthModal } from '../../context/AuthModalContext';
import './AuthModal.css';

/** Delay before mounting reCAPTCHA so the modal is visible (no hidden parents). */
const CAPTCHA_MOUNT_DELAY_MS = 420;

export default function SignUpModal() {
  const { activeModal, closeModal, switchToLogin } = useAuthModal();
  const isOpen = activeModal === 'signup';
  const [captchaReady, setCaptchaReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formInstance, setFormInstance] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCaptchaReady(false);
      setIsClosing(false);
      return;
    }

    // Force a fresh JoinForm instance every time Create Account opens.
    setFormInstance((value) => value + 1);
    const timer = window.setTimeout(() => setCaptchaReady(true), CAPTCHA_MOUNT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleModalClose = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      closeModal();
      setIsClosing(false);
    }, 380);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Create your account"
      id="signup-modal"
      keepMounted
      variant="split"
      brandTitle="Join a premium research community"
      brandDescription="Create your profile, verify your email, and start participating in studies that reward your perspective."
      isClosing={isClosing}
    >
      {isOpen ? (
        <JoinForm
          key={`signup-form-${formInstance}`}
          variant="modal"
          onSwitchToLogin={switchToLogin}
          captchaActive={captchaReady}
          onSignupModalClose={handleModalClose}
        />
      ) : null}
    </Modal>
  );
}

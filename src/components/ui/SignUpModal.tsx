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

  useEffect(() => {
    if (!isOpen) {
      setCaptchaReady(false);
      setIsClosing(false);
      return;
    }

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
          variant="modal"
          onSwitchToLogin={switchToLogin}
          captchaActive={captchaReady}
          onSignupModalClose={handleModalClose}
        />
      ) : null}
    </Modal>
  );
}

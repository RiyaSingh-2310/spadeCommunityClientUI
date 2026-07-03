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

  useEffect(() => {
    if (!isOpen) {
      setCaptchaReady(false);
      return;
    }

    const timer = window.setTimeout(() => setCaptchaReady(true), CAPTCHA_MOUNT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Sign Up"
      id="signup-modal"
      keepMounted
    >
      {isOpen ? (
        <JoinForm
          variant="modal"
          onSwitchToLogin={switchToLogin}
          captchaActive={captchaReady}
        />
      ) : null}
    </Modal>
  );
}

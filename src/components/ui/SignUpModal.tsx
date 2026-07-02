import { useEffect, useState } from 'react';
import Modal from './Modal';
import JoinForm from './JoinForm';
import { useAuthModal } from '../../context/AuthModalContext';
import './AuthModal.css';

export default function SignUpModal() {
  const { activeModal, closeModal, switchToLogin } = useAuthModal();
  const isOpen = activeModal === 'signup';
  const [captchaReady, setCaptchaReady] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCaptchaReady(false);
      return;
    }

    let frame1 = 0;
    let frame2 = 0;

    frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setCaptchaReady(true));
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Sign Up"
      id="signup-modal"
      keepMounted
    >
      <JoinForm
        variant="modal"
        onSwitchToLogin={switchToLogin}
        captchaActive={isOpen && captchaReady}
      />
    </Modal>
  );
}

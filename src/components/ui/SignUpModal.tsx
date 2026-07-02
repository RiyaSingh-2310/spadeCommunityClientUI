import Modal from './Modal';
import JoinForm from './JoinForm';
import { useAuthModal } from '../../context/AuthModalContext';
import './AuthModal.css';

export default function SignUpModal() {
  const { activeModal, closeModal, switchToLogin } = useAuthModal();
  const isOpen = activeModal === 'signup';

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Sign Up" id="signup-modal">
      <JoinForm variant="modal" onSwitchToLogin={switchToLogin} />
    </Modal>
  );
}

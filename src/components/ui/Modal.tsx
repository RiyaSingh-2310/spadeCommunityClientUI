import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  id?: string;
}

export default function Modal({ isOpen, onClose, title, children, id }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        id={id}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id ? `${id}-title` : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal__close"
          onClick={onClose}
          aria-label="Close dialog"
          type="button"
        >
          <X size={20} />
        </button>
        <h2 className="modal__title" id={id ? `${id}-title` : undefined}>
          {title}
        </h2>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

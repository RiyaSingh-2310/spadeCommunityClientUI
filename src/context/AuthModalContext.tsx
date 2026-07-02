import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type AuthModalType = 'login' | 'signup' | null;

interface AuthModalContextValue {
  activeModal: AuthModalType;
  openLogin: () => void;
  openSignup: () => void;
  closeModal: () => void;
  switchToLogin: () => void;
  switchToSignup: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const openLogin = useCallback(() => setActiveModal('login'), []);
  const openSignup = useCallback(() => setActiveModal('signup'), []);
  const closeModal = useCallback(() => setActiveModal(null), []);
  const switchToLogin = useCallback(() => setActiveModal('login'), []);
  const switchToSignup = useCallback(() => setActiveModal('signup'), []);

  return (
    <AuthModalContext.Provider
      value={{ activeModal, openLogin, openSignup, closeModal, switchToLogin, switchToSignup }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}

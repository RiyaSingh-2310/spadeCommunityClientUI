import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../context/AuthModalContext';

export function LoginRedirect() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  useEffect(() => {
    navigate('/', { replace: true });
    openLogin();
  }, [navigate, openLogin]);

  return null;
}

export function JoinRedirect() {
  const navigate = useNavigate();
  const { openSignup } = useAuthModal();

  useEffect(() => {
    navigate('/', { replace: true });
    openSignup();
  }, [navigate, openSignup]);

  return null;
}

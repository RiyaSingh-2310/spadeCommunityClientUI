import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { verifyAccount } from '../api/auth';
import { ApiError } from '../api/ApiError';
import { saveActivationSuccess, wasTokenActivated } from '../utils/activationSession';
import { clearSignupSuccess } from '../utils/signupSession';
import './AccountActivation.css';

const REDIRECT_MS = 2200;

function useActivationToken() {
  const location = useLocation();
  const params = useParams<{ token?: string }>();

  return useMemo(() => {
    const search = new URLSearchParams(location.search);
    return params.token ?? search.get('token') ?? search.get('activation_token') ?? '';
  }, [location.search, params.token]);
}

export default function AccountActivation() {
  const token = useActivationToken();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const finishActivationSuccess = useCallback(() => {
    saveActivationSuccess(token);
    clearSignupSuccess();
    window.dispatchEvent(new CustomEvent('onboarding-updated'));
    setStatus('success');
    setErrorMessage('');
  }, [token]);

  const runActivation = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing activation token. Please use the activation link from your email.');
      return;
    }

    if (wasTokenActivated(token)) {
      finishActivationSuccess();
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await verifyAccount({ token });
      finishActivationSuccess();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to activate your account.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [token, finishActivationSuccess]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runActivation();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [runActivation]);

  // After successful verification, redirect back to the client UI login flow.
  useEffect(() => {
    if (status !== 'success') return;

    const timer = window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, REDIRECT_MS);

    return () => window.clearTimeout(timer);
  }, [status, navigate]);

  if (status === 'loading') {
    return (
      <div className="activation-only">
        <motion.article
          className="activation-only__card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2>Activating your account...</h2>
          <p>Please wait while we verify your account.</p>
        </motion.article>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="activation-only">
        <motion.article
          className="activation-only__card activation-only__card--error"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2>Account activation failed</h2>
          <p>{errorMessage || 'This activation link is invalid or expired.'}</p>
          <button
            type="button"
            className="activation-only__button"
            onClick={() => navigate('/', { replace: true })}
          >
            Return Home
          </button>
        </motion.article>
      </div>
    );
  }

  return (
    <div className="activation-only">
      <motion.article
        className="activation-only__card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="activation-only__icon" aria-hidden="true">
          <BadgeCheck size={24} />
        </div>
        <p className="activation-only__eyebrow">Activation Complete</p>
        <h1>Account Activated Successfully</h1>
        <p>
          Your account has been verified successfully.
          <br />
          Redirecting you to sign in…
        </p>
        <button
          type="button"
          className="activation-only__button"
          onClick={() => navigate('/login', { replace: true })}
        >
          Continue to Login
        </button>
      </motion.article>
    </div>
  );
}

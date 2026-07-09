import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { verifyAccount } from '../api/auth';
import { ApiError } from '../api/ApiError';
import { saveActivationSuccess, wasTokenActivated } from '../utils/activationSession';
import './AccountActivation.css';

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
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const runActivation = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing activation token. Please use the activation link from your email.');
      return;
    }

    if (wasTokenActivated(token)) {
      setStatus('success');
      setErrorMessage('');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await verifyAccount({ token });
      saveActivationSuccess(token);
      setStatus('success');
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
  }, [token]);

  useEffect(() => {
    void runActivation();
  }, [runActivation]);

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
          You may now proceed to your questionnaire invitation from your email.
        </p>
      </motion.article>
    </div>
  );
}

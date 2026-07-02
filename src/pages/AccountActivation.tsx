import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { verifyAccount } from '../api/auth';
import { ApiError } from '../api/ApiError';
import { saveActivationSuccess, wasTokenActivated } from '../utils/activationSession';
import './Questionnaire.css';

function useActivationToken() {
  const location = useLocation();
  const params = useParams<{ token?: string }>();

  return useMemo(() => {
    const search = new URLSearchParams(location.search);
    return params.token ?? search.get('token') ?? search.get('activation_token') ?? '';
  }, [location.search, params.token]);
}

export default function AccountActivation() {
  const navigate = useNavigate();
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
      <div className="activation-page">
        <div className="activation-page__container">
          <div className="questionnaire-card questionnaire-card--loading">
            <h2>Activating your account...</h2>
            <p>Please wait while we verify your account.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="activation-page">
        <div className="activation-page__container">
          <div className="questionnaire-card questionnaire-card--error">
            <h2>Account activation failed</h2>
            <p>{errorMessage || 'This activation link is invalid or expired.'}</p>
            <div className="questionnaire-card__actions questionnaire-card__actions--center">
              <Button variant="gradient" onClick={() => void runActivation()}>
                Retry Activation
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activation-page">
      <div className="activation-page__container">
        <div className="questionnaire-card questionnaire-card--complete">
          <CheckCircle2 className="questionnaire-card__success-icon" size={56} />
          <h2>Account Activated Successfully</h2>
          <p>Your account has been activated successfully.</p>
          <p>
            You may now proceed with your questionnaire invitation from your email.
          </p>
          <div className="questionnaire-card__actions questionnaire-card__actions--center">
            <Button variant="gradient" onClick={() => navigate('/')}>
              Continue to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

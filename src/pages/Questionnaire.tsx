import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ClipboardList, Sparkles } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import { useAutoDismiss } from '../hooks/useAutoDismiss';
import ProgressIndicator from '../components/questionnaire/ProgressIndicator';
import QuestionRenderer from '../components/questionnaire/QuestionRenderer';
import QuestionnaireNavigation from '../components/questionnaire/QuestionnaireNavigation';
import Button from '../components/ui/Button';
import SuccessState from '../components/ui/SuccessState';
import { clearOnboardingState } from '../utils/clearOnboardingState';
import { saveMemberComplete } from '../utils/memberSession';
import { getSignupSuccess } from '../utils/signupSession';
import { decodeSecureToken } from '../utils/secureToken';
import './Questionnaire.css';

export default function Questionnaire() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ secureToken?: string }>();
  const query = new URLSearchParams(location.search);
  const tokenFromQuery = decodeSecureToken(query.get('token') ?? '') || (query.get('Userid') ?? '');
  const decodedPathToken = decodeSecureToken(params.secureToken ?? '');
  const userToken = tokenFromQuery || decodedPathToken;
  const verificationParams = userToken ? { Userid: userToken } : undefined;
  const flow = useQuestionnaire({ verificationParams });
  const [animating, setAnimating] = useState(false);
  const [memberSaved, setMemberSaved] = useState(false);
  const {
    questionnaire,
    loading,
    error,
    currentIndex,
    currentQuestion,
    totalQuestions,
    progressPercent,
    answers,
    fieldError,
    isSubmitting,
    isComplete,
    completionMessage,
    setAnswer,
    goNext,
    goPrevious,
    submit,
    retryLoad,
  } = flow;

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleReturnHome = useCallback(() => {
    const signup = getSignupSuccess();
    saveMemberComplete({
      email: signup?.email,
      completedAt: new Date().toISOString(),
    });
    clearOnboardingState();
    window.dispatchEvent(new CustomEvent('onboarding-updated'));
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    if (!isComplete || memberSaved) return;

    const signup = getSignupSuccess();
    saveMemberComplete({
      email: signup?.email,
      completedAt: new Date().toISOString(),
    });
    clearOnboardingState();
    setMemberSaved(true);
    window.dispatchEvent(new CustomEvent('onboarding-updated'));
  }, [isComplete, memberSaved]);

  const { exiting: completionExiting } = useAutoDismiss({
    active: isComplete,
    delayMs: 5000,
    onDismiss: handleReturnHome,
  });

  if (loading) {
    return (
      <div className="questionnaire-page">
        <div className="questionnaire-page__container">
          <div className="questionnaire-card questionnaire-card--loading">
            <div className="questionnaire-card__skeleton questionnaire-card__skeleton--title" />
            <div className="questionnaire-card__skeleton questionnaire-card__skeleton--text" />
            <div className="questionnaire-card__skeleton questionnaire-card__skeleton--bar" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questionnaire-page">
        <div className="questionnaire-page__container">
          <div className="questionnaire-card questionnaire-card--error">
            <h2>Unable to load questionnaire</h2>
            <p>{error}</p>
            <div className="questionnaire-card__actions">
              <Button variant="outline" onClick={() => void retryLoad()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaire || !currentQuestion) {
    return (
      <div className="questionnaire-page">
        <div className="questionnaire-page__container">
          <div className="questionnaire-card questionnaire-card--error">
            <h2>Unable to access questionnaire</h2>
            <p>Missing or invalid questionnaire token. Please use the questionnaire link from your email.</p>
            <div className="questionnaire-card__actions questionnaire-card__actions--center">
              <Button variant="outline" onClick={handleReturnHome}>
                Return Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="questionnaire-page questionnaire-page--complete">
        <div className="questionnaire-page__container">
          <div className={`questionnaire-card questionnaire-card--complete questionnaire-card--premium${completionExiting ? ' questionnaire-card--exiting' : ''}`}>
            <SuccessState
              variant="premium"
              icon={BadgeCheck}
              iconVariant="accent"
              eyebrow="Survey Complete"
              title="Thank You for Participating"
              body={completionMessage || 'Your responses have been recorded successfully.'}
              badges={[
                { label: 'Profile Complete', success: true },
                { label: 'Rewards Eligible', success: true },
                { label: 'Member Active', success: true },
              ]}
              note={
                <>
                  <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  You&apos;re all set. New study invitations will arrive based on your profile.
                </>
              }
              actions={
                <Button variant="primary" onClick={handleReturnHome}>
                  Return Home
                </Button>
              }
              autoHint="Returning home automatically…"
              exiting={completionExiting}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-page">
      <div className="questionnaire-page__container">
        <div className="questionnaire-card">
          <header className="questionnaire-card__header">
            <ClipboardList className="questionnaire-card__header-icon" size={32} aria-hidden="true" />
            <h1 className="questionnaire-card__title">{questionnaire.title}</h1>
            <p className="questionnaire-card__description">{questionnaire.description}</p>
          </header>

          <ProgressIndicator
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            progressPercent={progressPercent}
          />

          <div
            className={`questionnaire-card__question ${animating ? 'questionnaire-card__question--enter' : ''}`}
            key={currentQuestion.id}
          >
            <h2 className="questionnaire-card__question-title">
              {currentQuestion.title}
              {currentQuestion.required && (
                <span className="questionnaire-card__required" aria-label="required">
                  *
                </span>
              )}
            </h2>

            <QuestionRenderer
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => setAnswer(currentQuestion.id, value)}
              error={fieldError}
            />
          </div>

          <QuestionnaireNavigation
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            isSubmitting={isSubmitting}
            onPrevious={goPrevious}
            onNext={goNext}
            onSubmit={submit}
          />
        </div>
      </div>
    </div>
  );
}

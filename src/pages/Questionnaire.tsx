import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ClipboardList, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PreScreenerModal from '../components/prescreener/PreScreenerModal';
import { usePreScreener } from '../hooks/usePreScreener';
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

  const preScreener = usePreScreener(userToken || 'anonymous');
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
  } = useQuestionnaire({ verificationParams });

  const [animating, setAnimating] = useState(false);
  const [memberSaved, setMemberSaved] = useState(false);

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

  const { exiting: toastExiting, dismissNow: dismissToastNow } = useAutoDismiss({
    active: preScreener.showUnlockNotice,
    delayMs: 4500,
    onDismiss: preScreener.dismissUnlockNotice,
  });

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

  if (!userToken) {
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

  if (!questionnaire || !currentQuestion) return null;

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
                <Button variant="gradient" onClick={handleReturnHome}>
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

  const surveyLocked = !preScreener.surveyUnlocked;

  return (
    <div className="questionnaire-page">
      <PreScreenerModal
        isOpen={preScreener.isModalOpen}
        currentIndex={preScreener.currentIndex}
        totalQuestions={preScreener.totalQuestions}
        progressPercent={preScreener.progressPercent}
        currentQuestion={preScreener.currentQuestion}
        answers={preScreener.answers}
        fieldError={preScreener.fieldError}
        onAnswer={preScreener.setAnswer}
        onPrevious={preScreener.goPrevious}
        onNext={preScreener.goNext}
        onFinish={preScreener.handleFinish}
        onClose={preScreener.dismissModal}
      />

      {preScreener.showUnlockNotice && (
        <div
          className={`questionnaire-page__toast${toastExiting ? ' questionnaire-page__toast--exiting' : ''}`}
          role="status"
        >
          <ShieldCheck size={20} aria-hidden="true" />
          <div className="questionnaire-page__toast-copy">
            <strong>Pre-Screen Completed</strong>
            <p>Now you can continue to the survey.</p>
          </div>
          <button type="button" onClick={dismissToastNow} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div
        className={`questionnaire-page__container${surveyLocked ? ' questionnaire-page__container--locked' : ''}`}
      >
        {preScreener.lockedMessage && (
          <div className="questionnaire-page__lock-banner" role="alert">
            <Lock size={18} aria-hidden="true" />
            <p>{preScreener.lockedMessage}</p>
            <Button variant="outline" size="sm" onClick={preScreener.reopenModal}>
              Start Pre-Screener
            </Button>
          </div>
        )}

        <div
          className={`questionnaire-card${surveyLocked ? ' questionnaire-card--locked' : ''}`}
          aria-hidden={surveyLocked}
        >
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

        {surveyLocked && <div className="questionnaire-page__lock-overlay" aria-hidden="true" />}
      </div>
    </div>
  );
}

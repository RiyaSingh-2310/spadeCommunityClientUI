import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Lock, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PreScreenerModal from '../components/prescreener/PreScreenerModal';
import { usePreScreener } from '../hooks/usePreScreener';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import ProgressIndicator from '../components/questionnaire/ProgressIndicator';
import QuestionRenderer from '../components/questionnaire/QuestionRenderer';
import QuestionnaireNavigation from '../components/questionnaire/QuestionnaireNavigation';
import Button from '../components/ui/Button';
import { clearOnboardingState } from '../utils/clearOnboardingState';
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

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleReturnHome = () => {
    clearOnboardingState();
    navigate('/');
  };

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
      <div className="questionnaire-page">
        <div className="questionnaire-page__container">
          <div className="questionnaire-card questionnaire-card--complete">
            <CheckCircle2 className="questionnaire-card__success-icon" size={56} />
            <h2>Questionnaire Submitted Successfully</h2>
            <p>{completionMessage || 'Thank you for completing the survey.'}</p>
            <p>Your responses have been recorded successfully.</p>
            <div className="questionnaire-card__actions questionnaire-card__actions--center">
              <Button variant="gradient" onClick={handleReturnHome}>
                Return Home
              </Button>
            </div>
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
        <div className="questionnaire-page__toast" role="status">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>Pre-Screener completed successfully. You may now continue with the survey.</p>
          <button type="button" onClick={preScreener.dismissUnlockNotice} aria-label="Dismiss">
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

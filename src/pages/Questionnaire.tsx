import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuestionnaire } from '../hooks/useQuestionnaire';
import ProgressIndicator from '../components/questionnaire/ProgressIndicator';
import QuestionRenderer from '../components/questionnaire/QuestionRenderer';
import QuestionnaireNavigation from '../components/questionnaire/QuestionnaireNavigation';
import Button from '../components/ui/Button';
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
              <Button variant="outline" onClick={() => navigate('/')}>
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
              <Button variant="gradient" onClick={() => navigate('/')}>
                Return Home
              </Button>
            </div>
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
            {/* {currentQuestion.description && (
              <p className="questionnaire-card__question-hint">{currentQuestion.description}</p>
            )} */}

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

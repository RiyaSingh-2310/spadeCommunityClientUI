import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, ClipboardList } from 'lucide-react';
import { useParams } from 'react-router-dom';
import ProgressIndicator from '../components/questionnaire/ProgressIndicator';
import QuestionRenderer from '../components/questionnaire/QuestionRenderer';
import QuestionnaireNavigation from '../components/questionnaire/QuestionnaireNavigation';
import Button from '../components/ui/Button';
import SuccessState from '../components/ui/SuccessState';
import { useQuestionnaireGroup } from '../hooks/useQuestionnaireGroup';
import './Questionnaire.css';

export default function QuestionnaireGroupPublic() {
  const { groupId = '' } = useParams<{ groupId: string }>();
  const [animating, setAnimating] = useState(false);
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
  } = useQuestionnaireGroup(groupId);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const languageLabel = useMemo(() => {
    const raw = String(questionnaire?.language ?? '').trim();
    if (!raw) return '—';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [questionnaire?.language]);

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
            <h2>Unable to load questionnaire group</h2>
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
            <h2>Unable to access questionnaire group</h2>
            <p>This questionnaire group link is invalid or inactive.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="questionnaire-page questionnaire-page--complete">
        <div className="questionnaire-page__container">
          <div className="questionnaire-card questionnaire-card--complete questionnaire-card--premium">
            <SuccessState
              variant="premium"
              icon={BadgeCheck}
              iconVariant="accent"
              eyebrow="Questionnaire Submitted"
              title="Thank You for Your Response"
              body={completionMessage || 'Your answers have been saved successfully.'}
              badges={[{ label: 'Responses Saved', success: true }]}
              note="You can now close this page."
              actions={
                <Button
                  variant="primary"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.close();
                    }
                  }}
                >
                  Close
                </Button>
              }
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
            <p className="questionnaire-card__description">Language: {languageLabel}</p>
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

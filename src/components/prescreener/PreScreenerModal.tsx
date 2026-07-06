import { Clock, Globe, X } from 'lucide-react';
import { PRE_SCREENER_META } from '../../data/preScreenerDemo';
import type { AnswersMap, Question, QuestionAnswer } from '../../types/questionnaire';
import QuestionRenderer from '../questionnaire/QuestionRenderer';
import './PreScreenerModal.css';

interface PreScreenerModalProps {
  isOpen: boolean;
  currentIndex: number;
  totalQuestions: number;
  progressPercent: number;
  currentQuestion: Question | null;
  answers: AnswersMap;
  fieldError: string | null;
  onAnswer: (questionId: string, value: QuestionAnswer) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  onClose: () => void;
}

export default function PreScreenerModal({
  isOpen,
  currentIndex,
  totalQuestions,
  progressPercent,
  currentQuestion,
  answers,
  fieldError,
  onAnswer,
  onPrevious,
  onNext,
  onFinish,
  onClose,
}: PreScreenerModalProps) {
  if (!isOpen || !currentQuestion) return null;

  const isLast = currentIndex === totalQuestions - 1;
  const meta = PRE_SCREENER_META;

  return (
    <div className="ps-modal-overlay" role="presentation">
      <div
        className="ps-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prescreener-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ps-modal__close"
          onClick={onClose}
          aria-label="Close pre-screener"
        >
          <X size={20} />
        </button>

        <header className="ps-modal__header">
          <p className="ps-modal__eyebrow">Mandatory Pre-Screener</p>
          <h2 id="prescreener-title" className="ps-modal__title">
            {meta.title}
          </h2>
          <div className="ps-modal__meta">
            <span>
              <Globe size={15} aria-hidden="true" />
              {meta.language}
            </span>
            <span>
              <Clock size={15} aria-hidden="true" />
              {meta.estimatedMinutes} min (LOI)
            </span>
          </div>
        </header>

        <section className="ps-modal__instructions" aria-label="Instructions">
          <h3>Instructions</h3>
          <ul>
            {meta.instructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className="ps-modal__progress">
          <div className="ps-modal__progress-header">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div
            className="ps-modal__progress-track"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="ps-modal__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="ps-modal__question" key={currentQuestion.id}>
          <h4 className="ps-modal__question-title">
            {currentQuestion.title}
            {currentQuestion.required && <span aria-hidden="true"> *</span>}
          </h4>
          {currentQuestion.description && (
            <p className="ps-modal__question-hint">{currentQuestion.description}</p>
          )}
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => onAnswer(currentQuestion.id, value)}
            error={fieldError}
          />
        </div>

        <footer className="ps-modal__footer">
          <button
            type="button"
            className="ps-modal__btn ps-modal__btn--ghost"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="ps-modal__btn ps-modal__btn--primary"
            onClick={isLast ? onFinish : onNext}
          >
            {isLast ? 'Complete Pre-Screener' : 'Next'}
          </button>
        </footer>
      </div>
    </div>
  );
}

import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import Button from '../ui/Button';

interface QuestionnaireNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function QuestionnaireNavigation({
  currentIndex,
  totalQuestions,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit,
}: QuestionnaireNavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="q-nav">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst || isSubmitting}
        className="q-nav__btn q-nav__btn--prev"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Previous</span>
      </Button>

      <p className="q-nav__security">
        <Shield size={14} aria-hidden="true" />
        <span>Your data is safe with us</span>
      </p>

      {isLast ? (
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="q-nav__btn q-nav__btn--next"
        >
          <span>{isSubmitting ? 'Submitting…' : 'Submit'}</span>
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={onNext}
          disabled={isSubmitting}
          className="q-nav__btn q-nav__btn--next"
        >
          <span>Next</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

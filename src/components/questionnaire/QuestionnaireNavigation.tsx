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
        className="q-nav__btn"
      >
        Previous
      </Button>

      {isLast ? (
        <Button
          variant="gradient"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="q-nav__btn"
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      ) : (
        <Button variant="gradient" onClick={onNext} className="q-nav__btn">
          Next
        </Button>
      )}
    </div>
  );
}

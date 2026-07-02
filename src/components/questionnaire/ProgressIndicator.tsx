interface ProgressIndicatorProps {
  currentIndex: number;
  totalQuestions: number;
  progressPercent: number;
}

export default function ProgressIndicator({
  currentIndex,
  totalQuestions,
  progressPercent,
}: ProgressIndicatorProps) {
  return (
    <div className="q-progress">
      <div className="q-progress__header">
        <span className="q-progress__label">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="q-progress__percent">{progressPercent}% Complete</span>
      </div>
      <div className="q-progress__track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="q-progress__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

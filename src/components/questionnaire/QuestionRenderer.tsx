import type { Question, QuestionAnswer } from '../../types/questionnaire';

interface QuestionRendererProps {
  question: Question;
  value: QuestionAnswer;
  onChange: (value: QuestionAnswer) => void;
  error?: string | null;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: QuestionRendererProps) {
  const hasError = Boolean(error);

  switch (question.type) {
    case 'text':
      return (
        <div className={`q-field ${hasError ? 'q-field--error' : ''}`}>
          <input
            type="text"
            className="q-field__input"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${question.id}-error` : undefined}
          />
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className={`q-field ${hasError ? 'q-field--error' : ''}`}>
          <textarea
            className="q-field__textarea"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${question.id}-error` : undefined}
          />
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </div>
      );

    case 'radio':
      return (
        <fieldset className={`q-field q-field--choice ${hasError ? 'q-field--error' : ''}`}>
          <legend className="sr-only">{question.title}</legend>
          <div className="q-field__options">
            {question.options?.map((option) => (
              <label key={option.id} className="q-choice">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="q-choice__input"
                />
                <span className="q-choice__indicator q-choice__indicator--radio" />
                <span className="q-choice__label">{option.label}</span>
              </label>
            ))}
          </div>
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </fieldset>
      );

    case 'checkbox': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <fieldset className={`q-field q-field--choice ${hasError ? 'q-field--error' : ''}`}>
          <legend className="sr-only">{question.title}</legend>
          <div className="q-field__options">
            {question.options?.map((option) => (
              <label key={option.id} className="q-choice">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={selected.includes(option.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, option.value]
                      : selected.filter((v) => v !== option.value);
                    onChange(next);
                  }}
                  className="q-choice__input"
                />
                <span className="q-choice__indicator q-choice__indicator--checkbox" />
                <span className="q-choice__label">{option.label}</span>
              </label>
            ))}
          </div>
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </fieldset>
      );
    }

    case 'dropdown':
      return (
        <div className={`q-field ${hasError ? 'q-field--error' : ''}`}>
          <select
            className="q-field__select"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${question.id}-error` : undefined}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </div>
      );

    case 'rating': {
      const min = question.ratingMin ?? 1;
      const max = question.ratingMax ?? 5;
      const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      const selectedRating = typeof value === 'number' ? value : null;

      return (
        <div className={`q-field q-field--rating ${hasError ? 'q-field--error' : ''}`}>
          <div className="q-rating" role="radiogroup" aria-label={question.title}>
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                role="radio"
                aria-checked={selectedRating === rating}
                className={`q-rating__btn ${selectedRating === rating ? 'q-rating__btn--active' : ''}`}
                onClick={() => onChange(rating)}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="q-rating__labels">
            <span>Low</span>
            <span>High</span>
          </div>
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </div>
      );
    }

    case 'yes_no':
      return (
        <fieldset className={`q-field q-field--choice ${hasError ? 'q-field--error' : ''}`}>
          <legend className="sr-only">{question.title}</legend>
          <div className="q-field__options">
            {(question.options && question.options.length > 0
              ? question.options
              : [
                  { id: 'yes', label: 'Yes', value: 'Yes' },
                  { id: 'no', label: 'No', value: 'No' },
                ]
            ).map((option) => (
              <label key={option.id} className="q-choice">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="q-choice__input"
                />
                <span className="q-choice__indicator q-choice__indicator--radio" />
                <span className="q-choice__label">{option.label}</span>
              </label>
            ))}
          </div>
          {error && (
            <span id={`${question.id}-error`} className="q-field__error" role="alert">
              {error}
            </span>
          )}
        </fieldset>
      );

    default:
      return null;
  }
}

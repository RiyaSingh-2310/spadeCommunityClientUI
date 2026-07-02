import type { Question, QuestionAnswer } from '../types/questionnaire';

export function validateAnswer(question: Question, answer: QuestionAnswer): string | null {
  if (!question.required) return null;

  switch (question.type) {
    case 'text':
    case 'textarea':
      if (typeof answer !== 'string' || !answer.trim()) {
        return 'This field is required';
      }
      return null;

    case 'radio':
    case 'dropdown':
    case 'yes_no':
      if (typeof answer !== 'string' || !answer) {
        return 'Please select an option';
      }
      return null;

    case 'checkbox':
      if (!Array.isArray(answer) || answer.length === 0) {
        return 'Please select at least one option';
      }
      return null;

    case 'rating':
      if (typeof answer !== 'number' || answer < (question.ratingMin ?? 1)) {
        return 'Please select a rating';
      }
      return null;

    default:
      return null;
  }
}

export function getInitialAnswer(question: Question): QuestionAnswer {
  switch (question.type) {
    case 'checkbox':
      return [];
    case 'rating':
      return null;
    default:
      return '';
  }
}

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'dropdown'
  | 'rating'
  | 'yes_no';

export type QuestionAnswer = string | string[] | number | null;

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  placeholder?: string;
  description?: string;
  order?: number;
  ratingMin?: number;
  ratingMax?: number;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  language?: string;
  questions: Question[];
  alreadyCompleted?: boolean;
  panelistName?: string;
}

export type AnswersMap = Record<string, QuestionAnswer>;

export interface QuestionnaireSubmission {
  questionnaireId: string;
  answers: AnswersMap;
  submittedAt: string;
  verificationParams?: Record<string, string>;
}

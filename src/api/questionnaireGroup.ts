import type { Question, Questionnaire, QuestionnaireSubmission, QuestionType } from '../types/questionnaire';
import { ApiError } from './ApiError';
import { apiRequest } from './http';

interface GroupQuestionRecord {
  id?: number | string;
  question_title?: string;
  question_type?: string;
  options?: string[] | null;
}

interface GroupQuestionnaireResponse {
  success?: boolean;
  message?: string;
  data?: {
    id?: number | string;
    surveyTitle?: string;
    language?: string;
    questions?: GroupQuestionRecord[];
  };
}

function parseOptions(rawOptions: unknown): string[] {
  if (Array.isArray(rawOptions)) {
    return rawOptions
      .map((option) => {
        if (typeof option === 'string') return option.trim();
        if (option && typeof option === 'object') {
          const value = (option as { option_text?: string; label?: string; value?: string }).option_text
            ?? (option as { label?: string }).label
            ?? (option as { value?: string }).value;
          return String(value ?? '').trim();
        }
        return String(option ?? '').trim();
      })
      .filter(Boolean);
  }

  if (typeof rawOptions === 'string') {
    const trimmed = rawOptions.trim();
    if (!trimmed) return [];
    try {
      return parseOptions(JSON.parse(trimmed));
    } catch {
      return [trimmed];
    }
  }

  return [];
}

function mapQuestionType(questionType: string | undefined, options: string[]): QuestionType {
  const normalized = String(questionType ?? '').trim().toLowerCase();

  switch (normalized) {
    case 'textarea':
      return 'textarea';
    case 'checkbox':
      return 'checkbox';
    case 'dropdown':
      return 'dropdown';
    case 'radio':
    case 'radio button':
      return 'radio';
    case 'number':
      return 'text';
    default:
      if (
        options.length === 2 &&
        options.some((value) => value.toLowerCase() === 'yes') &&
        options.some((value) => value.toLowerCase() === 'no')
      ) {
        return 'yes_no';
      }
      if (options.length > 0) {
        return options.length > 5 ? 'dropdown' : 'radio';
      }
      return 'text';
  }
}

function normalizeGroupQuestionnaire(
  payload: GroupQuestionnaireResponse,
  groupId: string
): Questionnaire {
  const record = payload.data;
  const questions = (record?.questions ?? [])
    .map((question, index) => {
      const options = parseOptions(question.options);
      const questionId = String(question.id ?? index + 1);

      return {
        id: questionId,
        title: String(question.question_title ?? `Question ${index + 1}`).trim(),
        type: mapQuestionType(question.question_type, options),
        required: true,
        order: index + 1,
        options: options.map((option, optionIndex) => ({
          id: `${questionId}-${optionIndex + 1}`,
          label: option,
          value: option,
        })),
      } satisfies Question;
    })
    .filter((question) => question.title);

  return {
    id: String(record?.id ?? groupId),
    title: String(record?.surveyTitle ?? 'Questionnaire').trim(),
    description: 'Please answer the following questions.',
    language: String(record?.language ?? '').trim(),
    questions,
  };
}

export async function fetchQuestionnaireGroup(groupId: string): Promise<Questionnaire> {
  const data = await apiRequest<GroupQuestionnaireResponse>(
    `/api/questionnaire-group/public/${encodeURIComponent(groupId)}/questions`
  );

  if (data.success === false) {
    throw new ApiError(data.message || 'Unable to load questionnaire.', 400);
  }

  return normalizeGroupQuestionnaire(data, groupId);
}

function formatAnswerForApi(answer: string | string[] | number | null): string {
  if (answer === null || answer === undefined) return '';
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
}

export interface QuestionnaireGroupSubmitOptions {
  panelistId: number;
  questions: Question[];
}

export function buildQuestionnaireGroupSubmissionPayload(
  submission: QuestionnaireSubmission,
  options: QuestionnaireGroupSubmitOptions
) {
  const seenQuestionIds = new Set<number>();

  const answers = options.questions
    .map((question) => {
      const questionId = Number(question.id);
      if (!Number.isFinite(questionId) || seenQuestionIds.has(questionId)) {
        return null;
      }

      seenQuestionIds.add(questionId);

      return {
        question_id: questionId,
        question_title: question.title,
        answer: formatAnswerForApi(submission.answers[question.id] ?? null),
      };
    })
    .filter((answer): answer is { question_id: number; question_title: string; answer: string } => {
      return answer !== null && answer.answer.trim() !== '';
    });

  return {
    panelist_id: options.panelistId,
    answers,
  };
}

export interface SubmitQuestionnaireGroupResponse {
  success: boolean;
  message: string;
  data?: {
    submission_id?: number;
  };
}

export async function submitQuestionnaireGroup(
  groupId: string,
  submission: QuestionnaireSubmission,
  options: QuestionnaireGroupSubmitOptions
): Promise<SubmitQuestionnaireGroupResponse> {
  if (!Number.isFinite(options.panelistId) || options.panelistId <= 0) {
    throw new ApiError('Missing panelist. Please sign in or use a valid questionnaire link.', 400);
  }

  const body = buildQuestionnaireGroupSubmissionPayload(submission, options);
  if (body.answers.length === 0) {
    throw new ApiError('Please answer all required questions before submitting.', 400);
  }

  const response = await apiRequest<SubmitQuestionnaireGroupResponse>(
    `/api/questionnaire-group/public/${encodeURIComponent(groupId)}/submit`,
    {
      method: 'POST',
      body,
    }
  );

  if (response.success === false) {
    throw new ApiError(response.message || 'Failed to submit questionnaire.', 400);
  }

  return response;
}

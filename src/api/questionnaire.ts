import type { QuestionType, Questionnaire, QuestionnaireSubmission } from '../types/questionnaire';
import { apiRequest } from './http';

interface LegacyPanelist {
  id?: number;
  name?: string;
}

interface LegacyGroupQuestion {
  id?: number | string;
  question_text?: string;
  options?: string[] | null;
}

interface LegacyQuestionGroup {
  question_title?: string;
  questions?: LegacyGroupQuestion[];
}

interface LegacyQuestionnaireResponse {
  success?: boolean;
  message?: string;
  already_completed?: boolean;
  panelist?: LegacyPanelist;
  data?: LegacyQuestionGroup[];
}

function inferTypeFromOptions(options?: string[] | null): QuestionType {
  if (!options || options.length === 0) return 'text';
  if (
    options.length === 2 &&
    options.some((value) => value.toLowerCase() === 'yes') &&
    options.some((value) => value.toLowerCase() === 'no')
  ) {
    return 'yes_no';
  }
  return options.length > 5 ? 'dropdown' : 'radio';
}

function normalizeLegacyQuestionnaire(
  payload: LegacyQuestionnaireResponse,
  userToken: string
): Questionnaire {
  const groups = payload.data ?? [];
  let sequence = 0;

  const questions = groups.flatMap((group, groupIndex) =>
    (group.questions ?? []).map((question, questionIndex) => {
      sequence += 1;
      const options = question.options ?? [];

      return {
        id: String(question.id ?? `${groupIndex + 1}-${questionIndex + 1}`),
        title: question.question_text ?? `Question ${sequence}`,
        description: group.question_title,
        type: inferTypeFromOptions(question.options),
        required: true,
        order: sequence,
        options: options.map((option, optionIndex) => ({
          id: `${sequence}-${optionIndex + 1}`,
          label: option,
          value: option,
        })),
      };
    })
  );

  const questionnaireId = userToken || 'panelist-questionnaire';

  return {
    id: questionnaireId,
    title: 'Complete Your Profile',
    description: 'Please answer the following questions to help us know you better.',
    questions,
    alreadyCompleted: Boolean(payload.already_completed),
    panelistName: payload.panelist?.name,
  };
}

function buildQueryString(params?: Record<string, string>) {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.append(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function fetchQuestionnaire(verificationParams?: Record<string, string>): Promise<Questionnaire> {
  const userToken = verificationParams?.Userid ?? verificationParams?.userId ?? '';
  const queryParams = userToken ? { Userid: userToken } : verificationParams;
  const legacyData = await apiRequest<LegacyQuestionnaireResponse>(
    `/api/questionnaire${buildQueryString(queryParams)}`
  );
  return normalizeLegacyQuestionnaire(legacyData, userToken);
}

function formatAnswerForApi(answer: string | string[] | number | null): string {
  if (answer === null || answer === undefined) return '';
  if (Array.isArray(answer)) return answer.join(', ');
  return String(answer);
}

export function buildQuestionnaireSubmissionPayload(submission: QuestionnaireSubmission) {
  return {
    answers: Object.entries(submission.answers).map(([question_id, answer]) => ({
      question_id: Number(question_id),
      answer: formatAnswerForApi(answer),
    })),
  };
}

export interface SubmitQuestionnaireResponse {
  success: boolean;
  message: string;
}

export async function submitQuestionnaire(
  verificationParams: Record<string, string>,
  submission: QuestionnaireSubmission
): Promise<SubmitQuestionnaireResponse> {
  const userToken = verificationParams.Userid ?? verificationParams.userId ?? '';
  const body = buildQuestionnaireSubmissionPayload(submission);
  return apiRequest<SubmitQuestionnaireResponse>(
    `/api/questionnaire/submit${buildQueryString({ Userid: userToken })}`,
    {
      method: 'POST',
      body,
    }
  );
}

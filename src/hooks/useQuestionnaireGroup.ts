import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuestionnaireGroup, submitQuestionnaireGroup } from '../api/questionnaireGroup';
import { ApiError } from '../api/ApiError';
import type { AnswersMap, Question, QuestionAnswer, Questionnaire } from '../types/questionnaire';
import { getPanelistSession } from '../utils/panelistSession';
import { getInitialAnswer, validateAnswer } from '../utils/questionnaireValidation';

function resolvePanelistId(): number | null {
  const sessionId = getPanelistSession()?.user?.id;
  if (typeof sessionId === 'number' && Number.isFinite(sessionId) && sessionId > 0) {
    return sessionId;
  }

  if (typeof window === 'undefined') return null;

  const search = new URLSearchParams(window.location.search);
  const raw =
    search.get('panelist_id') ??
    search.get('panelistId') ??
    search.get('PanelistId') ??
    search.get('Userid') ??
    search.get('userId') ??
    '';
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return null;
}

interface UseQuestionnaireGroupReturn {
  questionnaire: Questionnaire | null;
  loading: boolean;
  error: string | null;
  currentIndex: number;
  currentQuestion: Question | null;
  totalQuestions: number;
  progressPercent: number;
  answers: AnswersMap;
  fieldError: string | null;
  isSubmitting: boolean;
  isComplete: boolean;
  completionMessage: string;
  setAnswer: (questionId: string, value: QuestionAnswer) => void;
  goNext: () => boolean;
  goPrevious: () => void;
  submit: () => Promise<void>;
  retryLoad: () => Promise<void>;
}

function buildInitialAnswers(questions: Question[]): AnswersMap {
  return questions.reduce<AnswersMap>((acc, question) => {
    acc[question.id] = getInitialAnswer(question);
    return acc;
  }, {});
}

export function useQuestionnaireGroup(groupId: string): UseQuestionnaireGroupReturn {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const hasSubmittedRef = useRef(false);

  const loadQuestionnaire = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      setQuestionnaire(null);
      setError('Missing questionnaire link. Please use the public link shared with you.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchQuestionnaireGroup(groupId);
      setQuestionnaire(data);
      setAnswers(buildInitialAnswers(data.questions));
      setCurrentIndex(0);
      setFieldError(null);
      setIsComplete(false);
      setCompletionMessage('');
    } catch (loadError) {
      const message =
        loadError instanceof ApiError
          ? loadError.message
          : 'Unable to load questionnaire right now. Please check your connection and retry.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadQuestionnaire();
  }, [loadQuestionnaire]);

  const totalQuestions = questionnaire?.questions.length ?? 0;
  const currentQuestion = questionnaire?.questions[currentIndex] ?? null;
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const setAnswer = useCallback((questionId: string, value: QuestionAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setFieldError(null);
  }, []);

  const validateCurrent = useCallback((): boolean => {
    if (!currentQuestion) return false;
    const validationError = validateAnswer(currentQuestion, answers[currentQuestion.id]);
    if (validationError) {
      setFieldError(validationError);
      return false;
    }
    setFieldError(null);
    return true;
  }, [currentQuestion, answers]);

  const goNext = useCallback((): boolean => {
    if (!validateCurrent()) return false;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((index) => index + 1);
      setFieldError(null);
    }
    return true;
  }, [validateCurrent, currentIndex, totalQuestions]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
      setFieldError(null);
    }
  }, [currentIndex]);

  const submit = useCallback(async () => {
    if (!questionnaire || isSubmitting || hasSubmittedRef.current) return;

    const firstInvalidQuestion = questionnaire.questions.find(
      (question) => validateAnswer(question, answers[question.id]) !== null
    );
    if (firstInvalidQuestion) {
      const invalidIndex = questionnaire.questions.findIndex(
        (question) => question.id === firstInvalidQuestion.id
      );
      setCurrentIndex(Math.max(invalidIndex, 0));
      setFieldError(validateAnswer(firstInvalidQuestion, answers[firstInvalidQuestion.id]));
      return;
    }

    const panelistId = resolvePanelistId();
    if (!panelistId) {
      setFieldError('Missing panelist. Please sign in or use a valid questionnaire link.');
      return;
    }

    setIsSubmitting(true);
    hasSubmittedRef.current = true;
    try {
      const response = await submitQuestionnaireGroup(
        groupId,
        {
          questionnaireId: questionnaire.id,
          answers,
          submittedAt: new Date().toISOString(),
        },
        {
          panelistId,
          questions: questionnaire.questions,
        }
      );

      setCompletionMessage(
        response.message || 'Answers submitted successfully!'
      );
      setIsComplete(true);
    } catch (submitError) {
      hasSubmittedRef.current = false;
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof TypeError
            ? 'Network error. Please check your connection and try again.'
            : 'Failed to submit your responses. Please try again.';
      setFieldError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [questionnaire, answers, isSubmitting, groupId]);

  return {
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
    retryLoad: loadQuestionnaire,
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuestionnaire, submitQuestionnaire } from '../api/questionnaire';
import { ApiError } from '../api/ApiError';
import type { AnswersMap, Question, QuestionAnswer, Questionnaire } from '../types/questionnaire';
import { clearOnboardingState } from '../utils/clearOnboardingState';
import { getInitialAnswer, validateAnswer } from '../utils/questionnaireValidation';

interface UseQuestionnaireOptions {
  verificationParams?: Record<string, string>;
}

interface UseQuestionnaireReturn {
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
  return questions.reduce<AnswersMap>((acc, q) => {
    acc[q.id] = getInitialAnswer(q);
    return acc;
  }, {});
}

export function useQuestionnaire(options: UseQuestionnaireOptions = {}): UseQuestionnaireReturn {
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

  const userToken =
    options.verificationParams?.Userid ?? options.verificationParams?.userId ?? '';

  const loadQuestionnaire = useCallback(async () => {
    if (!userToken) {
      setLoading(false);
      setQuestionnaire(null);
      setError('Missing questionnaire token. Please use the questionnaire link from your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchQuestionnaire({ Userid: userToken });
      setQuestionnaire(data);
      setAnswers(buildInitialAnswers(data.questions));
      setCurrentIndex(0);
      setFieldError(null);
      setIsComplete(Boolean(data.alreadyCompleted));
      setCompletionMessage(
        data.alreadyCompleted
          ? 'You have already completed this questionnaire. Thank you for your response.'
          : ''
      );
      if (data.alreadyCompleted) {
        clearOnboardingState();
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to load questionnaire right now. Please check your connection and retry.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userToken]);

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
      setCurrentIndex((i) => i + 1);
      setFieldError(null);
    }
    return true;
  }, [validateCurrent, currentIndex, totalQuestions]);

  const goPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
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

    setIsSubmitting(true);
    try {
      const verificationParams = userToken ? { Userid: userToken } : options.verificationParams ?? {};
      const response = await submitQuestionnaire(verificationParams, {
        questionnaireId: questionnaire.id,
        answers,
        submittedAt: new Date().toISOString(),
        verificationParams,
      });

      hasSubmittedRef.current = true;
      setCompletionMessage(
        response.message || 'Questionnaire submitted successfully! Thank you for completing the survey.'
      );
      setIsComplete(true);
      clearOnboardingState();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to submit your responses. Please try again.';
      setFieldError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [questionnaire, answers, isSubmitting, userToken, options.verificationParams]);

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

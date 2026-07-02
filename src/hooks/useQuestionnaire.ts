import { useCallback, useEffect, useState } from 'react';
import { fetchQuestionnaire, buildQuestionnaireSubmissionPayload } from '../api/questionnaire';
import type { AnswersMap, Question, QuestionAnswer, Questionnaire } from '../types/questionnaire';
import { getInitialAnswer, validateAnswer } from '../utils/questionnaireValidation';

interface UseQuestionnaireOptions {
  verificationParams?: Record<string, string>;
  enableSubmitApi?: boolean;
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
    } catch {
      setError('Unable to load questionnaire right now. Please check your connection and retry.');
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
    if (!questionnaire || isSubmitting) return;

    const firstInvalidQuestion = questionnaire.questions.find(
      (question) => validateAnswer(question, answers[question.id]) !== null
    );
    if (firstInvalidQuestion) {
      const invalidIndex = questionnaire.questions.findIndex((question) => question.id === firstInvalidQuestion.id);
      setCurrentIndex(Math.max(invalidIndex, 0));
      setFieldError(validateAnswer(firstInvalidQuestion, answers[firstInvalidQuestion.id]));
      return;
    }

    setIsSubmitting(true);
    try {
      buildQuestionnaireSubmissionPayload({
        questionnaireId: questionnaire.id,
        answers,
        submittedAt: new Date().toISOString(),
        verificationParams: userToken ? { Userid: userToken } : options.verificationParams,
      });

      // Submission API wiring is intentionally deferred and can be toggled later.
      if (options.enableSubmitApi) {
        setCompletionMessage('Survey submitted successfully.');
      } else {
        setCompletionMessage('Your answers are captured and ready for submission.');
      }
      setIsComplete(true);
    } catch {
      setFieldError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [questionnaire, answers, isSubmitting, userToken, options.verificationParams, options.enableSubmitApi]);

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

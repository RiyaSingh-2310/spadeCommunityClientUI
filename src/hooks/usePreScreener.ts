import { useCallback, useMemo, useState } from 'react';
import { PRE_SCREENER_QUESTIONS } from '../data/preScreenerDemo';
import type { AnswersMap, QuestionAnswer } from '../types/questionnaire';
import { getInitialAnswer, validateAnswer } from '../utils/questionnaireValidation';

const STORAGE_PREFIX = 'prescreener_complete_';

function buildInitialAnswers(): AnswersMap {
  return PRE_SCREENER_QUESTIONS.reduce<AnswersMap>((acc, q) => {
    acc[q.id] = getInitialAnswer(q);
    return acc;
  }, {});
}

function readStoredCompletion(sessionKey: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(`${STORAGE_PREFIX}${sessionKey}`) === 'true';
}

function storeCompletion(sessionKey: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(`${STORAGE_PREFIX}${sessionKey}`, 'true');
}

export function usePreScreener(sessionKey: string) {
  const initiallyComplete = readStoredCompletion(sessionKey);

  const [isComplete, setIsComplete] = useState(initiallyComplete);
  const [isModalOpen, setIsModalOpen] = useState(!initiallyComplete);
  const [wasDismissed, setWasDismissed] = useState(false);
  const [showUnlockNotice, setShowUnlockNotice] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>(buildInitialAnswers);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const totalQuestions = PRE_SCREENER_QUESTIONS.length;
  const currentQuestion = PRE_SCREENER_QUESTIONS[currentIndex] ?? null;
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const surveyUnlocked = isComplete;

  const setAnswer = useCallback((questionId: string, value: QuestionAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setFieldError(null);
  }, []);

  const validateCurrent = useCallback((): boolean => {
    if (!currentQuestion) return false;

    if (currentQuestion.id === 'ps-attention') {
      const value = answers[currentQuestion.id];
      if (value !== 'blue') {
        setFieldError('Please select Blue to continue.');
        return false;
      }
    }

    const validationError = validateAnswer(currentQuestion, answers[currentQuestion.id]);
    if (validationError) {
      setFieldError(validationError);
      return false;
    }

    setFieldError(null);
    return true;
  }, [currentQuestion, answers]);

  const goNext = useCallback(() => {
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

  const completePreScreener = useCallback(() => {
    if (!validateCurrent()) return false;

    storeCompletion(sessionKey);
    setIsComplete(true);
    setIsModalOpen(false);
    setWasDismissed(false);
    setShowUnlockNotice(true);
    return true;
  }, [validateCurrent, sessionKey]);

  const handleFinish = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      return goNext();
    }
    return completePreScreener();
  }, [currentIndex, totalQuestions, goNext, completePreScreener]);

  const dismissModal = useCallback(() => {
    if (isComplete) {
      setIsModalOpen(false);
      return;
    }
    setIsModalOpen(false);
    setWasDismissed(true);
  }, [isComplete]);

  const reopenModal = useCallback(() => {
    setIsModalOpen(true);
    setWasDismissed(false);
  }, []);

  const dismissUnlockNotice = useCallback(() => {
    setShowUnlockNotice(false);
  }, []);

  const lockedMessage = useMemo(() => {
    if (surveyUnlocked) return null;
    if (wasDismissed || !isModalOpen) {
      return 'Please complete the Pre-Screener questionnaire to access this survey.';
    }
    return null;
  }, [surveyUnlocked, wasDismissed, isModalOpen]);

  return {
    isComplete,
    isModalOpen,
    surveyUnlocked,
    lockedMessage,
    showUnlockNotice,
    currentIndex,
    currentQuestion,
    totalQuestions,
    progressPercent,
    answers,
    fieldError,
    setAnswer,
    goNext,
    goPrevious,
    handleFinish,
    dismissModal,
    reopenModal,
    dismissUnlockNotice,
  };
}

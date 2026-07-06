import type { Question } from '../types/questionnaire';

export interface PreScreenerMeta {
  title: string;
  language: string;
  estimatedMinutes: number;
  instructions: string[];
}

export const PRE_SCREENER_META: PreScreenerMeta = {
  title: 'Consumer Insights Pre-Screener',
  language: 'English (US)',
  estimatedMinutes: 2,
  instructions: [
    'Answer all questions honestly and to the best of your knowledge.',
    'This short pre-screener determines your eligibility for the main survey.',
    'You must complete every required question before continuing.',
    'Please do not use the browser back button during this session.',
  ],
};

export const PRE_SCREENER_QUESTIONS: Question[] = [
  {
    id: 'ps-age',
    title: 'What is your age?',
    type: 'radio',
    required: true,
    order: 1,
    options: [
      { id: 'a1', label: '18–24', value: '18-24' },
      { id: 'a2', label: '25–34', value: '25-34' },
      { id: 'a3', label: '35–44', value: '35-44' },
      { id: 'a4', label: '45–54', value: '45-54' },
      { id: 'a5', label: '55+', value: '55+' },
    ],
  },
  {
    id: 'ps-gender',
    title: 'What is your gender?',
    type: 'radio',
    required: true,
    order: 2,
    options: [
      { id: 'g1', label: 'Female', value: 'female' },
      { id: 'g2', label: 'Male', value: 'male' },
      { id: 'g3', label: 'Non-binary', value: 'non-binary' },
      { id: 'g4', label: 'Prefer not to say', value: 'prefer-not' },
    ],
  },
  {
    id: 'ps-country',
    title: 'Which country do you currently reside in?',
    type: 'dropdown',
    required: true,
    order: 3,
    options: [
      { id: 'c1', label: 'United States', value: 'us' },
      { id: 'c2', label: 'United Kingdom', value: 'uk' },
      { id: 'c3', label: 'Canada', value: 'ca' },
      { id: 'c4', label: 'Australia', value: 'au' },
      { id: 'c5', label: 'India', value: 'in' },
      { id: 'c6', label: 'Germany', value: 'de' },
    ],
  },
  {
    id: 'ps-profession',
    title: 'What is your profession?',
    type: 'text',
    required: true,
    order: 4,
    placeholder: 'e.g. Marketing Manager, Student, Engineer',
  },
  {
    id: 'ps-attention',
    title: 'Select Blue from the options below',
    type: 'radio',
    required: true,
    order: 5,
    description: 'Attention check — please read carefully.',
    options: [
      { id: 'col1', label: 'Red', value: 'red' },
      { id: 'col2', label: 'Green', value: 'green' },
      { id: 'col3', label: 'Blue', value: 'blue' },
      { id: 'col4', label: 'Yellow', value: 'yellow' },
    ],
  },
  {
    id: 'ps-recent',
    title: 'Have you participated in a similar survey recently?',
    type: 'yes_no',
    required: true,
    order: 6,
  },
];

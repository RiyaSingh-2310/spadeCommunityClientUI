import type { Questionnaire } from '../types/questionnaire';

export const mockQuestionnaire: Questionnaire = {
  id: 'survey-001',
  title: 'Questionnaire Survey',
  description:
    'Please answer the following questions honestly. Your responses help us improve our research.',
  questions: [
    {
      id: 'q1',
      title: 'What is your name?',
      type: 'text',
      required: true,
      placeholder: 'Enter your full name',
    },
    {
      id: 'q2',
      title: 'What is your address?',
      type: 'textarea',
      required: false,
      placeholder: 'Enter your full address',
    },
    {
      id: 'q3',
      title: 'What is your gender?',
      type: 'radio',
      required: true,
      options: [
        { id: 'male', label: 'Male', value: 'male' },
        { id: 'female', label: 'Female', value: 'female' },
        { id: 'other', label: 'Other', value: 'other' },
      ],
    },
    {
      id: 'q4',
      title: 'Which vehicles do you own?',
      type: 'checkbox',
      required: true,
      options: [
        { id: 'car', label: 'Car', value: 'car' },
        { id: 'bike', label: 'Bike', value: 'bike' },
        { id: 'scooter', label: 'Scooter', value: 'scooter' },
        { id: 'bicycle', label: 'Bicycle', value: 'bicycle' },
      ],
    },
    {
      id: 'q5',
      title: 'Select your country',
      type: 'dropdown',
      required: true,
      options: [
        { id: 'us', label: 'United States', value: 'us' },
        { id: 'uk', label: 'United Kingdom', value: 'uk' },
        { id: 'ca', label: 'Canada', value: 'ca' },
        { id: 'au', label: 'Australia', value: 'au' },
        { id: 'in', label: 'India', value: 'in' },
      ],
    },
    {
      id: 'q6',
      title: 'How satisfied are you?',
      type: 'rating',
      required: true,
      ratingMin: 1,
      ratingMax: 5,
    },
    {
      id: 'q7',
      title: 'Do you own a car?',
      type: 'yes_no',
      required: true,
    },
  ],
};

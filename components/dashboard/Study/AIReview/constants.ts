import { AiReviewDifficulty } from "@/types/AiReviewSession";

export const DIFFICULTY_TIME_FACTORS: Record<AiReviewDifficulty, { minPerQuestion: number, maxPerQuestion: number }> = {
  easy: { minPerQuestion: 0.5, maxPerQuestion: 1 },
  medium: { minPerQuestion: 1, maxPerQuestion: 2 },
  hard: { minPerQuestion: 2, maxPerQuestion: 3 },
};

export const DIFFICULTY_OPTIONS = [
  {
    value: 'easy' as const,
    label: 'Beginner',
    icon: '🟢',
    description: 'Remembering & Understanding',
    details: 'Fact-based questions, definitions, true/false, multiple choice basics',
  },
  {
    value: 'medium' as const,
    label: 'Intermediate',
    icon: '🟡',
    description: 'Applying & Analyzing',
    details: 'Scenario questions, comparisons, cause & effect, problem solving',
  },
  {
    value: 'hard' as const,
    label: 'Advanced',
    icon: '🔴',
    description: 'Evaluating & Creating',
    details: 'Justify positions, critique statements, create summaries, make predictions',
  }
];

export const MODE_OPTIONS = [
  {
    value: 'separate_questions' as const,
    label: 'Separate Questions',
    description: 'Answer each question individually with immediate evaluation',
    icon: '📝',
  },
  {
    value: 'mono_test' as const,
    label: 'Comprehensive Test',
    description: 'Complete all questions first, then get evaluated results',
    icon: '📋',
  }
];

export const QUESTION_COUNT_OPTIONS = [
  { value: 5, label: '5 Questions', },
  { value: 10, label: '10 Questions', },
  { value: 15, label: '15 Questions', },
  { value: 20, label: '20 Questions', },
];

export const GENERATION_STEPS = [
  'Analyzing note content...',
  'Selecting question types...',
  'Generating AI questions...',
  'Validating questions...',
  'Preparing review session...'
];
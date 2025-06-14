import { AiReviewDifficulty, AiReviewQuestionType } from '@/types/AiReviewSession';
import { QuestionTypeConfig } from './types';

export const QUESTION_TYPE_CONFIGS: Record<AiReviewQuestionType, QuestionTypeConfig> = {
  // Easy/Beginner Level
  fact_based: {
    type: 'fact_based',
    name: 'Fact-based (What/When/Who)',
    description: 'Questions that test recall of specific facts, dates, names, or events',
    difficulty: ['easy'],
    promptTemplate: 'Create a fact-based question about {topic}. Focus on who, what, when, where details that can be directly answered from the content.',
    weight: 1.0,
  },
  definition: {
    type: 'definition',
    name: 'Definition',
    description: 'Questions asking for definitions of key terms or concepts',
    difficulty: ['easy'],
    promptTemplate: 'Create a definition question for important terms or concepts in {topic}. Ask the student to define or explain a key term.',
    weight: 1.2,
  },
  true_false: {
    type: 'true_false',
    name: 'True/False',
    description: 'Binary choice questions testing understanding of statements',
    difficulty: ['easy'],
    promptTemplate: 'Create a true/false question about {topic}. Make a clear statement that is either definitively true or false based on the content.',
    weight: 0.8,
  },
  fill_in_the_blank: {
    type: 'fill_in_the_blank',
    name: 'Fill in the Blank',
    description: 'Questions with missing words or phrases to complete',
    difficulty: ['easy'],
    promptTemplate: 'Create a fill-in-the-blank question about {topic}. Remove a key term or phrase that students should know.',
    weight: 1.0,
  },
  multiple_choice_basic: {
    type: 'multiple_choice_basic',
    name: 'Multiple Choice (Basic facts)',
    description: 'Multiple choice questions testing basic factual knowledge',
    difficulty: ['easy'],
    promptTemplate: 'Create a multiple choice question about {topic}. Include one correct answer and 3 plausible distractors. Focus on basic facts.',
    weight: 1.1,
  },
  flashcard: {
    type: 'flashcard',
    name: 'Flashcards (Basic Q&A)',
    description: 'Simple question-answer pairs for memorization',
    difficulty: ['easy'],
    promptTemplate: 'Create a flashcard-style question about {topic}. Keep it simple and focused on one key concept or fact.',
    weight: 0.9,
  },
  matching: {
    type: 'matching',
    name: 'Matching Terms with Definitions',
    description: 'Questions that require matching related items',
    difficulty: ['easy'],
    promptTemplate: 'Create a matching question about {topic}. Present terms and their corresponding definitions or related concepts.',
    weight: 1.0,
  },
  cloze_deletion: {
    type: 'cloze_deletion',
    name: 'Cloze Deletion',
    description: 'Text passages with strategically removed words',
    difficulty: ['easy'],
    promptTemplate: 'Create a cloze deletion exercise about {topic}. Remove key words from important sentences or passages.',
    weight: 1.0,
  },

  // Medium/Intermediate Level
  explain_own_words: {
    type: 'explain_own_words',
    name: 'Explain in Your Own Words',
    description: 'Questions requiring students to demonstrate understanding by explaining concepts',
    difficulty: ['medium'],
    promptTemplate: 'Create a question asking students to explain {topic} in their own words. Focus on understanding rather than memorization.',
    weight: 1.3,
  },
  scenario: {
    type: 'scenario',
    name: 'Scenario Questions',
    description: 'Situational questions that apply knowledge to realistic contexts',
    difficulty: ['medium'],
    promptTemplate: 'Create a scenario-based question about {topic}. Present a realistic situation where students must apply their knowledge.',
    weight: 1.4,
  },
  compare_contrast: {
    type: 'compare_contrast',
    name: 'Compare & Contrast',
    description: 'Questions asking students to identify similarities and differences',
    difficulty: ['medium'],
    promptTemplate: 'Create a compare and contrast question about {topic}. Ask students to identify similarities and differences between concepts.',
    weight: 1.2,
  },
  cause_effect: {
    type: 'cause_effect',
    name: 'Cause and Effect',
    description: 'Questions exploring relationships between events, actions, and outcomes',
    difficulty: ['medium'],
    promptTemplate: 'Create a cause and effect question about {topic}. Focus on relationships between events, actions, and their consequences.',
    weight: 1.3,
  },
  categorization: {
    type: 'categorization',
    name: 'Categorization',
    description: 'Questions requiring classification or organization of information',
    difficulty: ['medium'],
    promptTemplate: 'Create a categorization question about {topic}. Ask students to classify or organize information into appropriate groups.',
    weight: 1.1,
  },
  multiple_choice_conceptual: {
    type: 'multiple_choice_conceptual',
    name: 'Multiple Choice (Conceptual)',
    description: 'Multiple choice questions testing deeper conceptual understanding',
    difficulty: ['medium'],
    promptTemplate: 'Create a conceptual multiple choice question about {topic}. Focus on understanding principles rather than facts.',
    weight: 1.2,
  },
  problem_solving: {
    type: 'problem_solving',
    name: 'Problem Solving / Case-based',
    description: 'Questions presenting problems that require analytical thinking',
    difficulty: ['medium'],
    promptTemplate: 'Create a problem-solving question about {topic}. Present a case or problem that requires analytical thinking and application of knowledge.',
    weight: 1.5,
  },

  // Hard/Advanced Level
  justify_defend: {
    type: 'justify_defend',
    name: 'Justify/Defend',
    description: 'Questions requiring students to provide reasoning and evidence for positions',
    difficulty: ['hard'],
    promptTemplate: 'Create a question asking students to justify or defend a position about {topic}. Require evidence and logical reasoning.',
    weight: 1.6,
  },
  critique_statement: {
    type: 'critique_statement',
    name: 'Critique a Statement',
    description: 'Questions asking for critical analysis and evaluation',
    difficulty: ['hard'],
    promptTemplate: 'Create a critique question about {topic}. Present a statement or argument for students to analyze and evaluate critically.',
    weight: 1.5,
  },
  rank_prioritize: {
    type: 'rank_prioritize',
    name: 'Rank/Prioritize',
    description: 'Questions requiring evaluation and ordering based on criteria',
    difficulty: ['hard'],
    promptTemplate: 'Create a ranking or prioritization question about {topic}. Ask students to order or prioritize items based on specific criteria.',
    weight: 1.4,
  },
  summary: {
    type: 'summary',
    name: 'Create a Summary',
    description: 'Questions asking students to synthesize information into summaries',
    difficulty: ['hard'],
    promptTemplate: 'Create a summary question about {topic}. Ask students to synthesize and summarize key information or concepts.',
    weight: 1.3,
  },
  concept_map: {
    type: 'concept_map',
    name: 'Design a Concept Map',
    description: 'Questions requiring visualization of relationships between concepts',
    difficulty: ['hard'],
    promptTemplate: 'Create a concept mapping question about {topic}. Ask students to show relationships between different concepts or ideas.',
    weight: 1.7,
  },
  prediction_hypothesis: {
    type: 'prediction_hypothesis',
    name: 'Prediction / Hypothesis',
    description: 'Questions asking for predictions or hypothesis formation',
    difficulty: ['hard'],
    promptTemplate: 'Create a prediction or hypothesis question about {topic}. Ask students to make informed predictions or form hypotheses based on the content.',
    weight: 1.6,
  },
};


export function getQuestionTypesByDifficulty(difficulty: AiReviewDifficulty): QuestionTypeConfig[] {
  return Object.values(QUESTION_TYPE_CONFIGS).filter(config => 
    config.difficulty.includes(difficulty)
  );
}


export function selectRandomQuestionTypes(
  difficulty: AiReviewDifficulty, 
  count: number,
  excludeTypes?: AiReviewQuestionType[]
): AiReviewQuestionType[] {
  const availableTypes = getQuestionTypesByDifficulty(difficulty)
    .filter(config => !excludeTypes?.includes(config.type));
  
  if (availableTypes.length === 0) {
    throw new Error(`No question types available for difficulty: ${difficulty}`);
  }

  const selectedTypes: AiReviewQuestionType[] = [];
  const weightedTypes: Array<{ type: AiReviewQuestionType; weight: number }> = [];

  availableTypes.forEach(config => {
    const weight = Math.ceil((config.weight || 1) * 10);
    for (let i = 0; i < weight; i++) {
      weightedTypes.push({ type: config.type, weight: config.weight || 1 });
    }
  });

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * weightedTypes.length);
    selectedTypes.push(weightedTypes[randomIndex].type);
  }

  return selectedTypes;
}

export const DIFFICULTY_DESCRIPTIONS = {
  easy: '🟢 Beginner (Low Difficulty) - Focus: Remembering & Understanding\nQuestions should test basic recall, recognition, and simple comprehension of facts and concepts.',
  medium: '🟡 Intermediate (Moderate Difficulty) - Focus: Applying & Analyzing\nQuestions should require students to apply knowledge, analyze information, and make connections between concepts.',
  hard: '🔴 Advanced (High Difficulty) - Focus: Evaluating & Creating\nQuestions should involve critical thinking, evaluation of ideas, synthesis of information, and creative problem-solving.',
};

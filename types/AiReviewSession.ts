export type AiReviewMode = 'mono_test' | 'separate_questions';
export type AiReviewDifficulty = 'easy' | 'medium' | 'hard';
export type AiReviewStatus = 'pending' | 'ready_for_review' | 'in_progress' | 'evaluating_answers' | 'completed' | 'failed';
export type AiReviewQuestionStatus = 'skipped' | 'answered' | 'evaluating' | 'generated' | 'evaluated';
export type AiReviewQuestionEvaluation = 'correct' | 'incorrect' | "partial" | 'error';
export type AiReviewQuestionType =
  // Beginner (Low Difficulty)
  | 'fact_based'                // 1. Fact-based (What/When/Who)
  | 'definition'                // 2. Definition
  | 'true_false'                // 3. True/False
  | 'fill_in_the_blank'         // 4. Fill in the Blank
  | 'multiple_choice_basic'     // 5. Multiple Choice (Basic facts)
  | 'flashcard'                 // 6. Flashcards (Basic Q&A)
  | 'matching'                  // 7. Matching Terms with Definitions
  | 'cloze_deletion'            // 8. Cloze Deletion

  // Intermediate (Moderate Difficulty)
  | 'explain_own_words'         // 9. Explain in Your Own Words
  | 'scenario'                  // 10. Scenario Questions
  | 'compare_contrast'          // 11. Compare & Contrast
  | 'cause_effect'              // 12. Cause and Effect
  | 'categorization'            // 13. Categorization
  | 'multiple_choice_conceptual'// 14. Multiple Choice (Conceptual)
  | 'problem_solving'           // 15. Problem Solving / Case-based

  // Advanced (High Difficulty)
  | 'justify_defend'            // 16. Justify/Defend
  | 'critique_statement'        // 17. Critique a Statement
  | 'rank_prioritize'           // 18. Rank/Prioritize
  | 'summary'                   // 19. Create a Summary
  | 'concept_map'               // 20. Design a Concept Map
  | 'prediction_hypothesis';    // 21. Prediction / Hypothesis


export interface AiReviewQuestion {
  id: string;
  question_type: AiReviewQuestionType;
  question: string;
  timeSpent: number;
  answer?: string;
  status: AiReviewQuestionStatus;
  evaluation?: AiReviewQuestionEvaluation;
  score?: number;
  aiMessage?: string;
  options?: string[]; // For multiple choice or matching questions
}

export interface AiReviewSession {
  id: string;
  userId: string;
  noteId: string;
  status: AiReviewStatus;
  mode?: AiReviewMode;
  difficulty?: AiReviewDifficulty;
  summary?: string;
  keyTakeaways?: string[];
  generatedQuestions?: AiReviewQuestion[];
  result?: {
    totalQuestions: number;
    correctAnswers: number;
    skippedAnswers: number;
  };
  modelVersion?: string;
  errorMessage?: string;
  requestedAt?: Date;
  questionsGeneratedAt?: Date;
  sessionStartedAt?: Date;
  completedAt?: Date;
};
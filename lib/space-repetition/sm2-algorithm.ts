import { Note } from "@/types/Note";
import { Question } from "@/types/Question";

// --- Configuration for time-based penalty ---
// If a correct answer (feedback 3 or 4) takes longer than this (in milliseconds),
// its quality score for SM-2 calculation will be penalized.
const TIME_THRESHOLD_MS_FOR_PENALTY = 15000; // 15 seconds
// Maximum penalty to apply to the SM-2 quality score (0-5 scale).
// A penalty of 1.0 would effectively reduce "Good" (SM-2 q=4) to "Harder" (SM-2 q=3).
const MAX_TIME_PENALTY = 1.5; // Allows a "Good" (q=4) to potentially become q=2.5
// Penalty per millisecond over threshold. (e.g., 10s over = 10000 * 0.0001 = 1.0 penalty)
const TIME_PENALTY_FACTOR = 0.0001;

interface ReviewableItem {
  id: string;
  repetition?: number;
  interval?: number;
  easeFactor?: number;
  history?: Array<{ quality: number; date: number }>;
  nextReview?: Date;
  lastReview?: Date;
}

export function sm2Algorithm<T extends ReviewableItem>(
  answeredQuestion: T,
  feedback: 1 | 2 | 3 | 4,
  timeSpent: number
): Partial<T> {
  const now = new Date();

  // Early review check
  if (answeredQuestion.nextReview && now < new Date(answeredQuestion.nextReview)) {
    return {
      ...answeredQuestion,
      history: [
        ...(answeredQuestion.history || []),
        { quality: feedback, date: now.getTime() }
      ],
      lastReview: now,
      id: answeredQuestion.id,
    };
  }

  const {
    repetition: currentRepetition = 0,
    interval: currentInterval = 0,
    easeFactor: currentEaseFactor = 2.5,
    history: currentHistory = [],
  } = answeredQuestion;

  // 1. Convert user feedback (1-4) to SM-2 quality rating (q_initial: 0-5)
  let q_initial: number;
  switch (feedback) {
    case 1: q_initial = 0; break; // "Forgot completely"
    case 2: q_initial = 2; break; // "Recalled with difficulty"
    case 3: q_initial = 4; break; // "Recalled well" / "Good"
    case 4: q_initial = 5; break; // "Recalled easily" / "Perfect"
    default: q_initial = 0; // Should not happen
  }

  // 2. Adjust SM-2 quality (q) based on timeSpent for correct answers (initial q >= 3)
  let q = q_initial;
  if (q_initial >= 3 && timeSpent > TIME_THRESHOLD_MS_FOR_PENALTY) {
    const excessTime = timeSpent - TIME_THRESHOLD_MS_FOR_PENALTY;
    const penalty = Math.min(MAX_TIME_PENALTY, excessTime * TIME_PENALTY_FACTOR);
    q = Math.max(0, q_initial - penalty);
  }

  let newRepetition: number;
  let newInterval: number;
  let newEaseFactor = currentEaseFactor;

  // 3. Calculate new repetition, interval, and ease factor based on SM-2
  if (q < 3) {
    newRepetition = 0;
    newInterval = 0;
    newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
  } else {
    newRepetition = currentRepetition + 1;
    newEaseFactor = currentEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    if (newRepetition === 1) {
      newInterval = 1;
    } else if (newRepetition === 2) {
      newInterval = Math.round(1 * newEaseFactor);
      if (newInterval < 2) newInterval = 2;
    } else {
      const baseInterval = currentInterval > 0 ? currentInterval : 1;
      newInterval = Math.round(baseInterval * newEaseFactor);
    }
  }

  if (q >= 3 && newInterval < 1) {
    newInterval = 1;
  }

  // 4. Calculate next review date
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(now.getDate() + newInterval);
  nextReviewDate.setHours(0, 0, 0, 0);

  const updatedFields: Partial<T> = {
    ...answeredQuestion,
    history: [...currentHistory, {
      quality: feedback,
      date: now.getTime(),
    }],
    repetition: newRepetition,
    interval: newInterval,
    easeFactor: newEaseFactor,
    nextReview: nextReviewDate,
    lastReview: now,
    id: answeredQuestion.id,
  };

  return updatedFields;
}
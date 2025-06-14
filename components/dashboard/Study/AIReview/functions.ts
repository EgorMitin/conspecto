import { AiReviewDifficulty, AiReviewMode } from "@/types/AiReviewSession";
import { DIFFICULTY_TIME_FACTORS } from "./constants";
import { Note } from "@/types/Note";

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function calculateEstimatedTimeString(difficulty: AiReviewDifficulty, count: number): string {
  if (count === 0) return '~0 min';

  const factors = DIFFICULTY_TIME_FACTORS[difficulty];
  if (!factors) return '';

  let minTime = Math.round(factors.minPerQuestion * count);
  let maxTime = Math.round(factors.maxPerQuestion * count);

  if (minTime === 0 && count > 0) minTime = 1;
  if (maxTime < minTime) maxTime = minTime;

  if (minTime === maxTime) {
    return `~${minTime} min`;
  }
  return `~${minTime}-${maxTime} min`;
};

export function getRecommendedMode(note: Note | undefined): AiReviewMode {
  if (!note || !note.history || note.history.length === 0) {
    return 'separate_questions';
  }
  const reviewCount = note.history.length;
  const avgQuality =
    note.history.reduce((sum, item) => sum + item.quality, 0) / reviewCount;

  if (reviewCount >= 4 && avgQuality >= 4) {
    return 'mono_test';
  }
  return 'separate_questions';
}
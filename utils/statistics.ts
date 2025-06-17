import { SmallStatisticsData } from "@/components/dashboard/Statistics";
import { AppFolderType } from "@/lib/providers/app-state-provider";
import { AiReviewSession } from "@/types/AiReviewSession";
import { Note } from "@/types/Note";
import { Question } from "@/types/Question";

export interface TodayData {
  questionsDueToday: number;
  questionsDueTomorrow: number;
  nextAiReviewDate: Date;
  lastSessionScore?: number;
  lastSessionMaxScore: number;
}

export function getTodayNoteData(questions: Question[], aiReviews: AiReviewSession[], note: Note): TodayData {
  try {
    const { today, tomorrow, dayAfterTomorrow } = prepareThreeDates();

    const questionsDueToday = questions?.filter(question => {
      const reviewDate = new Date(question.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    }).length || 0;

    const questionsDueTomorrow = questions?.filter(question => {
      const reviewDate = new Date(question.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate >= tomorrow && reviewDate < dayAfterTomorrow;
    }).length || 0;

    let lastSessionScore: number | undefined;
    let nextAiReviewDate = note.nextReview;

    if (aiReviews && aiReviews.length > 0) {
      const sortedReviews = aiReviews.sort((a, b) => {
        const dateA = a.completedAt || a.requestedAt || new Date(0);
        const dateB = b.completedAt || b.requestedAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const lastReview = sortedReviews[0];
      if (lastReview.result && lastReview.result.totalQuestions > 0) {
        lastSessionScore = (lastReview.result.correctAnswers / lastReview.result.totalQuestions) * 10;
      }
    }

    return {
      questionsDueToday,
      questionsDueTomorrow,
      nextAiReviewDate,
      lastSessionScore,
      lastSessionMaxScore: 10
    };
  } catch (error) {
    console.error('Error fetching today data:', error);
    return {
      questionsDueToday: 0,
      questionsDueTomorrow: 0,
      nextAiReviewDate: new Date(),
      lastSessionMaxScore: 10
    };
  }
}

export function getTodayFolderData(questions: Question[], aiReviews: AiReviewSession[], folder: AppFolderType): TodayData {
  try {
    const { today, tomorrow, dayAfterTomorrow } = prepareThreeDates();

    const questionsDueToday = questions?.filter(question => {
      const reviewDate = new Date(question.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    }).length || 0;

    const questionsDueTomorrow = questions?.filter(question => {
      const reviewDate = new Date(question.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate >= tomorrow && reviewDate < dayAfterTomorrow;
    }).length || 0;

    let lastSessionScore: number | undefined;
    let nextAiReviewDate = folder.nextReview;

    if (aiReviews && aiReviews.length > 0) {
      const sortedReviews = aiReviews.sort((a, b) => {
        const dateA = a.completedAt || a.requestedAt || new Date(0);
        const dateB = b.completedAt || b.requestedAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const lastReview = sortedReviews[0];
      if (lastReview.result && lastReview.result.totalQuestions > 0) {
        lastSessionScore = (lastReview.result.correctAnswers / lastReview.result.totalQuestions) * 10;
      }
    }

    return {
      questionsDueToday,
      questionsDueTomorrow,
      nextAiReviewDate,
      lastSessionScore,
      lastSessionMaxScore: 10
    };
  } catch (error) {
    console.error('Error fetching today data:', error);
    return {
      questionsDueToday: 0,
      questionsDueTomorrow: 0,
      nextAiReviewDate: new Date(),
      lastSessionMaxScore: 10
    };
  }
}

export function getStatistics(questions: Question[], aiReviews: AiReviewSession[]): SmallStatisticsData {
  try {
    const questionStats = {
      howManyQuestions: questions?.length || 0,
      howManyReviewed: questions?.reduce((total, question) => total + (question.history.length || 0), 0) || 0,
      percentageAccuracy: calculateQuestionAccuracy(questions || []),
      history: calculateQuestionHistory(questions || []),
    };

    const aiReviewStats = {
      howManyReviews: aiReviews?.length || 0,
      averageScore: calculateAverageScore(aiReviews || []),
      percentageToMastery: calculateMasteryPercentage(aiReviews || []),
      history: calculateAiReviewHistory(aiReviews || []),
    };

    return {
      questions: questionStats,
      aiReview: aiReviewStats
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      questions: {
        howManyQuestions: 0,
        howManyReviewed: 0,
        percentageAccuracy: 0,
        history: [],
      },
      aiReview: {
        howManyReviews: 0,
        averageScore: 0,
        percentageToMastery: 0,
        history: [],
      }
    };
  }
}

// Helper functions for calculations


function prepareThreeDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  return { today, tomorrow, dayAfterTomorrow };
}

function calculateQuestionHistory(questions: Question[]): { date: string; count: number; accuracy: number }[] {
  const questionHistoryMap = new Map<string, { count: number, correct: number }>();

  questions.forEach(question => {
    if (question.history && question.history.length > 0) {
      question.history.forEach(entry => {
        // Format date to YYYY-MM-DD
        const reviewDate = new Date(entry.date);
        const dateKey = reviewDate.getFullYear() + '-' +
          String(reviewDate.getMonth() + 1).padStart(2, '0') + '-' +
          String(reviewDate.getDate()).padStart(2, '0');

        if (!questionHistoryMap.has(dateKey)) {
          questionHistoryMap.set(dateKey, { count: 0, correct: 0 });
        }

        const current = questionHistoryMap.get(dateKey)!;
        current.count += 1;
        if (entry.quality > 1) {
          current.correct += 1;
        }
      });
    }
  });

  const questionHistory = Array.from(questionHistoryMap.entries())
    .map(([date, stats]) => ({
      date,
      count: stats.count,
      accuracy: stats.count > 0 ? Math.round((stats.correct / stats.count) * 100) : 0
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return questionHistory;
}

function calculateAiReviewHistory(aiReviews: AiReviewSession[]): { date: string; score: number }[] {
  const aiReviewHistory = aiReviews
    .filter(review => review.result && review.result.totalQuestions > 0)
    .map(review => {
      const date = review.completedAt || review.requestedAt || new Date();
      const dateString = new Date(date).toISOString().split('T')[0];
      const score = review.result ?
        (review.result.correctAnswers / review.result.totalQuestions) * 10 : 0;

      return {
        date: dateString,
        score: Math.round(score * 10) / 10
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  return aiReviewHistory;
}

function calculateQuestionAccuracy(questions: Question[]): number {
  if (questions.length === 0 || !questions.some(q => q.history.length > 0)) return 0;

  const reviewedQuestions = questions.filter(q => q.history.length > 0);
  const totalCorrect = reviewedQuestions.reduce((sum, q) => sum + (q.history.reduce((total, hi) => total + (hi.quality > 1 ? 1 : 0), 0) || 0), 0);
  const totalAttempts = reviewedQuestions.reduce((sum, q) => sum + (q.history.length || 0), 0);

  return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
}

function calculateAverageScore(aiReviews: AiReviewSession[]): number {
  if (aiReviews.length === 0) return 0;

  const totalNormalizedScore = aiReviews.reduce((sum, review) => {
    let score = 0;
    if (review.result && review.result.totalQuestions > 0) {
      score = review.result.correctAnswers / review.result.totalQuestions;
    }
    return sum + score;
  }, 0);

  return (totalNormalizedScore / aiReviews.length) * 100;
}

function calculateMasteryPercentage(aiReviews: AiReviewSession[]): number {
  if (aiReviews.length === 0) return 0;

  const RECENT_REVIEWS_COUNT = 3; // number of recent reviews to consider for current mastery

  const allScores = aiReviews.map(review => {
    if (review.result && review.result.totalQuestions > 0) {
      return (review.result.correctAnswers / review.result.totalQuestions) * 100;
    }
    return 0;
  });

  let scoresToAverage: number[];

  if (allScores.length < RECENT_REVIEWS_COUNT) {
    scoresToAverage = allScores;
  } else {
    scoresToAverage = allScores.slice(-RECENT_REVIEWS_COUNT);
  }

  const sumOfScores = scoresToAverage.reduce((sum, score) => sum + score, 0);
  return sumOfScores / scoresToAverage.length;
}
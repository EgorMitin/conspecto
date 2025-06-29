import { AppFolderType } from '@/lib/providers/app-state-provider';

export interface DashboardStats {
  totalFolders: number;
  totalNotes: number;
  totalQuestions: number;
  totalAiReviews: number;
  questionsReviewedToday: number;
  questionsReviewedThisWeek: number;
  aiReviewsThisWeek: number;
  averageStudyScore: number;
  studyStreak: number;
  nextReviewDate: Date | null;
  masteryProgress: number;
  weeklyActivity: Array<{
    date: string;
    questionsReviewed: number;
    aiReviewsCompleted: number;
  }>;
  recentActivity: Array<{
    type: 'question' | 'ai-review' | 'note-created';
    title: string;
    date: Date;
    score?: number;
    sourceId?: string;
    folderId?: string;
  }>;
}

export function calculateStreak(folders: AppFolderType[]): number {
  try {
    const allNotes = folders.flatMap(folder => folder.notes);
    const allQuestions = allNotes.flatMap(note => note.questions || []);
    const allAiReviews = [
      ...allNotes.flatMap(note => note.aiReviews || []),
      ...folders.flatMap(folder => folder.aiReviews || [])
    ];

    let studyStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);

    while (true) {
      const hasQuestionActivity = allQuestions.some(question =>
        question.history.some((entry: any) => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === checkDate.getTime();
        })
      );

      const hasAiReviewActivity = allAiReviews.some(review => {
        const reviewDate = new Date(review.completedAt || review.requestedAt || new Date());
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === checkDate.getTime();
      });

      if (hasQuestionActivity || hasAiReviewActivity) {
        studyStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return studyStreak;
  } catch (error) {
    console.error('Error calculating study streak:', error);
    return 0;
  }
}

export function calculateDashboardStatistics(folders: AppFolderType[]): DashboardStats {
  try {
    // Get all notes and data
    const allNotes = folders.flatMap(folder => folder.notes);
    const allQuestions = allNotes.flatMap(note => note.questions || []);
    const allAiReviews = [
      ...allNotes.flatMap(note => note.aiReviews || []),
      ...folders.flatMap(folder => folder.aiReviews || [])
    ];

    // Calculate basic stats
    const totalFolders = folders.length;
    const totalNotes = allNotes.filter(note => note.status !== 'archived').length;
    const totalQuestions = allQuestions.length;
    const totalAiReviews = allAiReviews.length;

    // Calculate time-based stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    // Questions reviewed today
    const questionsReviewedToday = allQuestions.filter(question =>
      question.history.some((entry: any) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      })
    ).length;

    // Questions reviewed this week
    const questionsReviewedThisWeek = allQuestions.filter(question =>
      question.history.some((entry: any) => {
        const entryDate = new Date(entry.date);
        return entryDate >= oneWeekAgo;
      })
    ).length;

    // AI reviews this week
    const aiReviewsThisWeek = allAiReviews.filter(review => {
      const reviewDate = new Date(review.completedAt || review.requestedAt || new Date());
      return reviewDate >= oneWeekAgo;
    }).length;

    // Calculate average study score
    const completedAiReviews = allAiReviews.filter(review => 
      review.result && review.result.totalQuestions > 0
    );
    
    let averageStudyScore = 0;
    if (completedAiReviews.length > 0) {
      const totalScore = completedAiReviews.reduce((sum, review) => {
        if (review.result) {
          return sum + (review.result.correctAnswers / review.result.totalQuestions) * 100;
        }
        return sum;
      }, 0);
      averageStudyScore = totalScore / completedAiReviews.length;
    }

    // Calculate study streak (consecutive days with activity)
    let studyStreak = 0;
    const checkDate = new Date(today);
    
    while (true) {
      const hasActivity = allQuestions.some(question =>
        question.history.some((entry: any) => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === checkDate.getTime();
        })
      ) || allAiReviews.some(review => {
        const reviewDate = new Date(review.completedAt || review.requestedAt || new Date());
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === checkDate.getTime();
      });

      if (hasActivity) {
        studyStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Check notes with nextReview dates
    const dueNotes = allNotes.filter(note => {
      if (!note.nextReview) return false;
      const nextReview = new Date(note.nextReview);
      return nextReview <= today;
    });

    const upcomingNotes = allNotes.filter(note => {
      if (!note.nextReview) return false;
      const nextReview = new Date(note.nextReview);
      return nextReview > today;
    });

    // Check folders with nextReview dates
    const dueFolders = folders.filter(folder => {
      if (!folder.nextReview) return false;
      const nextReview = new Date(folder.nextReview);
      return nextReview <= today;
    });

    const upcomingFolders = folders.filter(folder => {
      if (!folder.nextReview) return false;
      const nextReview = new Date(folder.nextReview);
      return nextReview > today;
    });

    // If there are any items due today/overdue, next review is today
    // Otherwise, find the earliest upcoming review date
    const hasDueItems = dueNotes.length > 0 || dueFolders.length > 0;
    
    let nextReviewDate: Date | null = null;

    if (hasDueItems) {
      nextReviewDate = today;
    } else {
      const allUpcomingDates: Date[] = [];

      upcomingNotes.forEach(n => {
        if (n.nextReview) allUpcomingDates.push(new Date(n.nextReview));
      });

      upcomingFolders.forEach(f => {
        if (f.nextReview) allUpcomingDates.push(new Date(f.nextReview));
      });

      if (allUpcomingDates.length > 0) {
        nextReviewDate = allUpcomingDates.reduce((earliest, date) =>
          date < earliest ? date : earliest
        );
      }
    }

    // Calculate mastery progress
    let masteryProgress = 0;
    if (completedAiReviews.length > 0) {
      const recentReviews = completedAiReviews
        .sort((a, b) => {
          const dateA = new Date(a.completedAt || a.requestedAt || new Date());
          const dateB = new Date(b.completedAt || b.requestedAt || new Date());
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);
      
      const totalScore = recentReviews.reduce((sum, review) => {
        if (review.result) {
          return sum + (review.result.correctAnswers / review.result.totalQuestions) * 100;
        }
        return sum;
      }, 0);
      
      masteryProgress = totalScore / recentReviews.length;
    }

    // Generate weekly activity
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const questionsReviewed = allQuestions.filter(question =>
        question.history.some((entry: any) => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === date.getTime();
        })
      ).length;

      const aiReviewsCompleted = allAiReviews.filter(review => {
        const dateToUse = review.completedAt || review.requestedAt;
        if (!dateToUse) return false;
        const reviewDate = new Date(dateToUse);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === date.getTime();
      }).length;

      weeklyActivity.push({
        date: date.toISOString().split('T')[0],
        questionsReviewed,
        aiReviewsCompleted
      });
    }

    // Generate recent activity with noteId and folderId
    const recentActivity: Array<{
      type: 'question' | 'ai-review' | 'note-created';
      title: string;
      date: Date;
      score?: number;
      sourceId?: string;
      folderId?: string;
    }> = [];
    
    // Recent AI reviews
    const recentAiReviews = allAiReviews
      .filter(review => review.completedAt)
      .sort((a, b) => {
        const dateA = new Date(a.completedAt!);
        const dateB = new Date(b.completedAt!);
        return dateB.getTime() - dateA.getTime();
      });

    recentAiReviews.forEach(review => {
      if (review.result) {
        if (review.sourceType === 'note') {
          const note = allNotes.find(n => n.id === review.sourceId);
          const folder = folders.find(f => f.notes.some(n => n.id === review.sourceId));
          if (note && folder) {
            recentActivity.push({
              type: 'ai-review' as const,
              title: `AI Review: ${note.title}`,
              date: new Date(review.completedAt!),
              score: Math.round((review.result.correctAnswers / review.result.totalQuestions) * 100),
              sourceId: note.id,
              folderId: folder.id
            });
          }
        } else if (review.sourceType === 'folder') {
          const folder = folders.find(f => f.id === review.sourceId);
          if (folder) {
            recentActivity.push({
              type: 'ai-review' as const,
              title: `AI Review: ${folder.name}`,
              date: new Date(review.completedAt!),
              score: Math.round((review.result.correctAnswers / review.result.totalQuestions) * 100),
              sourceId: folder.id,
              folderId: folder.id
            });
          }
        }
      }
    });

    // Recent question reviews
    const recentQuestionReviews = allQuestions
      .filter(question => question.history.length > 0)
      .sort((a, b) => {
        const lastA = a.history[a.history.length - 1];
        const lastB = b.history[b.history.length - 1];
        return new Date(lastB.date).getTime() - new Date(lastA.date).getTime();
      })
      .slice(0, 2);

    recentQuestionReviews.forEach(question => {
      const note = allNotes.find(n => n.questions.some((q: any) => q.id === question.id));
      const folder = folders.find(f => f.notes.some(n => n.questions.some((q: any) => q.id === question.id)));
      if (note && folder) {
        const lastReview = question.history[question.history.length - 1];
        recentActivity.push({
          type: 'question' as const,
          title: `Question Review: ${note.title}`,
          date: new Date(lastReview.date),
          score: lastReview.quality > 1 ? 100 : 0,
          sourceId: note.id,
          folderId: folder.id
        });
      }
    });

    // Recent notes created
    const recentNotes = allNotes
      .filter(note => note.status !== 'archived')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);

    recentNotes.forEach(note => {
      const folder = folders.find(f => f.notes.some(n => n.id === note.id));
      if (folder) {
        recentActivity.push({
          type: 'note-created' as const,
          title: `Created: ${note.title}`,
          date: new Date(note.createdAt),
          sourceId: note.id,
          folderId: folder.id
        });
      }
    });

    // Sort all recent activity by date
    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      totalFolders,
      totalNotes,
      totalQuestions,
      totalAiReviews,
      questionsReviewedToday,
      questionsReviewedThisWeek,
      aiReviewsThisWeek,
      averageStudyScore: Math.round(averageStudyScore * 10) / 10,
      studyStreak,
      nextReviewDate,
      masteryProgress: Math.round(masteryProgress * 10) / 10,
      weeklyActivity,
      recentActivity: recentActivity.slice(0, 50)
    };

  } catch (error) {
    console.error('Error calculating dashboard statistics:', error);
    return {
      totalFolders: 0,
      totalNotes: 0,
      totalQuestions: 0,
      totalAiReviews: 0,
      questionsReviewedToday: 0,
      questionsReviewedThisWeek: 0,
      aiReviewsThisWeek: 0,
      averageStudyScore: 0,
      studyStreak: 0,
      nextReviewDate: null,
      masteryProgress: 0,
      weeklyActivity: [],
      recentActivity: []
    };
  }
}

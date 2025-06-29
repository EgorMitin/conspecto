'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  PlayCircle,
  Clock,
  Plus,
  FolderPlus,
  FileQuestion,
  Sparkles
} from "lucide-react";
import { DashboardStats } from "@/utils/dashboard-statistics";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppState } from "@/lib/providers/app-state-provider";
import { useUser } from "@/lib/context/UserContext";
import CustomDialogTrigger from "@/components/CustomDialogTrigger";
import FolderCreator from "@/components/dashboard/FolderCreator";

interface QuickActionsProps {
  stats: DashboardStats;
}

export default function QuickActions({ stats }: QuickActionsProps) {
  const router = useRouter();
  const { state } = useAppState();
  const { user } = useUser();
  const todayReviews = stats.questionsReviewedToday;
  const hasUpcomingReviews = stats.nextReviewDate !== null;

  const isNextReviewToday = stats.nextReviewDate &&
    new Date(stats.nextReviewDate).toDateString() === new Date().toDateString();

  const findFirstUnfinishedReview = () => {
    const unfinishedReviews: Array<{
      review: any;
      sourceType: 'note' | 'folder';
      sourceTitle: string;
      folderId: string;
      noteId?: string;
    }> = [];

    state.folders.forEach(folder => {
      if (folder.aiReviews) {
        folder.aiReviews
          .filter(review => review.status !== 'completed' && review.status !== 'failed')
          .forEach(review => {
            unfinishedReviews.push({
              review,
              sourceType: 'folder',
              sourceTitle: folder.name,
              folderId: folder.id,
            });
          });
      }

      folder.notes.forEach(note => {
        if (note.aiReviews) {
          note.aiReviews
            .filter(review => review.status !== 'completed' && review.status !== 'failed')
            .forEach(review => {
              unfinishedReviews.push({
                review,
                sourceType: 'note',
                sourceTitle: note.title,
                folderId: folder.id,
                noteId: note.id,
              });
            });
        }
      });
    });

    unfinishedReviews.sort((a, b) => {
      const dateA = new Date(a.review.requestedAt || 0);
      const dateB = new Date(b.review.requestedAt || 0);
      return dateA.getTime() - dateB.getTime();
    });

    return unfinishedReviews[0] || null;
  };

  const handleStartStudying = () => {
    const firstUnfinishedReview = findFirstUnfinishedReview();

    if (firstUnfinishedReview) {
      const baseUrl = `/dashboard/${firstUnfinishedReview.folderId}`;
      const noteSegment = firstUnfinishedReview.noteId ? `/${firstUnfinishedReview.noteId}` : '';
      const sessionUrl = `${baseUrl}${noteSegment}/study/ai-review/session?sessionId=${firstUnfinishedReview.review.id}`;
      router.push(sessionUrl);
    } else {
      toast.info("No unfinished AI reviews found. Create some notes and start a review session!");
    }
  };

  const handleAISummary = () => {
    router.push(`/dashboard/user-summary`);
  };

  const handleReviewQuestions = () => {
    router.push('/dashboard/review');
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Jump into your study session or explore your content
          </p>
        </div>
        <div className="flex items-center gap-2">
          {todayReviews > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {todayReviews} reviewed today
            </Badge>
          )}
          {isNextReviewToday && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              <Clock className="h-3 w-3 mr-1" />
              Reviews due today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <Card
            className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group border-dashed border-2 border-primary/20 hover:border-primary/40"
            onClick={handleStartStudying}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Start Studying</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {findFirstUnfinishedReview() ? 'Continue unfinished AI review' : 'Begin your learning journey'}
                  </p>
                </div>
                <div className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-center transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  {findFirstUnfinishedReview() ? 'Continue Review' : 'Study Mode'}
                </div>
              </div>
            </CardContent>
          </Card>

          <CustomDialogTrigger
            header="Create A Folder"
            content={user ? <FolderCreator user={user} /> : <div>Loading...</div>}
            description="Create a new folder to organize your knowledge."
          >
            <Card
              className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                    <FolderPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">New Folder</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create and organize knowledge
                    </p>
                  </div>
                  <div className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-center transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    Create Folder
                  </div>
                </div>
              </CardContent>
            </Card>
          </CustomDialogTrigger>

          <Card
            className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleAISummary}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Summary</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Summarize all your notes with AI
                  </p>
                </div>
                <div className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-center transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  Generate Summary
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleReviewQuestions}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                  <FileQuestion className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Review All Notes</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Practice questions from all your notes
                  </p>
                </div>
                <div className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-medium text-center transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  Start Review
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {(todayReviews > 0 || stats.studyStreak > 0) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-medium text-sm">Today's Focus</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {todayReviews > 0
                      ? `Great job! You've reviewed ${todayReviews} questions today.`
                      : `Keep your ${stats.studyStreak}-day streak going!`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stats.studyStreak > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                    🔥 {stats.studyStreak} day streak
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

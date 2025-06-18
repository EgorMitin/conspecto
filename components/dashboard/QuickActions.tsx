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
  Plus
} from "lucide-react";
import { DashboardStats } from "@/utils/dashboard-statistics";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QuickActionsProps {
  stats: DashboardStats;
}

export default function QuickActions({ stats }: QuickActionsProps) {
  const router = useRouter();
  const todayReviews = stats.questionsReviewedToday;
  const hasUpcomingReviews = stats.nextReviewDate !== null;
  
  const isNextReviewToday = stats.nextReviewDate && 
    new Date(stats.nextReviewDate).toDateString() === new Date().toDateString();

  // Navigation handlers
  const handleStartStudying = () => {
    toast.info("Quick actions are not yet implemented. Stay tuned!");
  };

  const handleCreateNote = () => {
    toast.info("Quick actions are not yet implemented. Stay tuned!");
  };

  const handleAIReview = () => {
    toast.info("Quick actions are not yet implemented. Stay tuned!");
  };

  const handleViewProgress = () => {
    document.getElementById('dashboard-stats')?.scrollIntoView({ behavior: 'smooth' });
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
                    {hasUpcomingReviews ? 'Continue your reviews' : 'Begin your learning journey'}
                  </p>
                </div>
                <Button size="sm" className="w-full">
                  {isNextReviewToday ? 'Review Now' : 'Study Mode'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleCreateNote}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">New Note</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create and organize knowledge
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Create Note
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleAIReview}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Review</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Test your knowledge with AI
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Start Review
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="relative overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={handleViewProgress}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">View Progress</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track your learning journey
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Stats
                </Button>
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

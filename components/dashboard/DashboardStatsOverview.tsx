import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Brain,
  FolderOpen,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  Flame,
  Clock,
  Award
} from "lucide-react";
import { DashboardStats } from "@/utils/dashboard-statistics";

interface DashboardStatsOverviewProps {
  stats: DashboardStats;
}

export default function DashboardStatsOverview({ stats }: DashboardStatsOverviewProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'No upcoming reviews';
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
    if (streak >= 3) return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    if (streak >= 1) return "text-green-600 bg-green-100 dark:bg-green-900/20";
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  };

  const getMasteryColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Library</CardTitle>
          <FolderOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.totalFolders}</span>
              <span className="text-sm text-muted-foreground">Folders</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.totalNotes}</span>
              <span className="text-sm text-muted-foreground">Notes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-purple-600">{stats.totalQuestions}</span>
              <span className="text-xs text-muted-foreground">Questions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
          <Brain className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Mastery</span>
                <span className={`text-sm font-medium ${getMasteryColor(stats.masteryProgress)}`}>
                  {stats.masteryProgress}%
                </span>
              </div>
              <Progress value={stats.masteryProgress} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Score</span>
              <span className="text-lg font-bold">{stats.averageStudyScore}/100</span>
            </div>
            <Badge variant="secondary" className="w-full justify-center">
              {stats.totalAiReviews} AI Reviews Completed
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{stats.studyStreak}</div>
              <div className="text-sm text-muted-foreground">
                {stats.studyStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`w-full justify-center ${getStreakColor(stats.studyStreak)}`}
            >
              {stats.studyStreak >= 7 ? '🔥 On Fire!' :
               stats.studyStreak >= 3 ? '⚡ Great momentum!' :
               stats.studyStreak >= 1 ? '💪 Keep going!' :
               '🌱 Start today!'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Questions</span>
              <span className="text-lg font-bold">{stats.questionsReviewedThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Reviews</span>
              <span className="text-lg font-bold">{stats.aiReviewsThisWeek}</span>
            </div>
            <div className="text-center pt-1">
              <div className="text-xs text-muted-foreground">Next Review</div>
              <div className="text-sm font-medium">
                {formatDate(stats.nextReviewDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

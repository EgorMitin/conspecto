import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Calendar,
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
  console.log(stats.nextReviewDate)

  const getMasteryColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="grid grid-cols-2 gap-6">
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

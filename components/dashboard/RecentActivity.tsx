import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BookOpen,
  Brain,
  FileText,
  Clock
} from "lucide-react";
import { DashboardStats } from "@/utils/dashboard-statistics";

interface RecentActivityProps {
  stats: DashboardStats;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'ai-review':
      return <Brain className="h-4 w-4 text-purple-500" />;
    case 'question':
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    case 'note-created':
      return <FileText className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'ai-review':
      return "border-l-purple-500 bg-purple-50 dark:bg-purple-900/10";
    case 'question':
      return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10";
    case 'note-created':
      return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
    default:
      return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 0) {
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const getScoreBadge = (score?: number) => {
  if (score === undefined) return null;

  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  let className = "";

  if (score >= 90) {
    variant = "default";
    className = "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  } else if (score >= 70) {
    variant = "secondary";
    className = "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
  } else if (score >= 50) {
    variant = "outline";
    className = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  } else {
    variant = "destructive";
    className = "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
  }

  return (
    <Badge variant={variant} className={`ml-auto ${className}`}>
      {score}%
    </Badge>
  );
};


export default function RecentActivity({ stats }: RecentActivityProps) {
  return (
    <Card className="max-h-92 @[700px]:max-h-[700px] flex flex-col gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Recent Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your latest study sessions and progress
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto mb-0 pb-0">
        <div className="space-y-3">
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start studying to see your activity here
              </p>
            </div>
          ) : (
            stats.recentActivity.map((activity: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} transition-colors hover:bg-opacity-70`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.date)}
                        </p>
                        {activity.type === 'ai-review' && (
                          <Badge variant="outline" className="text-xs">
                            AI Review
                          </Badge>
                        )}
                        {activity.type === 'question' && (
                          <Badge variant="outline" className="text-xs">
                            Question
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {getScoreBadge(activity.score)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        {stats.recentActivity.length > 0 && (
          <div className="border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Keep up the great work! 🎉</span>
              <Badge variant="outline" className="text-xs">
                {stats.recentActivity.length} recent
              </Badge>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

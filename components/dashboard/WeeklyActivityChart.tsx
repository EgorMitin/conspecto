import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { DashboardStats } from "@/utils/dashboard-statistics";
import { Calendar, TrendingUp } from "lucide-react";

interface WeeklyActivityChartProps {
  stats: DashboardStats;
}

export default function WeeklyActivityChart({ stats }: WeeklyActivityChartProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const totalActivities = stats.weeklyActivity.reduce((sum: number, day: any) => 
    sum + day.questionsReviewed + day.aiReviewsCompleted, 0
  );

  const chartData = stats.weeklyActivity.map((day: any) => ({
    ...day,
    dateFormatted: formatDate(day.date),
    total: day.questionsReviewed + day.aiReviewsCompleted
  }));

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Weekly Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Your study activity over the last 7 days
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {totalActivities} total activities
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="dateFormatted" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'questionsReviewed' ? 'Questions Reviewed' : 'AI Reviews'
                ]}
                labelFormatter={(label) => `Day: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="questionsReviewed" 
                name="questionsReviewed"
                fill="#3b82f6" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="aiReviewsCompleted" 
                name="aiReviewsCompleted"
                fill="#8b5cf6" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">Questions Reviewed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm text-muted-foreground">AI Reviews</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

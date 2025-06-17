import { Brain, Target } from "lucide-react";
import StatisticsCard from "./StatisticsCard";
import MetricDisplay from "./MetricDisplay";
import ProgressMetric from "./ProgressMetric";
import TimeSeriesChart from "./TimeSeriesChart";

interface AIReviewData {
  howManyReviews: number;
  averageScore: number;
  percentageToMastery: number;
  history: Array<{
    date: string;
    score: number;
  }>;
}

interface AIReviewStatisticsProps {
  data: AIReviewData;
  generate10DayData: (history: Array<{ date: string; [key: string]: string | number }>, dataKey: string, defaultValue?: number) => Array<{ date: string; [key: string]: string | number }>;
}

export default function AIReviewStatistics({ data, generate10DayData }: AIReviewStatisticsProps) {
  const getFooterMessage = () => {
    if (data.percentageToMastery >= 80) return "Near mastery!";
    if (data.percentageToMastery >= 50) return "Making progress";
    return "Early stages";
  };

  const footer = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Target className="h-3 w-3" />
      {getFooterMessage()}
    </div>
  );

  return (
    <StatisticsCard
      title="AI Review"
      icon={Brain}
      iconColor="text-purple-500"
      badgeText={`${data.howManyReviews} sessions`}
      footer={footer}
    >
      <div className="space-y-3">
        <MetricDisplay
          label="Avg Score"
          value={`${Math.round(data.averageScore * 10) / 10}/10`}
        />

        <ProgressMetric
          label="Mastery Progress"
          value={data.percentageToMastery}
        />

        <TimeSeriesChart
          data={generate10DayData(data.history, 'score', 0)}
          dataKey="score"
          title="AI Review Scores Over Time"
          yAxisLabel="Score (0-10)"
          yAxisDomain={[0, 10]}
          emptyStateIcon={Brain}
          emptyStateTitle="No AI review data yet"
          emptyStateDescription="Complete AI review sessions to track your scores"
          formatTooltip={(value) => [value === 0 ? 'No review' : value, 'AI Score']}
        />
      </div>
    </StatisticsCard>
  );
}

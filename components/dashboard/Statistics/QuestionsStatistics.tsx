import { BookOpen, TrendingUp } from "lucide-react";
import StatisticsCard from "./StatisticsCard";
import MetricDisplay from "./MetricDisplay";
import ProgressMetric from "./ProgressMetric";
import TimeSeriesChart from "./TimeSeriesChart";

interface QuestionsData {
  howManyQuestions: number;
  howManyReviewed: number;
  percentageAccuracy: number;
  history: Array<{
    date: string;
    count: number;
  }>;
}

interface QuestionsStatisticsProps {
  data: QuestionsData;
  generate10DayData: (history: Array<{ date: string; [key: string]: string | number }>, dataKey: string, defaultValue?: number) => Array<{ date: string; [key: string]: string | number }>;
}

export default function QuestionsStatistics({ data, generate10DayData }: QuestionsStatisticsProps) {
  const getFooterMessage = () => {
    if (data.percentageAccuracy >= 80) return "Excellent performance!";
    if (data.percentageAccuracy >= 60) return "Good progress";
    return "Keep practicing";
  };

  const footer = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <TrendingUp className="h-3 w-3" />
      {getFooterMessage()}
    </div>
  );

  return (
    <StatisticsCard
      title="Questions"
      icon={BookOpen}
      iconColor="text-blue-500"
      badgeText={`${data.howManyQuestions} total`}
      footer={footer}
    >
      <div className="space-y-3">
        <MetricDisplay
          label="Reviews"
          value={data.howManyReviewed}
        />

        <ProgressMetric
          label="Accuracy"
          value={data.percentageAccuracy}
        />

        <TimeSeriesChart
          data={generate10DayData(data.history, 'count', 0)}
          dataKey="count"
          title="Questions Reviewed Over Time"
          yAxisLabel="Questions Count"
          emptyStateIcon={BookOpen}
          emptyStateTitle="No question data yet"
          emptyStateDescription="Start reviewing questions to see your progress"
          formatTooltip={(value) => [value, 'Questions']}
        />
      </div>
    </StatisticsCard>
  );
}

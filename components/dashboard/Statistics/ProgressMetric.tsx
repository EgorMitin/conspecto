import { Progress } from "@/components/ui/progress";
import MetricDisplay from "./MetricDisplay";

interface ProgressMetricProps {
  label: string;
  value: number;
  maxValue?: number;
  suffix?: string;
  className?: string;
}

export default function ProgressMetric({ 
  label, 
  value, 
  maxValue = 100, 
  suffix = "%", 
  className = "" 
}: ProgressMetricProps) {
  const displayValue = maxValue === 100 ? Math.round(value) : value;
  const progressValue = maxValue === 100 ? value : (value / maxValue) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <MetricDisplay 
        label={label} 
        value={`${displayValue}${suffix}`} 
      />
      <Progress
        value={progressValue}
        className="h-2"
      />
    </div>
  );
}

interface MetricDisplayProps {
  label: string;
  value: string | number;
  className?: string;
}

export default function MetricDisplay({ label, value, className = "" }: MetricDisplayProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

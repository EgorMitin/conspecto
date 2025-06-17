import { Card, CardContent } from "@/components/ui/card";

type ScoreCardProps = {
  title: string;
  value: number;
  total?: number;
  icon: React.ElementType;
  color: string;
};

export default function ScoreCard({ title, value, total, icon: Icon, color }: ScoreCardProps) {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  
  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}{total && <span className="text-lg text-gray-500 dark:text-gray-400">/{total}</span>}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{title}</p>
            {total && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage}% of total</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
};
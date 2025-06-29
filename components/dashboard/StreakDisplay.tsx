import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20 border-orange-200";
    if (streak >= 3) return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200";
    if (streak >= 1) return "text-green-600 bg-green-100 dark:bg-green-900/20 border-green-200";
    return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-200";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⚡';
    if (streak >= 1) return '💪';
    return '🌱';
  };

  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center my-1.5 gap-1.5 px-3 py-1.5 ${getStreakColor(streak)}`}
    >
      <Flame className="h-3.5 w-3.5" />
      <span className="font-medium">{streak}</span>
      <span className="text-xs opacity-80">
        {streak === 1 ? 'day' : 'days'}
      </span>
      <span className="text-sm">{getStreakEmoji(streak)}</span>
    </Badge>
  );
}
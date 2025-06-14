import { Card, CardContent } from "@/components/ui/card";

type ScoreCardProps = {
  title: string;
  value: number;
  total?: number;
  icon: React.ElementType;
  color: string;
};

export default function ScoreCard({ title, value, total, icon: Icon, color }: ScoreCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">
              {value}{total && `/${total}`}
            </h3>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
};
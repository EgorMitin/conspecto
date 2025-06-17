import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  badgeText: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function StatisticsCard({ 
  title, 
  icon: Icon, 
  iconColor, 
  badgeText, 
  children, 
  footer 
}: StatisticsCardProps) {
  return (
    <Card className="relative overflow-hidden gap-0 p-2 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {title}
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {badgeText}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1">
        {children}
      </CardContent>
      {footer && (
        <CardFooter>
          <div className="pt-2 border-t w-full">
            {footer}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

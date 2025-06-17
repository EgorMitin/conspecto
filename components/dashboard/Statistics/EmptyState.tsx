import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs rounded ${className}`}>
      <div className="text-center">
        <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/70">{description}</p>
      </div>
    </div>
  );
}

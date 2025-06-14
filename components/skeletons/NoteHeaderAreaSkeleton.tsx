import { Skeleton } from "@/components/ui/skeleton";

export default function NoteHeaderAreaSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full px-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-1/4" />
    </div>
  );
}

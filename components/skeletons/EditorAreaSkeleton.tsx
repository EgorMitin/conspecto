import { Skeleton } from "@/components/ui/skeleton";

export default function EditorAreaSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <Skeleton className="h-10 w-3/4 mb-4" />
      <Skeleton className="h-96 w-full max-w-3xl mb-4" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  );
}

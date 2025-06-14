import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarSkeleton() {
  return (
    <aside className="hidden sm:flex sm:flex-col p-4 md:gap-4 h-full w-64">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-8 w-44 mb-2" />
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    </aside>
  );
}

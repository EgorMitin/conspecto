import SidebarSkeleton from "@/components/skeletons/SidebarSkeleton";
import FolderContentSkeleton from "@/components/skeletons/FolderContentSkeleton";
import FolderHeaderSkeleton from "@/components/skeletons/FolderHeaderSkeleton";

export default function Loading() {
  return (
    <main className="flex h-screen w-full min-w-0">
      <SidebarSkeleton />
      <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
        <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
          <div className="flex flex-col gap-4 w-full px-2">
            <FolderHeaderSkeleton />
          </div>
        </header>
        <FolderContentSkeleton />
      </div>
    </main>
  );
}
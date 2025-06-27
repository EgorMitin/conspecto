'use client';

import FolderPageContent from "@/components/dashboard/FolderPageContent";
import { useUser } from "@/lib/context/UserContext";
import { useAppState } from "@/lib/providers/app-state-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FolderHeader from "@/components/dashboard/FolderPageContent/FolderHeader";
import { Loader2 } from "lucide-react";


export default function FolderPage() {
  const { user } = useUser();
  const router = useRouter();
  const { state, folderId, isLoading } = useAppState();

  useEffect(() => {
    if (!user) {
      toast.error("No user found, redirecting to landing page");
      router.push('/');
    }
  }, [user, router]);

  const currentFolder = state.folders.find(f => f.id === folderId);

  useEffect(() => {
    if (user && !currentFolder && !isLoading) {
      toast.error("Folder not found");
      router.push('/dashboard');
    }
  }, [user, currentFolder, router, isLoading, folderId]);

  if (!user || !currentFolder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your folder...</p>
        </div>
      </div>
    );
  }

  const notes = currentFolder.notes;
  const folderName = currentFolder.name;

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 px-4 pt-4 w-full">
        <div className="w-full px-2">
          <FolderHeader folder={currentFolder} />
        </div>
      </header>

      <FolderPageContent
        notes={notes}
        user={user}
      />
    </div>
  );
}
'use client';

import ReviewSession from "@/components/dashboard/Study/ReviewSession";
import { useAppState } from "@/lib/providers/app-state-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ReviewPage() {
  const { isLoading, state, folderId } = useAppState()
  const router = useRouter()
  const currentFolder = state.folders.find(f => f.id === folderId);

  useEffect(() => {
    if (!currentFolder && !isLoading) {
      toast.error("Folder not found");
      router.push('/dashboard');
    }
  }, [currentFolder, router, isLoading]);

  if (!currentFolder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your review page...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-auto">
      <ReviewSession sourceType="folder" sourceId={folderId!} mode="due" />
    </main>
  );
}
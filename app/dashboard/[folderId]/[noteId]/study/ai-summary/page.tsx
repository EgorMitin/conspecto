'use client';

import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import AISummaryContent from "@/components/dashboard/Study/AISummary/AISummaryContent";
import { useAppState } from "@/lib/providers/app-state-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";


export default function AISummaryPage() {
  const { isLoading, currentNote, folderId, state } = useAppState()
  const router = useRouter()

  useEffect(() => {
    if (!currentNote && !isLoading) {
      toast.error("Note not found");
      router.push('/dashboard');
    }
  }, [currentNote, router, isLoading]);

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your note data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <NoteHeader note={currentNote} />
        </div>
      </header>

      <AISummaryContent noteId={currentNote.id} />
    </div>
  );
}
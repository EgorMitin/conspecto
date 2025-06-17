'use client';

import Breadcrumbs from "@/components/dashboard/Breadcrumbs";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import AISummaryContent from "@/components/dashboard/Study/AISummary/AISummaryContent";
import { useAppState } from "@/lib/providers/app-state-provider";
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
    return ("LOADING...");
  }

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <Breadcrumbs
            folderName={state.folders.find(f => f.id === folderId)?.name}
            folderId={folderId}
            noteTitle={currentNote.title}
            noteId={currentNote.id}
            page="aiSummary"
          />
          <NoteHeader note={currentNote} />
        </div>
      </header>

      <AISummaryContent noteId={currentNote.id} />
    </div>
  );
}
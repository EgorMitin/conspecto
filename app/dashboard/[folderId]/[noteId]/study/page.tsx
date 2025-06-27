'use client';

import { useRouter } from "next/navigation";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import NoteStatistics from "@/components/dashboard/Statistics";
import TodaySection from "@/components/dashboard/Study/TodaySection";
import StudyTools from "@/components/dashboard/Study/StudyTools";
import { useUser } from "@/lib/context/UserContext";
import { useAppState } from "@/lib/providers/app-state-provider";
import { useEffect } from "react";
import { toast } from "sonner";
import { getStatistics, getTodayNoteData } from "@/utils/statistics";


export default function StudyPage() {
  const user = useUser();
  const router = useRouter();
  const { state, folderId, isLoading, noteId, currentNote } = useAppState();

  useEffect(() => {
    if (!user) {
      toast.error("No user found, redirecting to landing page");
      router.push('/');
    }
  }, [user, router]);

  const currentFolder = state.folders.find(f => f.id === folderId);

  useEffect(() => {
    if (user && !currentNote && !isLoading) {
      toast.error("Note not found");
      router.push('/dashboard');
    }
  }, [user, currentNote, router, isLoading, folderId, currentFolder]);

  if (!user || !currentNote || !currentFolder) {
    return ("LOADING...");
  }

  const folderName = currentFolder.name;
  const { questions, aiReviews } = currentNote;
  const statisticsData = getStatistics(questions, aiReviews);

  const todayData = getTodayNoteData(questions, aiReviews, currentNote)

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <NoteHeader note={currentNote} />
          <NoteStatistics statisticsData={statisticsData} />
        </div>
      </header>
      <TodaySection {...todayData} />

      <StudyTools
        noteId={currentNote.id}
        folderId={currentNote.folderId}
        totalQuestions={statisticsData.questions.howManyQuestions}
      />
    </div>
  );
}
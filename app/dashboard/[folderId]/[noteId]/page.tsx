'use client';

import Editor from "./Editor";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import { StudyProgress } from "@/components/dashboard/NotePage/StudyProgress";
import BannerUpload from "@/components/dashboard/NotePage/BannerUpload";
import { useUser } from "@/lib/context/UserContext";
import { useAppState } from "@/lib/providers/app-state-provider";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStatistics } from "@/utils/statistics";


export default function NotePage() {
  const { user } = useUser();
  const router = useRouter();
  const { state, folderId, currentNote } = useAppState();

  useEffect(() => {
    if (!user) {
      toast.error("No user found, redirecting to landing page");
      router.push('/');
    }
  }, [user, router]);

  const currentFolder = state.folders.find(f => f.id === folderId);

  if (!user || !currentNote || !currentFolder) {
    return ("LOADING...");
  }

  const { questions, aiReviews } = currentNote;
  const statisticsData = getStatistics(questions, aiReviews);

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <BannerUpload />
          <NoteHeader note={currentNote} />
          {currentNote.status === 'active' && (
            <StudyProgress
              questions={currentNote.questions.length}
              reviewed={statisticsData.questions.howManyReviewed}
              nextReview={currentNote.nextReview}
            />
          )}
        </div>
      </header>
      <Editor note={currentNote} />
    </div>
  );
}
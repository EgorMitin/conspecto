'use client';

import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import Statistics from "@/components/dashboard/Statistics";
import TodaySection from "@/components/dashboard/Study/TodaySection";
import StudyTools from "@/components/dashboard/Study/StudyTools";
import { useUser } from "@/lib/context/UserContext";
import { useAppState } from "@/lib/providers/app-state-provider";
import { useEffect } from "react";
import { toast } from "sonner";
import { Question } from "@/types/Question";
import { getStatistics, getTodayFolderData } from "@/utils/statistics";
import FolderHeader from "@/components/dashboard/FolderPageContent/FolderHeader";


export default function StudyPage() {
  const user = useUser();
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
  }, [user, router, isLoading, folderId, currentFolder]);

  if (!user || !currentFolder) {
    return ("LOADING...");
  }

  const folderName = currentFolder.name;
  const questions = currentFolder.notes.reduce(
    (acc: Question[], note) => {
      acc.push(...note.questions);
      return acc;
    }, []);
  const aiReviews = currentFolder.aiReviews
  const statisticsData = getStatistics(questions, aiReviews);

  const todayData = getTodayFolderData(questions, aiReviews, currentFolder)

  return (
    <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
      <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
        <div className="flex flex-col gap-4 w-full px-2">
          <Breadcrumbs folderName={folderName} folderId={folderId} page="study" />
          <FolderHeader folder={currentFolder} />
          <Statistics statisticsData={statisticsData} />
        </div>
      </header>
      <TodaySection {...todayData} />

      <StudyTools
        folderId={currentFolder.id}
        totalQuestions={statisticsData.questions.howManyQuestions}
      />
    </div>
  );
}
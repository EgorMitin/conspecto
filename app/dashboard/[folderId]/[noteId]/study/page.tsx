import { getFoldersAndNotesFromDBAction } from "@/app/dashboard/actions";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getNote } from "../actions";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/dashboard/Sidebar";
import Breadcrumbs from "@/components/dashboard/NotePage/Breadcrumbs";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import NoteStatistics from "@/components/dashboard/Study/Statistics";
import TodaySection from "@/components/dashboard/Study/TodaySection";
import StudyTools from "@/components/dashboard/Study/StudyTools";
import { getStatistics, getTodayData, getQuestinosAndAiReviews } from "./actions";


export default async function StudyPage({params}: {params: Promise<{folderId: string; noteId: string}>}) {
  const { folderId, noteId } = await params;

  const user = await getCurrentUser()
  if (!user || !folderId) redirect('/');
  if (!noteId) throw new Error("Note ID is required");

  const { folders, notes } = await getFoldersAndNotesFromDBAction(user, folderId);
  const { success, note } = await getNote(noteId);
  if (!success) redirect('/dashboard');

  const currentFolder = folders.find(folder => folder.id === folderId);
  if (!currentFolder) redirect('/');
  const folderName = currentFolder.name;

  const lastUpdated = formatDistanceToNow(note.updatedAt, { addSuffix: true });

  const { questions, aiReviews } = await getQuestinosAndAiReviews(noteId);

  const statisticsData = await getStatistics(questions, aiReviews)
  const todayData = await getTodayData(questions, aiReviews)

  return (
    <main className="flex h-screen w-full min-w-0">
      <Sidebar
        user={user}
        folders={folders}
        folderId={folderId}
        notes={notes}
      />
      <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
        <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4 w-full">
          <div className="flex flex-col gap-4 w-full px-2">
            <Breadcrumbs folderName={folderName} folderId={folderId} noteId={noteId} noteTitle={note.title} page="study" />
            <NoteHeader note={note} lastUpdated={lastUpdated} />
            <NoteStatistics statisticsData={statisticsData} />
          </div>
        </header>
        <TodaySection {...todayData} />

        <StudyTools 
          noteId={noteId}
          folderId={folderId}
          totalQuestions={statisticsData.questions.howManyQuestions}
        />
      </div>
    </main>
  );
}
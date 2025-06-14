'use server';

import { getNote } from "./actions";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { getFoldersAndNotesFromDBAction } from "../../actions";
import { getQuestinosAndAiReviews, getStatistics } from "./study/actions";
import { getNextAiReviewDateText } from "@/utils/statistics";
import Editor from "./Editor";
import Sidebar from "@/components/dashboard/Sidebar";
import Breadcrumbs from "@/components/dashboard/NotePage/Breadcrumbs";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import { StudyProgress } from "@/components/dashboard/NotePage/StudyProgress";

// PPR should be enabled, but for some reason it is not working with the current setup.
// export const experimental_ppr = true;

export default async function NotePage({ params }: { params: Promise<{ folderId: string, noteId: string }> }) {
  const { folderId, noteId } = await params;

  const user = await getCurrentUser()
  if (!user || !folderId) redirect('/');

  const { folders, notes } = await getFoldersAndNotesFromDBAction(user, folderId);

  if (!noteId) throw new Error("Note ID is required");

  const { success, note } = await getNote(noteId);
  if (!success) redirect('/dashboard');

  const currentFolder = folders.find(folder => folder.id === folderId);
  if (!currentFolder) redirect('/');
  const folderName = currentFolder.name;

  const lastUpdated = formatDistanceToNow(note.updatedAt, { addSuffix: true });
  const nextReview = getNextAiReviewDateText(note.nextReview);

  const { questions, aiReviews } = await getQuestinosAndAiReviews(noteId);
  const statisticsData = await getStatistics(questions, aiReviews);

  await new Promise(resolve => setTimeout(resolve, 3000));

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
            <Breadcrumbs folderName={folderName} folderId={folderId} noteTitle={note.title} page="note" />
            <NoteHeader note={note} lastUpdated={lastUpdated} />
            {note.status === 'active' && (
              <StudyProgress
                questions={statisticsData.questions.howManyQuestions}
                reviewed={statisticsData.questions.howManyReviewed}
                nextReview={nextReview}
              />
            )}
          </div>
        </header>
        <Editor note={note} />
      </div>
    </main>
  );
}
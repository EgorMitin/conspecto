import { getFoldersAndNotesFromDBAction } from "@/app/dashboard/actions";
import { getCurrentUser } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getNote } from "../../actions";
import Sidebar from "@/components/dashboard/Sidebar";
import Breadcrumbs from "@/components/dashboard/NotePage/Breadcrumbs";
import NoteHeader from "@/components/dashboard/NotePage/NoteHeader";
import { formatDistanceToNow } from "date-fns";
import AISummaryContent from "@/components/dashboard/Study/AISummary/AISummaryContent";

export default async function AISummaryPage({
  params
}: {
  params: Promise<{ folderId: string; noteId: string }>
}) {
  const { folderId, noteId } = await params;

  const user = await getCurrentUser();
  if (!user || !folderId) redirect('/');
  if (!noteId) throw new Error("Note ID is required");

  const { folders, notes } = await getFoldersAndNotesFromDBAction(user, folderId);
  const { success, note } = await getNote(noteId);
  if (!success) redirect('/dashboard');

  const currentFolder = folders.find(folder => folder.id === folderId);
  if (!currentFolder) redirect('/');
  const folderName = currentFolder.name;

  const lastUpdated = formatDistanceToNow(note.updatedAt, { addSuffix: true });

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
            <Breadcrumbs 
              folderName={folderName} 
              folderId={folderId} 
              noteTitle={note.title} 
              noteId={noteId}
              page="aiSummary"
            />
            <NoteHeader note={note} lastUpdated={lastUpdated} />
          </div>
        </header>
        
        <AISummaryContent noteId={noteId} />
      </div>
    </main>
  );
}
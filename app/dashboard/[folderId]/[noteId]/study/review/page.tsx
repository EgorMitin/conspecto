'use server';

import ReviewSession from "@/components/dashboard/Study/ReviewSession";
import { getNoteFromDB } from "./action";

export default async function ReviewPage({params}: {params: Promise<{folderId: string, noteId: string}>}) {
  const { noteId, folderId } = await params;
  if (!noteId) throw new Error("Note ID is required");
  const note = await getNoteFromDB(noteId);

  return (
    <main className="flex-1 flex flex-col">
      <ReviewSession noteContent={note.content} />
    </main>
  );
}
import Editor from "./Editor";
import { logger } from "@/utils/logger";
import type { Note } from "@/types/Note";

export const experimental_ppr = true;

async function loadNoteFromDb(noteId: string): Promise<{success: boolean; note?: any}> {
  try {
    const response = await fetch(`/api/notes/load/${noteId}`);
    const data = await response.json();

    if (response.ok && data.note) {
      return { success: true, note: data.note };
    }

    return { success: false };
  } catch (error) {
    console.error('Error loading note:', error);
    return { success: false };
  }
}

async function getNote (noteId: string): Promise<Note> {
  const result = await loadNoteFromDb(noteId);
  if (result.success) {
    return result.note;
  } else {
    logger.error(`Failed to load note with ID: ${noteId}`);
    throw new Error('Failed to load note');
  }
}


export default async function CreateNote({ params }: {params: {noteId: string} }) {
  if (!params.noteId) {
    logger.error("Note ID is not provided");
    throw new Error("Note ID is required");
  }

  const note = await getNote(params.noteId);

  return (
    <div>
      <div>
        <Editor content={note.content} />
      </div>
    </div>
  );
}
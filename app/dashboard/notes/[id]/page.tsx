import Editor from "./Editor";
import { logger } from "@/utils/logger";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

import { getNote, saveEditorContentToDb, getUserId } from "./actions";

export const experimental_ppr = true;

export default async function CreateNote({ params }: {params: {noteId: string} }) {
  const userId = getUserId();
  if (!params.noteId) {
    logger.error("Note ID is not provided");
    throw new Error("Note ID is required");
  }

  const note = await getNote(params.noteId);
  const saveNoteToDb = async (content: SerializedEditorState<SerializedLexicalNode>) => {
    const result = await saveEditorContentToDb(content, note.id, userId);
    return result;
  };

  return (
    <div>
      <div>
        <Editor save={saveNoteToDb} content={note.content} />
      </div>
    </div>
  );
}
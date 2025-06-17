'use server';

import { logger } from "@/utils/logger";
import DatabaseService from "@/services/DatabaseService";
import { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { extractPlainTextFromState } from "@/utils/global";

/**
 * Save editor content to PostgreSQL database via DatabaseService
 */
export async function saveEditorContentToDb(
  editorState: SerializedEditorState<SerializedLexicalNode>,
  noteId: string,
  userId: string,
  noteContent: string,
): Promise<{ success: boolean; id?: string; message?: string }> {
  try {
    if (!editorState) return { success: false, message: 'Content is empty' };
    const content = JSON.stringify(editorState);
    if (content === noteContent) return { success: true, message: "Content didn't change" }

    logger.info(`Saving note content for noteId: ${noteId}`);
    const updatedNote = await DatabaseService.updateNote(noteId, {
      content: content,
      contentPlainText: extractPlainTextFromState(editorState),
      userId,
    });

    if (!updatedNote) {
      return { success: false, message: 'Failed to save note' };
    }

    return {
      success: true,
      id: updatedNote.id,
      message: 'Note saved successfully'
    };
  } catch (error) {
    logger.error('Error saving note:', error);
    return { success: false, message: 'Error saving note' };
  }
}
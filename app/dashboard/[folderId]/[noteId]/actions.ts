'use server';

import { logger } from "@/utils/logger";
import type { Note } from "@/types/Note";
import DatabaseService from "@/services/DatabaseService";
import { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { extractPlainTextFromState } from "@/utils/global";
import { Question } from "@/types/Question";

export async function getNote(noteId: string): Promise<{ success: true; note: Note & { questions: Question[] } } | { success: false; note: null }> {
  try {
    const note = await DatabaseService.getNoteById(noteId);
    const questions = await DatabaseService.getQuestionsByNoteId(noteId);

    if (!note) {
      return { success: false, note: null };
    }
    return { success: true, note: { ...note, questions } };
  } catch (error) {
    console.error('Error loading note:', error);
    return { success: false, note: null };
  }
}

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
    console.log("LOG2222222222222222")
    if (!editorState) return { success: false, message: 'Content is empty' };
    const content = JSON.stringify(editorState);
    if (content === noteContent) return { success: false, message: "Content didn't change" }

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
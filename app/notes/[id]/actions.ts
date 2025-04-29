import { logger } from "@/utils/logger";
import type { Note } from "@/types/Note";
import type { SerializedEditorState, SerializedLexicalNode } from "lexical";

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

/**
 * Save editor content to PostgreSQL database via API
 */
export async function saveEditorContentToDb(
  content: SerializedEditorState<SerializedLexicalNode>,
  noteId: string,
  userId: string,
): Promise<{success: boolean; id?: string; message?: string}> {
  try {
    // If content is empty, don't save
    if (!content) {
      return { success: false, message: 'Content is empty' };
    }

    // Create payload for API
    const payload = {
      id: noteId, // Always use the ID from the route params
      content,
      userId: userId,
    };

    // Send to API
    const response = await fetch('/api/notes/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return {
      success: result.success,
      id: result.note?.id,
      message: result.message || 'Failed to save note'
    };
  } catch (error) {
    console.error('Error saving note:', error);
    return { success: false, message: 'Error saving note' };
  }
}

export async function getNote (noteId: string): Promise<Note> {
  const result = await loadNoteFromDb(noteId);
  if (result.success) {
    return result.note;
  } else {
    logger.error(`Failed to load note with ID: ${noteId}`);
    throw new Error('Failed to load note');
  }
}

export function getUserId(): string {
  // Placeholder for user ID retrieval logic
  // In a real application, this would likely involve authentication
  return 'anonymous';
}
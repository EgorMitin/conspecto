'use server';

import { generateContentInsights } from '@/lib/server_actions/ai-service';
import { getCurrentUser } from '@/lib/auth/auth';
import DatabaseService from '@/services/DatabaseService';
import { logger } from '@/utils/logger';

export interface SummaryData {
  summary: string;
  keyTakeaways: string[];
  noteTitle: string;
  noteContent: string;
  wordCount: number;
  estimatedReadTime: number;
}

export interface SummaryResult {
  success: boolean;
  data?: SummaryData;
  error?: string;
}

/**
 * Generate AI summary and insights for a note
 */
export async function generateAISummary(noteId: string): Promise<SummaryResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const note = await DatabaseService.getNoteById(noteId);
    if (!note) {
      return {
        success: false,
        error: 'Note not found'
      };
    }

    const result = await generateContentInsights(noteId, 'note');

    if (result.error || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to generate AI summary'
      };
    }

    const wordCount = note.contentPlainText.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 WPM

    return {
      success: true,
      data: {
        summary: result.data.summary,
        keyTakeaways: result.data.keyTakeaways,
        noteTitle: note.title,
        noteContent: note.contentPlainText,
        wordCount,
        estimatedReadTime
      }
    };

  } catch (error) {
    logger.error('Generate AI summary action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI summary'
    };
  }
}

/**
 * Save AI summary to database for future reference
 */
export async function saveAISummary(
  noteId: string,
  summary: string,
  keyTakeaways: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    logger.debug(`AI Summary saved for note ${noteId}`, { summary, keyTakeaways });
    const note = await DatabaseService.updateNote(noteId, {
      metadata: {
        aiSummary: summary,
        aiKeyTakeaways: keyTakeaways,
      }
    });

    return { success: !!note };

  } catch (error) {
    logger.error('Save AI summary action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save AI summary'
    };
  }
}
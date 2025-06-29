'use server';

import { generateContentInsights } from '@/lib/server_actions/ai-service';
import { getCurrentUser } from '@/lib/auth/auth';
import DatabaseService from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import type { Note } from '@/types/Note';

export interface SummaryData {
  summary: string;
  keyTakeaways: string[];
  sourceTitle: string;
  sourceContent: string;
  wordCount: number;
  estimatedReadTime: number;
  sourceType: 'note' | 'folder' | 'user';
}

export interface SummaryResult {
  success: boolean;
  data?: SummaryData;
  error?: string;
}

/**
 * Generate AI summary and insights for a source (note, folder, or user)
 */
export async function generateAISummary(sourceId: string, sourceType: 'note' | 'folder' | 'user'): Promise<SummaryResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    let sourceTitle: string;
    let sourceContent: string;
    let wordCount: number;

    if (sourceType === 'note') {
      const note = await DatabaseService.getNoteById(sourceId);
      if (!note) {
        return {
          success: false,
          error: 'Note not found'
        };
      }
      sourceTitle = note.title;
      sourceContent = note.contentPlainText;
      wordCount = note.contentPlainText.split(/\s+/).filter(word => word.length > 0).length;
    } else if (sourceType === 'folder') {
      const folder = await DatabaseService.getFolderById(sourceId);
      if (!folder) {
        return {
          success: false,
          error: 'Folder not found'
        };
      }
      sourceTitle = folder.name;

      // Get all notes in the folder and combine their content
      const notes = await DatabaseService.getNotesByFolderId(sourceId);
      if (!notes || notes.length === 0) {
        return {
          success: false,
          error: 'No notes found in this folder'
        };
      }

      sourceContent = notes
        .filter(note => note.contentPlainText && note.contentPlainText.trim().length > 0)
        .map(note => `${note.title}\n\n${note.contentPlainText}`)
        .join('\n\n---\n\n');

      if (!sourceContent.trim()) {
        return {
          success: false,
          error: 'No content found in notes to summarize'
        };
      }

      wordCount = sourceContent.split(/\s+/).filter(word => word.length > 0).length;
    } else if (sourceType === 'user') {
      // sourceId should be the userId for user type
      const folders = await DatabaseService.getFoldersByUserId(sourceId);
      if (!folders || folders.length === 0) {
        return {
          success: false,
          error: 'No folders found for this user'
        };
      }

      sourceTitle = `All Notes Summary for User`;

      // Get all notes from all folders for this user
      const allNotes: (Note & { folderName: string })[] = [];
      for (const folder of folders) {
        const notes = await DatabaseService.getNotesByFolderId(folder.id);
        if (notes && notes.length > 0) {
          allNotes.push(...notes.map(note => ({ ...note, folderName: folder.name })));
        }
      }

      if (allNotes.length === 0) {
        return {
          success: false,
          error: 'No notes found for this user'
        };
      }

      // Group notes by folder and create structured content
      const folderGroups = allNotes.reduce((acc, note) => {
        if (!acc[note.folderName]) {
          acc[note.folderName] = [];
        }
        acc[note.folderName].push(note);
        return acc;
      }, {} as Record<string, (Note & { folderName: string })[]>);

      sourceContent = Object.entries(folderGroups)
        .map(([folderName, notes]) => {
          const folderContent = notes
            .filter((note: Note) => note.contentPlainText && note.contentPlainText.trim().length > 0)
            .map((note: Note) => `### ${note.title}\n\n${note.contentPlainText}`)
            .join('\n\n');

          return folderContent ? `## ${folderName}\n\n${folderContent}` : '';
        })
        .filter(content => content.trim().length > 0)
        .join('\n\n===\n\n');

      if (!sourceContent.trim()) {
        return {
          success: false,
          error: 'No content found in user notes to summarize'
        };
      }

      wordCount = sourceContent.split(/\s+/).filter(word => word.length > 0).length;
    } else {
      return {
        success: false,
        error: 'Invalid source type'
      };
    }

    const result = await generateContentInsights(sourceId, sourceType);

    if (result.error || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to generate AI summary'
      };
    }

    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 WPM

    return {
      success: true,
      data: {
        summary: result.data.summary,
        keyTakeaways: result.data.keyTakeaways,
        sourceTitle,
        sourceContent,
        wordCount,
        estimatedReadTime,
        sourceType
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
  sourceId: string,
  sourceType: 'note' | 'folder' | 'user',
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

    logger.debug(`AI Summary saved for ${sourceType} ${sourceId}`, { summary, keyTakeaways });

    if (sourceType === 'note') {
      const note = await DatabaseService.updateNote(sourceId, {
        metadata: {
          aiSummary: summary,
          aiKeyTakeaways: keyTakeaways,
        }
      });
      return { success: !!note };
    } else if (sourceType === 'folder') {
      const folder = await DatabaseService.updateFolder(sourceId, {
        metadata: {
          aiSummary: summary,
          aiKeyTakeaways: keyTakeaways,
        }
      });
      return { success: !!folder };
    } else if (sourceType === 'user') {
      // For user type, we could save to user metadata or create a separate summary record
      // For now, we'll just log it as user summaries might not need persistent storage
      logger.info(`User AI Summary generated for user ${sourceId}`, { summary, keyTakeaways });
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid source type'
      };
    }

  } catch (error) {
    logger.error('Save AI summary action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save AI summary'
    };
  }
}
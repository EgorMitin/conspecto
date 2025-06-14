import { Question } from "@/types/Question";
import { getQuestionsByFolderId, getQuestionsByNoteId, getQuestionsByUserId } from "@/lib/server_actions/questions";

export type GetQuestionsForScopeParams = {scope: 'user', userId: string}
     | {scope: 'folder', folderId: string}
     | {scope: 'note', noteId: string};

export async function getQuestionsForScope(data: GetQuestionsForScopeParams): Promise<Question[]> {
  let questions: Question[] = [];

  try {
    if (data.scope === 'user') {
      const response = await getQuestionsByUserId(data.userId);
      if (response.error !== null) {
        console.error('Error fetching user questions:', response.error);
        return [];
      }
      questions = response.data;
    }

    if (data.scope === 'folder') {
      const response = await getQuestionsByFolderId(data.folderId);
      if (response.error !== null) {
        console.error('Error fetching folder questions:', response.error);
        return [];
      }
      questions = response.data;
    }

    if (data.scope === 'note') {
      const response = await getQuestionsByNoteId(data.noteId);
      if (response.error !== null) {
        console.error('Error fetching note questions:', response.error);
        return [];
      }
      questions = response.data;
    }
    
    return questions;

  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}
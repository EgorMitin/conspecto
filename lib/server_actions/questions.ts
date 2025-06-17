'use server';

import DatabaseService from "@/services/DatabaseService";
import { Question } from "@/types/Question";
import { AnsweredQuestion } from "../stores/review-store";
import { sm2Algorithm } from "../space-repetition/sm2-algorithm";

export async function deleteQuestion(questionId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.debug('Deleting question with ID SERVER:', questionId);
    const result = await DatabaseService.deleteQuestion(questionId);
      console.debug('Deleting question with ID SERVER:', result);
    if (result) {
      return { success: true, message: 'Question deleted successfully' };
    } else {
      return { success: false, message: 'Failed to delete question' };
    }
  } catch (error) {
    console.debug('Error deleting question:', error);
    return { success: false, message: 'Failed to delete question' };
  }
}

export async function updateQuestion(question: Question) {
  try {
    const updatedQuestion = await DatabaseService.updateQuestion(question.id, question);
    return { data: updatedQuestion, error: null };
  } catch {
    return { data: null, error: 'Failed to update note' };
  }
}

export async function createQuestion(question: Question): Promise<{ data: Question; error: null } | { data: null; error: string }> {
  try {
    const newQuestion = await DatabaseService.createQuestion(question);
    return { data: newQuestion, error: null };
  } catch {
    return { data: null, error: 'Failed to create question' };
  }
}

export async function getQuestionsByUserId(userId: string): Promise<{ data: Question[]; error: null } | { data: null; error: string }> {
  try {
    const questions = await DatabaseService.getQuestionsByUserId(userId);
    if (!questions) {
      throw new Error('Failed to fetch questions');
    };
    return { data: questions, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch questions' };
  }
}

export async function getQuestionsByFolderId(folderId: string): Promise<{ data: Question[]; error: null } | { data: null; error: string }> {
  try {
    const questions = await DatabaseService.getQuestionsByFolderId(folderId);
    if (!questions) {
      throw new Error('Failed to fetch questions');
    };
    return { data: questions, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch questions' };
  }
}

export async function getQuestionsByNoteId(noteId: string): Promise<{ data: Question[]; error: null } | { data: null; error: string }> {
  try {
    const questions = await DatabaseService.getQuestionsByNoteId(noteId);
    if (!questions) {
      throw new Error('Failed to fetch questions');
    };
    return { data: questions, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch questions' };
  }
}

export async function updateQuestionsInDB(answeredQuestions: AnsweredQuestion[], questions: Question[]): Promise<{ success: boolean; message: string }> {
  try {
    let success = true;
    for (const answeredQuestion of answeredQuestions) {
      const question = questions.find(q => q.id === answeredQuestion.questionId);
      if (!question) {
        console.warn(`Question with ID ${answeredQuestion.questionId} not found`);
        continue;
      }
      const updatedQuestion = sm2Algorithm(question, answeredQuestion.feedback, answeredQuestion.timeSpent);
      const result = await DatabaseService.updateQuestion(answeredQuestion.questionId, updatedQuestion);
      if (!result) {
        console.error(`Failed to update question with ID ${answeredQuestion.questionId}`);
        success = false;
      }
    }
    if (success) {
      return { success: true, message: 'Questions updated successfully' };
    } else {
      return { success: false, message: 'Failed to update questions' };
    }
  } catch (error) {
    console.debug('Error updating questions:', error);
    return { success: false, message: 'Failed to update questions' };
  }
}

export async function updateQuestionInDB(updatedQuestion: Partial<Question> & { id:string }): Promise<{ success: boolean; message: string }> {
  try {
    const result = await DatabaseService.updateQuestion(updatedQuestion.id, updatedQuestion);
    if (!result) {
      console.error(`Failed to update question with ID ${updatedQuestion.id}`);
      throw new Error('Failed to update questions');
    }
    console.debug(`Question with ID ${result} updated successfully`, result);
    return { success: true, message: 'Question is updated successfully' };
  } catch (error) {
    console.debug('Error updating questions:', error);
    return { success: false, message: 'Failed to update questions' };
  }
}
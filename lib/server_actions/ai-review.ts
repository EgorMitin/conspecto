'use server';

import DatabaseService from "@/services/DatabaseService";
import { AiReviewSession } from "@/types/AiReviewSession";

export async function createAiReviewSession(session: Omit<AiReviewSession, 'id'>): Promise<{ data: AiReviewSession; error: null } | { data: null; error: string }>  {
  try {
    console.log(session)
    const createdSession = await DatabaseService.createAiReviewSession(session);
    if (!createdSession) {
      throw new Error('Failed to create AI review session');
    }
    return { data: createdSession, error: null };
  } catch (error) {
    console.error('Error creating AI review session:', error);
    return { data: null, error: 'Failed to create AI review session' };
  }
}

export async function getAiReviewSession(sessionId: string): Promise<{ data: AiReviewSession; error: null } | { data: null; error: string }> {
  try {
    const session = await DatabaseService.getAiReviewSessionById(sessionId);
    if (!session) {
      throw new Error('AI review session not found');
    }
    return { data: session, error: null };
  } catch (error) {
    console.error('Error fetching AI review session:', error);
    return { data: null, error: 'Failed to fetch AI review session' };
  }
}

export async function updateAiReviewSession(
  sessionId: string, 
  updates: Partial<AiReviewSession>
): Promise<{ data: AiReviewSession; error: null } | { data: null; error: string }> {
  try {
    const updatedSession = await DatabaseService.updateAiReviewSession(sessionId, updates);
    if (!updatedSession) {
      throw new Error('Failed to update AI review session');
    }
    return { data: updatedSession, error: null };
  } catch (error) {
    console.error('Error updating AI review session:', error);
    return { data: null, error: 'Failed to update AI review session' };
  }
}

export async function getAiReviewSessionsByNoteId(noteId: string): Promise<{ data: AiReviewSession[]; error: null } | { data: null; error: string }> {
  try {
    const sessions = await DatabaseService.getAiReviewSessionsByNoteId(noteId);
    return { data: sessions, error: null };
  } catch (error) {
    console.error('Error fetching AI review sessions:', error);
    return { data: null, error: 'Failed to fetch AI review sessions' };
  }
}

export async function updateAiReviewSessionStatus(
  sessionId: string,
  status: AiReviewSession['status'],
  timestamps?: Pick<AiReviewSession, 'questionsGeneratedAt' | 'sessionStartedAt' | 'completedAt'>
): Promise<{ data: boolean; error: null } | { data: null; error: string }> {
  try {
    const success = await DatabaseService.updateAiReviewSessionStatus(sessionId, status, timestamps);
    return { data: success, error: null };
  } catch (error) {
    console.error('Error updating AI review session status:', error);
    return { data: null, error: 'Failed to update AI review session status' };
  }
}

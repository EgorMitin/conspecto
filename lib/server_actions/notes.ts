'use server';

import DatabaseService from "@/services/DatabaseService";
import { Note } from "@/types/Note";
import { sm2Algorithm } from "../space-repetition/sm2-algorithm";

export async function updateNote(noteId: string, updates: Partial<Note>) {
  try {
    const updatedNote = await DatabaseService.updateNote(noteId, updates);
    return { data: updatedNote, error: null };
  } catch {
    return { data: null, error: 'Failed to update note' };
  }
}

export async function createNote(noteData: Omit<Note, 'id' | "updatedAt" | "createdAt">): Promise<{ data: Note; error: null } | { data: null; error: string }> {
  try {
    const newNote = await DatabaseService.createNote(noteData);
    return { data: newNote, error: null };
  } catch {
    return { data: null, error: 'Failed to create note' };
  }
}

export async function getNotesByFolderId(folderId: string): Promise<{ data: Note[]; error: null } | { data: null; error: string }> {
  try {
    const notes = await DatabaseService.getNotesByFolderId(folderId);
    if (!notes) {
      throw new Error('Failed to fetch notes');
    };
    return { data: notes, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch notes' };
  }
}

export async function getNoteById(noteId: string): Promise<{ data: Note; error: null } | { data: null; error: string }> {
  try {
    const note = await DatabaseService.getNoteById(noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    return { data: note, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch note' };
  }
}

export async function updateNoteReview(noteId: string, score: 1 | 2 | 3 | 4, timeSpent: number): Promise<{ data: Note; error: null } | { data: null; error: string }> {
  try {
    const { data: note, error } = await getNoteById(noteId);
    if (error !== null) {
      throw new Error(error);
    }
    const updates = sm2Algorithm(note, score, timeSpent);
    const updatedNote = await DatabaseService.updateNote(noteId, updates);
    if (!updatedNote) {
      throw new Error('Failed to update note review');
    }
    return { data: updatedNote, error: null };
  } catch {
    return { data: null, error: 'Failed to update note review' };
  }
}
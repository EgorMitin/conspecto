import { adminDb } from "~/lib/firebase/admin.server";
import type { Note, CreateNoteData } from "~/lib/types";
import { getQuestionsByNote } from "./questions.server";

const notesCollection = adminDb.collection("notes");
const questionsCollection = adminDb.collection("questions");

export async function createNote(data: CreateNoteData) {
  const noteRef = notesCollection.doc();
  const now = new Date();

  const note = {
    id: noteRef.id,
    ...data,
    isArchived: false,
    isPublished: false,
    createdAt: now.toLocaleString(),
    updatedAt: now.toLocaleString(),
  };

  await noteRef.set(note);
  return note;
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const snapshot = await notesCollection
    .where("userId", "==", userId)
    .orderBy("updatedAt", "desc")
    .get();

  const notes = snapshot.docs.map((note) => note.data() as Note);
  notes.forEach((note) => {
    if (note.coverImage == "null") note.coverImage = null;
    if (note.icon == "null") note.icon = null;
  });
  return notes;
}

export async function getNotesByParent(
  userId: string,
  parentNote: string | null,
): Promise<Note[]> {
  const snapshot = await notesCollection
    .where("userId", "==", userId)
    .where("parentNote", "==", parentNote)
    .orderBy("updatedAt", "desc")
    .get();

  const notes = snapshot.docs.map((note) => note.data() as Note);
  notes.forEach((note) => {
    if (note.coverImage == "null") note.coverImage = null;
    if (note.icon == "null") note.icon = null;
  });
  return notes;
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const doc = await notesCollection.doc(noteId).get();
  if (!doc.exists) return null;
  const note = doc.data() as Note;
  if (note.coverImage == "null") note.coverImage = null;
  if (note.icon == "null") note.icon = null;
  return note;
}

export async function updateNote(
  noteId: string,
  data: Partial<Note>,
): Promise<void> {
  const now = new Date();
  const updateData = {
    ...data,
    updatedAt: now.toLocaleString(),
  };

  await notesCollection.doc(noteId).update(updateData);
}

export async function deleteNote(noteId: string): Promise<void> {
  const batch = adminDb.batch();
  const childNotes = await notesCollection
    .where("parentNote", "==", noteId)
    .get();

  const questions = await getQuestionsByNote(noteId);
  questions.forEach((question) => {
    const questionRef = questionsCollection.doc(question.id);
    batch.delete(questionRef);
  });

  childNotes.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  const noteRef = notesCollection.doc(noteId);
  batch.delete(noteRef);

  await batch.commit();
}

export async function restoreNote(noteId: string): Promise<void> {
  const noteRef = notesCollection.doc(noteId);
  const note = await noteRef.get();

  if (!note.exists) {
    throw new Error("Note not found");
  }

  // Update the note to remove archived status
  await noteRef.update({
    isArchived: false,
    updatedAt: new Date(),
  });

  // Also restore parent if it exists and archived
  const noteData = note.data() as Note;
  if (noteData.parentNote) {
    const parentRef = notesCollection.doc(noteData.parentNote);
    const parent = await parentRef.get();

    if (parent.exists) {
      const parentData = parent.data() as Note;
      if (parentData.isArchived) {
        await parentRef.update({
          isArchived: false,
          updatedAt: new Date(),
        });
      }
    }
  }
}

export async function getArchivedNotes(userId: string): Promise<Note[]> {
  const snapshot = await notesCollection
    .where("userId", "==", userId)
    .where("isArchived", "==", true)
    .orderBy("updatedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as Note);
}

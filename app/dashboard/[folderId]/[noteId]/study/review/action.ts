import DatabaseService from "@/services/DatabaseService";

export async function getNoteFromDB(noteId: string) {
  try {
    const note = await DatabaseService.getNoteById(noteId);
    if (!note) throw new Error('Note not found');

    return note;
  } catch (error) {
    console.error('Error fetching note:', error);
    throw new Error('Failed to fetch note');
  }
}
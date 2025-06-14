import DatabaseService from "@/services/DatabaseService";
import { Folder } from "@/types/Folder";
import { Note } from "@/types/Note";
import { User } from "@/types/User";
import { redirect } from "next/navigation";

export async function getFoldersAndNotesFromDBAction(user: User, folderId?: string) {
  let folders: Folder[] = [];
  let currentFolder: Folder | null = null;
  let notes: Note[] = [];

  try {
    folders = await DatabaseService.getFoldersByUserId(user.id)
    if (folderId) {
      currentFolder = await DatabaseService.getFolderById(folderId);
      notes = await DatabaseService.getNotesByFolderId(folderId);
    }
  } catch (error) {
    redirect('/dashboard')
  }
  return { folders, currentFolder, notes };
}
'use server';

import DatabaseService from "@/services/DatabaseService";
import { Folder } from "@/types/Folder";
import { sm2Algorithm } from "../space-repetition/sm2-algorithm";

export async function updateFolder (folderId: string, updates: Partial<Folder>) {
  try {
    await DatabaseService.updateFolder(folderId, updates);
    return { success: true, message: "Folder updated successfully" };
  } catch (error) {
    console.error("Error updating folder:", error);
    return { success: false, message: "Failed to update folder" };
  }
}

export async function deleteFolder(folderId: string) {
  try {
    await DatabaseService.deleteFolder(folderId);
    return { success: true, message: "Folder deleted successfully" };
  } catch (error) {
    console.error("Error deleting folder:", error);
    return { success: false, message: "Failed to delete folder" };
  }
}

export async function updateFolderReview(folderId: string, score: 1 | 2 | 3 | 4, timeSpent: number): Promise<{ data: Folder; error: null } | { data: null; error: string }> {
  try {
    const folder = await DatabaseService.getFolderById(folderId);
    if (folder === null) {
      throw new Error('Folder not found');
    }
    const updates = sm2Algorithm(folder, score, timeSpent);
    const updatedFolder = await DatabaseService.updateFolder(folderId, updates);
    if (updatedFolder === null) {
      throw new Error('Failed to update folder review');
    }
    return { data: updatedFolder, error: null };
  } catch {
    return { data: null, error: 'Failed to update note review' };
  }
}
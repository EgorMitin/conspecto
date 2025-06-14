'use server';

import DatabaseService from "@/services/DatabaseService";
import { Folder } from "@/types/Folder";


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
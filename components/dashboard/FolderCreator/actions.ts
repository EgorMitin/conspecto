"use server";

import DatabaseService from "@/services/DatabaseService";
import { Folder } from "@/types/Folder";

export default async function createNewFolder(folder: Folder) {
  try {
    const newFolder = DatabaseService.createFolder(folder);
    if (!newFolder) {
      return new Error("Failed to create folder");
    }
  } catch (error) {
    console.error("Error creating folder:", error);
    return new Error("Failed to create folder");
  }
  return null;
}
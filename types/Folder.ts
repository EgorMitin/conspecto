import { Note } from "./Note";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  iconId: string;
  inTrash: boolean;
  logo?: string | null;
  bannerUrl?: string;
  notes: Note[];
  createdAt?: Date;
  updatedAt?: Date;
}
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { updateNote } from "~/services/notes.server";
import type { Note } from "~/lib/types";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id") as string;

  const updates: Partial<Note> = {};

  if (formData.has("title"))
    updates.title = formData.get("title") as string;
  if (formData.has("content"))
    updates.content = formData.get("content") as string;
  if (formData.has("coverImage"))
    updates.coverImage = formData.get("coverImage") as string;
  if (formData.has("icon")) updates.icon = formData.get("icon") as string;
  if (formData.has("isPublished"))
    updates.isPublished = formData.get("isPublished") === "true";
  if (formData.has("isArchived"))
    updates.isArchived = formData.get("isArchived") === "true";
  if (formData.has("parentNote"))
    updates.parentNote = formData.get("parentNote") as string;

  try {
    await updateNote(id, updates);
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to update note" }, { status: 500 });
  }
};

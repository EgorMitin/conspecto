import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { deleteNote } from "~/services/notes.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id") as string;

  try {
    await deleteNote(id);
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to delete note" }, { status: 500 });
  }
};

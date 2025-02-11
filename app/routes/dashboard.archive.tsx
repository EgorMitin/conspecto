import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { updateNote } from "~/services/notes.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id") as string;

  try {
    await updateNote(id, { isArchived: true });
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to archive note" }, { status: 500 });
  }
};

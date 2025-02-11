import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { createNote } from "~/services/notes.server";
import { getUserFromSession } from "~/services/session.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await getUserFromSession(request);
  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const parentNote = formData.get("parentNote") as string | null;

  try {
    const note = await createNote({
      title: "Untitled Note",
      content: "",
      userId: user.uid,
      parentNote: parentNote,
      isArchived: false,
      isPublished: false,
      icon: null,
      coverImage: null,
      questions: [],
    });

    return json({
      success: true,
      noteId: note.id,
    });
  } catch (error) {
    console.error("Failed to create note:", error);
    return json({ error: "Failed to create note" }, { status: 500 });
  }
};

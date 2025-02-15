import Toolbar from "~/components/notes/Toolbar";

import { Cover } from "~/components/notes/Cover";
import { Skeleton } from "~/components/ui/skeleton";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getNoteById, updateNote } from "~/services/notes.server";
import invariant from "tiny-invariant";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useState, useEffect } from "react";
import type { Note } from "~/lib/types";
import Tiptap from "~/components/notes/Tiptap";
import { BlockEditor } from "~/components/tiptap/BlockEditor";

interface UpdateNotePayload {
  title?: string;
  content?: string;
  coverImage?: string;
  icon?: string;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { noteId } = params;
  invariant(noteId, "Note ID is required");
  const formData = await request.formData();

  const updates: UpdateNotePayload = {};

  if (formData.has("title")) updates.title = formData.get("title") as string;
  if (formData.has("content"))
    updates.content = formData.get("content") as string;
  if (formData.has("coverImage"))
    updates.coverImage = formData.get("coverImage") as string;
  if (formData.has("icon")) updates.icon = formData.get("icon") as string;

  await updateNote(noteId, updates);

  return json({ success: true });
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.noteId, "Note ID is required");
  const note = await getNoteById(params.noteId);
  return json({ note });
};

export default function NoteIdPage() {
  const fetcher = useFetcher();
  const { note } = useLoaderData<typeof loader>();
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<{
    onChange: (content: string) => void;
    initialContent: string;
  }> | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const initialContent = note?.content ? JSON.parse(note.content) : null;

  useEffect(() => {
    setIsMounted(true);

    // Import Editor component only on client side!!!
    import("~/components/notes/Editor").then((module) => {
      setEditorComponent(() => module.default);
    });
  }, []);

  if (note === null) {
    return <div>Not found</div>;
  }

  const onChange = (content: string) => {
    fetcher.submit(
      { content },
      { method: "post", action: `/dashboard/notes/${note.id}` },
    );
  };

  if (!isMounted || !EditorComponent) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" dark:bg-[#1F1F1F]">
      <Cover url={note.coverImage} noteId={note.id} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar
          initialData={{
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          }}
        />
        <BlockEditor initialContent={initialContent} onChange={onChange} />
        {/* <EditorComponent onChange={onChange} initialContent={note.content} /> */}
      </div>
    </div>
  );
}

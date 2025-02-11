import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { Cover } from "~/components/notes/Cover";
import Toolbar from "~/components/notes/Toolbar";
import { Skeleton } from "~/components/ui/skeleton";
import { getNoteById } from "~/services/notes.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const noteId = params.noteId;
    invariant(noteId, "Note ID is required");
    const note = await getNoteById(noteId);
    return json({ note });
}

export default function Notestudy () {
  const fetcher = useFetcher();
  const { note } = useLoaderData<typeof loader>();
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<{
    onChange: (content: string) => void;
    initialContent: string;
    editable: boolean;
  }> | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let questions = generate_questions(note);

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
      { method: "post", action: `/dashboard/notes/${note.id}` });
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
    <div className="pb-40 dark:bg-[#1F1F1F]">
      <Cover url={note.coverImage} preview />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={{ ...note, createdAt: new Date(note.createdAt), updatedAt: new Date(note.updatedAt) }} preview />
        <EditorComponent
          onChange={onChange}
          initialContent={note.content}
          editable={true}
        />
      </div>
    </div>
  );
}
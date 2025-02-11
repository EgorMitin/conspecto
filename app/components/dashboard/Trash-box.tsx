import { useFetcher, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { Search, Trash, Undo } from "lucide-react";
import { Input } from "../ui/input";
import { ConfirmModal } from "../modals/Confirm-modal";
import { Note } from "~/lib/types";

export default function TrashBox({ notes }: { notes: Note[] }) {
  const deleteFetcher = useFetcher();
  const restoreFetcher = useFetcher();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredNotes = notes
    .filter((note) => note.isArchived)
    .filter((note) => {
      return note.title.toLowerCase().includes(search.toLowerCase());
    });

  const onClick = (noteId: string) => {
    navigate(`/dashboard/notes/${noteId}`);
  };

  const onRestore = (noteId: string) => {
    restoreFetcher.submit(
      { id: noteId },
      { method: "post", action: "/dashboard/restore" },
    );
  };

  const onRemove = (noteId: string) => {
    deleteFetcher.submit(
      { id: noteId },
      { method: "delete", action: "/dashboard/delete" },
    );
  };

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="h-4 w-4" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          placeholder="Filter by page title..."
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No notes found.
        </p>
        {filteredNotes?.map((note) => (
          <button
            key={note.id}
            onClick={() => onClick(note.id)}
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
          >
            <span className="truncate pl-2">{note.title}</span>
            <div className="flex items-center">
              <button
                onClick={() => onRestore(note.id)}
                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              >
                <Undo className="h-4 w-4 text-muted-foreground" />
              </button>
              <ConfirmModal onConfirm={() => onRemove(note.id)}>
                <div
                  role="button"
                  className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

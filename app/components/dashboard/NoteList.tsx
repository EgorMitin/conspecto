import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { NotebookPenIcon as NoteIcon } from "lucide-react";
import type { Note } from "~/lib/types";
import Item from "./Item";

interface NoteListProps {
  parentId: string | null;
  level?: number;
  notes: Note[];
}

export default function NoteList({
  parentId,
  level = 0,
  notes,
}: NoteListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const onExpand = (noteId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [noteId]: !prevExpanded[noteId],
    }));
  };

  const filteredNotes = notes.filter((note) => note.parentNote === parentId);

  if (filteredNotes === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  if (!filteredNotes?.length) {
    return null;
  }

  return (
    <>
      {filteredNotes.map((note) => {
        const noteIcon = note.icon || null;
        const isExpanded = expanded[note.id];

        return (
          <div key={note.id}>
            <Item
              id={note.id}
              onClick={() => navigate(`/dashboard/notes/${note.id}`)}
              label={note.title}
              icon={NoteIcon}
              noteIcon={noteIcon}
              active={
                typeof window !== "undefined"
                  ? window.location.pathname === `/dashboard/notes/${note.id}`
                  : false
              }
              level={level}
              onExpand={() => onExpand(note.id)}
              expanded={isExpanded}
              updatedAt={note.updatedAt
                .toLocaleString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "numeric",
                })
                .replace(",", "")}
            />
            {isExpanded && (
              <NoteList parentId={note.id} level={level + 1} notes={notes} />
            )}
          </div>
        );
      })}
    </>
  );
}

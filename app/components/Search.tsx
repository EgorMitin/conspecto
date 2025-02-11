import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { File } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useSearch, useUser } from "~/hooks";
import type { Note } from "~/lib/types";

export default function Search({ notes }: { notes: Note[] }) {
  const user = useUser();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (id: string) => {
    navigate(`/dashboard/notes/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.nickname}'s Jotion...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Notes">
          {notes?.map((note) => (
            <CommandItem
              key={note.id}
              value={`${note.id}-${note.title}`}
              title={note.title}
              onSelect={() => onSelect(note.id)}
            >
              {note.icon ? (
                <p className="mr-2 text-[18px]">{note.icon}</p>
              ) : (
                <File className="mr-2 h-4 w-4" />
              )}
              <span>{note.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

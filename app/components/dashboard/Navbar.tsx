import { useParams, Link, useLocation } from "@remix-run/react";
import { MenuIcon } from "lucide-react";

import { Button } from "../ui/button";
import { Title } from "./Title";
import { Banner } from "./Banner";
import { Menu } from "./Menu";
import { Publish } from "./Publish";

import type { Note } from "~/lib/types";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
  notes: Note[];
}

export default function Navbar({
  isCollapsed,
  onResetWidth,
  notes,
}: NavbarProps) {
  const noteId = useParams().noteId;
  const isStudyMode = useLocation().pathname.endsWith('/study')

  const note = notes.find((el) => el.id == noteId);

  if (note === undefined) {
    return (
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (note === null) {
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">
          <Title note={note} />
          <div className="flex items-center gap-x-2">
            <Link to={`/dashboard/notes/${note.id}` + (isStudyMode ? "" : "/study")}>
              <Button
                className="
                bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500
                hover:from-indigo-600 hover:via-purple-600 hover:to-blue-600
                text-white font-semibold
                transform
                hover:-translate-y-1
                hover:rotate-1
                transition-all duration-200 ease-out
                hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,0.4)]
                border border-transparent hover:border-indigo-400/30
                rounded-lg
                px-6 py-2
                active:translate-y-0.5
                active:shadow-inner
              "
              >
                {isStudyMode ? "Edit" : "Study"}
              </Button>
            </Link>
            <Publish note={note} />
            <Menu note={note} />
          </div>
        </div>
      </nav>
      {note.isArchived && <Banner note={note} />}
    </>
  );
}

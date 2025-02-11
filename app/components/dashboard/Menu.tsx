import { useNavigate, useFetcher } from "@remix-run/react";
import { MoreHorizontal, Trash } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "~/hooks";
import type { Note } from "~/lib/types";

interface MenuProps {
  note: Note;
}

export const Menu = ({ note }: MenuProps) => {
  const navigate = useNavigate();
  const archiveFetcher = useFetcher();
  const user = useUser();

  const onArchive = (noteId: string) => {
    archiveFetcher.submit(
      { id: noteId },
      { method: "post", action: "/dashboard/archive" },
    );
    navigate("/dashboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuItem onClick={() => onArchive(note.id)}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.nickname} <br />
          at{" "}
          {note.updatedAt
            .toLocaleString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "numeric",
            })
            .replace(",", "")}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};

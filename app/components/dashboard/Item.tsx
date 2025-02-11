import { cn } from "~/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { useUser } from "~/hooks";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "sonner";

interface ItemProps {
  id?: string;
  noteIcon?: string | null;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: LucideIcon;
  updatedAt?: string;
}

export interface FetcherResponse {
  success?: boolean;
  error?: string;
}

export interface ArchiveResponse extends FetcherResponse {
  id?: string;
}

export interface CreateNoteResponse extends FetcherResponse {
  noteId?: string;
}

export default function Item({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  noteIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
  updatedAt,
}: ItemProps) {
  const user = useUser();
  const navigate = useNavigate();
  const fetcher = useFetcher<CreateNoteResponse>();
  const archiveFetcher = useFetcher<ArchiveResponse>();

  useEffect(() => {
    if (fetcher.state === "submitting") {
      toast.loading("Creating note...", { id: "create-note" });
    } else {
      toast.dismiss("create-note");
      if (fetcher.data?.error) {
        toast.error(fetcher.data.error);
      } else if (fetcher.data?.success) {
        toast.success("New note created!");
      }
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (archiveFetcher.state === "submitting") {
      toast.loading("Archiving note...", { id: "create-note" });
    } else {
      toast.dismiss("create-note");
      if (archiveFetcher.data?.error) {
        toast.error(archiveFetcher.data.error);
      } else if (archiveFetcher.data?.success) {
        toast.success("Note succesfully archived!");
      }
    }
  }, [archiveFetcher.state, archiveFetcher.data]);

  const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;

    archiveFetcher.submit(
      { id },
      { method: "post", action: "/dashboard/archive" },
    );

    navigate("/dashboard");
  };

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    fetcher.submit(
      { parentNote: id },
      { method: "post", action: "/dashboard/create" },
    );
    if (!expanded) {
      onExpand?.();
    }
  };
  useEffect(() => {
    if (fetcher.data?.noteId && fetcher.state === "idle") {
      navigate(`/dashboard/notes/${fetcher.data.noteId}`);
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        paddingLeft: level ? `${level * 12 + 12}px` : "12px",
      }}
      className={cn(
        "group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium",
        active && "bg-primary/5 text-primary",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
      )}
    >
      {!!id && (
        <div
          role="button"
          tabIndex={0}
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
          onClick={handleExpand}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleExpand(
                e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>,
              );
            }
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground/50" />
        </div>
      )}
      {noteIcon ? (
        <div className="mr-2 shrink-0 text-[18px]">{noteIcon}</div>
      ) : (
        <Icon className="shrink-0 h-[18px] w-[18px] mr-2 text-muted-foreground" />
      )}
      <span className="truncate">{label}</span>
      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} asChild>
              <div
                role="button"
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60"
              align="start"
              side="right"
              forceMount
            >
              <DropdownMenuItem onClick={onArchive}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.nickname} <br />
                at {updatedAt}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            role="button"
            onClick={onCreate}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onCreate(
                  e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>,
                );
              }
            }}
            tabIndex={0}
            aria-label="Create new note"
            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${level * 12 + 25}px` : "12px",
      }}
      className="flex gap-x-2 py-[3px]"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  );
};

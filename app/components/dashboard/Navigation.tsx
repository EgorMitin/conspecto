import { useState, useRef, useEffect, useCallback } from "react";
import { useFetcher, useLocation, useParams } from "@remix-run/react";
import {
  ChevronsLeft,
  MenuIcon,
  PlusCircle,
  Search,
  Settings,
  Trash,
  Plus,
} from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

import UserItem from "./UserItem";
import Item from "./Item";
import NoteList from "./NoteList";
import TrashBox from "./Trash-box";
import Navbar from "./Navbar";
import type { Note } from "~/lib/types";
import { useSettings, useSearch } from "~/hooks";

interface NavigationProps {
  notes: Note[];
}

export default function Navigation({ notes }: NavigationProps) {
  const isNotePage = Boolean(useParams().noteId);
  const pathname = useLocation().pathname;
  const fetcher = useFetcher();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  const settings = useSettings();
  const search = useSearch();

  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 250) newWidth = 250;
    if (newWidth > 500) newWidth = 500;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`,
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "250px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 250px)",
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "250px");
      setTimeout(() => setIsResetting(false), 300);
    }
  }, [isMobile]);

  const collapseSidebar = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate = async () => {
    try {
      fetcher.submit({}, { method: "post", action: "/dashboard/create" });
      toast.success("New note created");
    } catch (error) {
      toast.error("Failed to create note");
    }
  };

  useEffect(() => {
    if (isMobile) {
      collapseSidebar();
    } else {
      resetWidth();
    }
  }, [isMobile, resetWidth]);

  useEffect(() => {
    if (isMobile) {
      collapseSidebar();
    }
  }, [pathname, isMobile]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary dark:bg-zinc-900 overflow-y-auto relative flex w-60 flex-col z-[50]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0",
        )}
      >
        <div
          role="button"
          onClick={collapseSidebar}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              collapseSidebar();
            }
          }}
          tabIndex={0}
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100",
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
          <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
          <Item label="New page" icon={PlusCircle} onClick={handleCreate} />
        </div>
        <div className="mt-4">
          <NoteList
            notes={notes.filter((note) => !note.isArchived)}
            parentId={null}
          />
          <Item onClick={handleCreate} icon={Plus} label="Add a page" />
          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-72"
              side={isMobile ? "bottom" : "right"}
            >
              <TrashBox notes={notes} />
            </PopoverContent>
          </Popover>
        </div>
        <button
          onMouseDown={handleMouseDown}
          onClick={handleMouseDown}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleMouseDown(
                e as unknown as React.MouseEvent<HTMLButtonElement>,
              );
            }
          }}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute right-0 top-0 bottom-0 w-1 bg-primary/10 border-0 p-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[50] left-60 w-[calc(100%-250px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full",
        )}
      >
        {isNotePage ? (
          <Navbar
            notes={notes}
            isCollapsed={isCollapsed}
            onResetWidth={resetWidth}
          />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                onClick={resetWidth}
                role="button"
                className="h-6 w-6 text-muted-foreground"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
}

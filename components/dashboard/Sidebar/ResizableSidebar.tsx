'use client';

import {
  ChevronsLeft,
  MenuIcon,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { ElementRef, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/utils/global";


export function ResizableSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before using media query
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 440) newWidth = 440;

    if (sidebarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = useCallback(() => {
    if (sidebarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "256px";
      setTimeout(() => setIsResetting(false), 300);
    }
  }, [isMobile]);

  const collapse = useCallback(() => {
    if (sidebarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      setTimeout(() => setIsResetting(false), 300);
    }
  }, []);

  useEffect(() => {
    if (isMounted && isMobile) {
      collapse();
    }
  }, [isMounted, isMobile, collapse]);

  useEffect(() => {
    if (isMounted && isMobile) {
      collapse();
    }
  }, [pathname, isMounted, isMobile, collapse]);

  if (!isMounted) {
    return (
      <>
        <aside
          ref={sidebarRef}
          className="group/sidebar h-full bg-secondary overflow-y-auto relative flex w-64 flex-col z-20"
        >
          <div
            onClick={collapse}
            role="button"
            className="h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition"
          >
            <ChevronsLeft className="h-6 w-6" />
          </div>
          {children}
          <div
            onMouseDown={handleMouseDown}
            onClick={resetWidth}
            className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
          />
        </aside>
      </>
    );
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-64 flex-col z-20",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile ? (isCollapsed ? "w-0" : "w-full") : "w-64"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        {children}
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      {isCollapsed && (
        <MenuIcon
          onClick={resetWidth}
          role="button"
          className="h-6 w-6 text-muted-foreground"
        />)}
    </>
  )
}
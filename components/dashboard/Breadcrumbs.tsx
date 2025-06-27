'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { cn } from "@/utils/global";
import { useRouter, usePathname } from "next/navigation";
import { useAppState } from "@/lib/providers/app-state-provider";
import { useMediaQuery } from "usehooks-ts";

interface BreadcrumbsProps {
  folderName?: string;
  folderId?: string;
  noteId?: string;
  noteTitle?: string;
  page?: string;
}

export default function Breadcrumbs(props?: BreadcrumbsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, folderId: contextFolderId, noteId: contextNoteId, currentNote } = useAppState();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const folderId = props?.folderId || contextFolderId;
  const noteId = props?.noteId || contextNoteId;

  const getCurrentPageInfo = () => {
    if (props?.page) {
      return { page: props.page };
    }

    if (!pathname) return { page: 'dashboard' };

    const segments = pathname.split('/').filter(Boolean);

    // Dashboard home
    if (segments.length === 1 && segments[0] === 'dashboard') {
      return { page: 'dashboard' };
    }

    // Folder page
    if (segments.length === 2 && segments[0] === 'dashboard') {
      return { page: 'folder' };
    }

    // Note page
    if (segments.length === 3 && segments[0] === 'dashboard') {
      return { page: 'note' };
    }

    // Study pages
    if (segments.includes('study')) {
      if (segments.includes('ai-summary')) {
        return { page: 'aiSummary' };
      }
      return { page: 'study' };
    }

    return { page: 'dashboard' };
  };

  const { page } = getCurrentPageInfo();

  const currentFolder = folderId ? state.folders.find(f => f.id === folderId) : null;
  const folderName = props?.folderName || currentFolder?.name || '';
  const noteTitle = props?.noteTitle || currentNote?.title || '';
  const breadCrumbStyle = "flex items-center text-sm text-muted-foreground" + (isMobile ? " ml-10" : "");

  return (
    <Breadcrumb className={breadCrumbStyle}>
      <BreadcrumbItem className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center">
        <BreadcrumbLink onClick={() => router.push(`/dashboard/`)} className="hover:text-foreground transition-colors flex items-center">
          <span>Dashboard</span>
        </BreadcrumbLink>
      </BreadcrumbItem>

      {(page === "folder" && folderName) && (
        <>
          <span className="mx-1 text-muted-foreground">/</span>
          <BreadcrumbItem className="overflow-hidden cursor-text text-ellipsis whitespace-nowrap max-w-[200px] font-medium text-foreground">
            <BreadcrumbLink className="pointer-events-none">{folderName}</BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}

      {((page === "note" || page === "study" || page === "aiSummary") && folderName && folderId) && (
        <>
          <span className="mx-1 text-muted-foreground">/</span>
          <BreadcrumbItem className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center">
            <BreadcrumbLink
              onClick={() => router.push(`/dashboard/${folderId}/`)}
              className="hover:text-foreground transition-colors"
            >
              {folderName}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}

      {page === "note" && noteTitle && (
        <>
          <span className="mx-1 text-muted-foreground">/</span>
          <BreadcrumbItem className="overflow-hidden cursor-text text-ellipsis whitespace-nowrap max-w-[200px] font-medium text-foreground">
            <BreadcrumbLink className="pointer-events-none">{noteTitle}</BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}

      {((page === "study" || page === "aiSummary") && noteTitle && noteId && folderId) && (
        <>
          <span className="mx-1 text-muted-foreground">/</span>
          <BreadcrumbItem className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center">
            <BreadcrumbLink
              onClick={() => router.push(`/dashboard/${folderId}/${noteId}`)}
              className="hover:text-foreground transition-colors"
            >
              {noteTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}

      {(page === "study" || page === "aiSummary") && (
        <>
          <span className="mx-1 text-muted-foreground">/</span>
          <BreadcrumbItem className={cn("overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px]", { "font-medium text-foreground cursor-text": page === "study" })}>
            {page === "aiSummary" ? (
              <BreadcrumbLink
                onClick={() => {
                  if (noteId && folderId) {
                    router.push(`/dashboard/${folderId}/${noteId}/study`);
                  } else if (folderId) {
                    router.push(`/dashboard/${folderId}/study`);
                  }
                }}
                className="hover:text-foreground transition-colors"
              >
                Study
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink className="pointer-events-none">Study</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </>
      )}

      {page === "aiSummary" && (
        <>
          <span className="mx-1 text-muted-foreground">/</span>
          <BreadcrumbItem className={cn("overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px]", { "font-medium text-foreground cursor-text": page === "aiSummary" })}>
            <BreadcrumbLink className="pointer-events-none">
              AI Summary
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
    </Breadcrumb>
  );
}
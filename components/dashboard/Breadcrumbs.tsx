'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { cn } from "@/utils/global";
import { useRouter } from "next/navigation";

interface BreadcrumbsProps {
  folderName?: string;
  folderId?: string;
  noteTitle?: string;
  noteId?: string;
  page?: "folder" | "note" | "study" | "aiSummary";
}

export default function Breadcrumbs({
  folderName,
  folderId,
  noteTitle,
  noteId,
  page,
}: BreadcrumbsProps) {
  const router = useRouter();
  return (
    <Breadcrumb className="flex items-center text-sm text-muted-foreground">
      <BreadcrumbItem className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center">
        <BreadcrumbLink onClick={() => router.push(`/dashboard/`)} className="hover:text-foreground transition-colors flex items-center">
          <span>Dashboard</span>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {page === "folder" ? (<>
        <span className="mx-1 text-muted-foreground">/</span>
        <BreadcrumbItem className="overflow-hidden cursor-text text-ellipsis whitespace-nowrap max-w-[200px] font-medium text-foreground">
          <BreadcrumbLink className="pointer-events-none">{folderName}</BreadcrumbLink>
        </BreadcrumbItem>
      </>
      ) : (!!page &&
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
          <span className="mx-1 text-muted-foreground">/</span>
        </>
      )}
      {page === "note" ? (
        <BreadcrumbItem className="overflow-hidden cursor-text text-ellipsis whitespace-nowrap max-w-[200px] font-medium text-foreground">
          <BreadcrumbLink className="pointer-events-none">{noteTitle}</BreadcrumbLink>
        </BreadcrumbItem>
      ) : (!!page && noteId &&
        <>
          <BreadcrumbItem className="overflow-hidden text-ellipsis whitespace-nowrap flex items-center">
            <BreadcrumbLink
              onClick={() => router.push(`/dashboard/${folderId}/${noteId}`)}
              className="hover:text-foreground transition-colors"
            >
              {noteTitle}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <span className="mx-1 text-muted-foreground">/</span>
        </>
      )}
      {
        (page === "study" || page === "aiSummary") && (
          <>
            <BreadcrumbItem className={cn("overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px]", { "font-medium text-foreground cursor-text": page === "study" })}>
              {page === "aiSummary" ? (
                <BreadcrumbLink
                  onClick={() => router.push(`/dashboard/${folderId}/${noteId}/study`)}
                  className="hover:text-foreground transition-colors"
                >
                  Study
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink className="pointer-events-none">Study</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )
      }
      {
        page === "aiSummary" && (
          <>
            <span className="mx-1 text-muted-foreground">/</span>
            <BreadcrumbItem className={cn("overflow-hidden text-ellipsis whitespace-nowrap max-w-[100px]", { "font-medium text-foreground cursor-text": page === "aiSummary" })}>
              <BreadcrumbLink className="pointer-events-none">
                AI Summary
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )
      }
    </Breadcrumb >
  );
}
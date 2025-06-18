
'use client';

import React from 'react';
import Link from 'next/link';
import { Folder } from '@/types/Folder';
import { cn } from '@/utils/global';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppState } from '@/lib/providers/app-state-provider';

interface FolderItemProps {
  folder: Folder;
  isActive: boolean;
}

export default function FolderItem({ folder, isActive }: FolderItemProps) {
  const { folderId } = useAppState();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={folderId !== folder.id ? `/dashboard/${folder.id}` : '/dashboard/'}>
            <div
              className={cn(
                'flex items-center gap-1 px-4 py-2 text-sm rounded-md transition-colors',
                isActive
                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <span className="text-xl">{folder.iconId}</span>
              <span className="truncate">{folder.name}</span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{folder.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

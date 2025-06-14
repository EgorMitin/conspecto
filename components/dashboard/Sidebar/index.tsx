import React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import FoldersDropdown from './FoldersDropdown';
import PlanUsage from './PlanUsage';
import NotesDropdownList from './NotesDropdownList';
import UserCard from './UserCard';
import NativeNavigation from './NativeNavigation';

import { cn } from '@/utils/global';
import { User } from '@/types/User';
import { Folder } from '@/types/Folder';
import { Note } from '@/types/Note';
import { ResizableSidebar } from './ResizableSidebar';

interface SidebarProps {
  user: User;
  folderId?: string;
  folders: Folder[];
  notes: Note[];
  className?: string;
}


async function SidebarComponent({ user, folderId, folders, notes, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden sm:flex sm:flex-col p-4 md:gap-4 !justify-between h-full',
        className
      )}
    >
      <div>
        <FoldersDropdown
          user={user}
          folders={folders}
          defaultValue={folders.find((folder) => folder.id === folderId)}
        />
        <PlanUsage
          foldersLength={folders?.length || 0}
          subscription={user.subscriptionPlan}
        />
        <NativeNavigation folderId={folderId} user={user} />
        <ScrollArea className="overflow-scroll relative h-[450px]">
          {folderId
            ? <NotesDropdownList
              user={user}
              notes={notes}
              folderId={folderId}
            />
            : "No notes yet. Select a folder to get started."}
        </ScrollArea>
      </div>
      <UserCard user={user} />
    </aside>
  );
};

export default async function Sidebar({ user, folderId, folders, notes }: SidebarProps) {
  return (
    <ResizableSidebar >
      <SidebarComponent
        className='bg-sidebar'
        user={user}
        folders={folders}
        folderId={folderId}
        notes={notes}
      />
    </ResizableSidebar>
  )
}
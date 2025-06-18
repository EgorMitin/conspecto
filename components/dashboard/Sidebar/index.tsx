import React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import FolderList from './FolderList';
import PlanUsage from './PlanUsage';
import NotesDropdownList from './NotesDropdownList';
import UserCard from './UserCard';
import NativeNavigation from './NativeNavigation';

import { cn } from '@/utils/global';
import { User } from '@/types/User';
import { Folder } from '@/types/Folder';
import { Note } from '@/types/Note';
import { ResizableSidebar } from './ResizableSidebar';
import { useAppState } from '@/lib/providers/app-state-provider';
import Link from 'next/link';
import { HomeIcon, Plus } from 'lucide-react';
import CustomDialogTrigger from '@/components/CustomDialogTrigger';
import FolderCreator from '../FolderCreator';

interface SidebarProps {
  user: User;
  folderId?: string;
  folders: Folder[];
  notes: Note[];
  className?: string;
}


function SidebarComponent({ user, folderId, folders, notes, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'sm:flex sm:flex-col p-4 md:gap-4 !justify-between h-full',
        className
      )}
    >
      <div>
        <PlanUsage
          foldersLength={folders?.length || 0}
          subscription={user.subscriptionPlan}
        />
        {folderId
          ?
          <Link
            className="flex transition-all hover:bg-muted items-center gap-2 p-2 w-full"
            href={`/dashboard/`}
          >
            <HomeIcon />
            To Dashboard
          </Link>
          :
          <CustomDialogTrigger
            header="Create A Folder"
            content={<FolderCreator user={user} />}
            description="Create a new folder to never get lost in your konwledge again."
          >
            <div className="flex transition-all hover:bg-muted items-center gap-2 p-2 w-full">
              <Plus />
              Create folder
            </div>
          </CustomDialogTrigger>
        }
        <FolderList user={user} folders={folders} folderId={folderId} />
        <ScrollArea className="overflow-scroll relative h-[450px]">
          {folderId
            ? <NotesDropdownList
              user={user}
              notes={notes}
              folderId={folderId}
            />
            : <div className='text-primary/80 p-2 text-sm mt-4'>Select a folder to  view notes</div>}
        </ScrollArea>
      </div>
      <div>
        <NativeNavigation folderId={folderId} user={user} />
        <UserCard user={user} />
      </div>
    </aside>
  );
};

export default function Sidebar({ user }: { user: User }) {
  const { state, folderId } = useAppState();
  const { folders } = state;
  const notes = folders.flatMap(folder => folder.notes);

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
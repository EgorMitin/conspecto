'use client';

import React from 'react';
import { Folder } from '@/types/Folder';
import FolderItem from './FolderItem';
import CustomDialogTrigger from '@/components/CustomDialogTrigger';
import FolderCreator from '@/components/dashboard/FolderCreator';
import { User } from '@/types/User';
import { FolderIcon, Plus } from 'lucide-react';

interface FolderListProps {
  folders: Folder[];
  user: User;
  folderId?: string;
}

export default function FolderList({ folders, user, folderId }: FolderListProps) {
  return (
    <div className='border-l-2 mb-4 mt-4'>
      <div className="flex justify-start items-center px-4 py-2">
        <h2 className="text-lg font-semibold mr-3 text-neutral-800 dark:text-neutral-200">
          <span className='flex items-center gap-2'>
            <FolderIcon />
            Folders
          </span>
        </h2>
        <CustomDialogTrigger
          header="Create A Folder"
          content={<FolderCreator user={user} />}
          description="Create a new folder to never get lost in your konwledge again."
        >
          <Plus />
        </CustomDialogTrigger>
      </div>
      <div className="mt-2 space-y-1 pl-5">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isActive={folder.id === folderId}
          />
        ))}
      </div>
    </div>
  );
}

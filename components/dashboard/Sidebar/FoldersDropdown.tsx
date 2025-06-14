'use client';

import { useAppState } from '@/lib/providers/app-state-provider';
import React, { useEffect, useState } from 'react';
import SelectedFolder from './SelectedFolder';
import CustomDialogTrigger from '@/components/CustomDialogTrigger';
import FolderCreator from '@/components/dashboard/FolderCreator';
import { Folder } from '@/types/Folder';
import { User } from '@/types/User';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FoldersDropdownProps {
  user: User;
  folders: Folder[] | [];
  defaultValue?: Folder;
}

export default function FoldersDropdown ({ folders, defaultValue, user }: FoldersDropdownProps) {
  const { dispatch, state, noteId } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!state.folders.length) {
      dispatch({
        type: 'SET_FOLDERS',
        payload: {
          folders: folders,
        },
      });
    }
  }, [folders]);

  const handleSelect = (option: Folder) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleOnClick = () => {
    if (noteId && defaultValue) {
      toast.info("Loading the folder...", {duration: 1000});
      router.push(`/dashboard/${defaultValue.id}`);
      return;
    }
    setIsOpen((prev) => !prev);
    return;
  };

  useEffect(() => {
    const findSelectedFolder = state.folders.find(
      (folder) => folder.id === defaultValue?.id
    );
    if (findSelectedFolder) setSelectedOption(findSelectedFolder);
  }, [state, defaultValue]);

  return (
    <>
      <div className="relative inline-block text-left cursor-pointer">
        <div>
          <span onClick={() => handleOnClick()}>
            {selectedOption ? (
              <SelectedFolder folder={selectedOption} />
            ) : (
              'Select a folder'
            )}
          </span>
          
        </div>
      </div>
      {isOpen && (
      <>
        <div className='fixed inset-0 z-40 bg-black/10' onClick={() => setIsOpen(false)} />
        <div className="origin-top-right absolute mt-1 w-48 rounded-lg shadow-xl z-50 max-h-48 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1 overflow-y-auto max-h-44">
            {!!folders.length && (
              <div className="px-1">
                {folders.map((option) => (
                  <SelectedFolder
                    key={option.id}
                    folder={option}
                    onClick={handleSelect}
                  />
                ))}
              </div>
            )}
            <div className="border-t border-neutral-100 dark:border-neutral-700 mt-1">
              <CustomDialogTrigger
                header="Create A Folder"
                content={<FolderCreator user={user} />}
                description="Create a new folder to never get lost in your konwledge again."
              >
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-xs font-medium">
                    +
                  </div>
                  Create folder
                </div>
              </CustomDialogTrigger>
            </div>
          </div>
        </div>
      </>
    )}
  </>
  );
};

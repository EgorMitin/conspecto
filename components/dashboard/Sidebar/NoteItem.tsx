'use client';

import { useAppState } from '@/lib/providers/app-state-provider';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import EmojiPicker from '@/components/emoji-picker';
import { toast } from 'sonner';
import TooltipComponent from '@/components/tooltip';
import { Trash } from 'lucide-react';
import { updateNote } from '@/lib/server_actions/notes';
import Loader from '@/components/Loader';

interface NoteItemProps {
  title: string;
  id: string;
  iconId: string;
  children?: React.ReactNode;
}

export default function NoteItem({
  title,
  id,
  iconId,
  children,
}: NoteItemProps) {
  const { state, dispatch, folderId, noteId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [isNavigating, setIsNavigating] = useState(false);
  const [newEmoji, setNewEmoji] = useState(iconId);
  const router = useRouter();

  const noteTitleFromState: string | undefined = useMemo(() => {
    const stateTitle = state.folders
      .find((folder) => folder.id === folderId)
      ?.notes.find((note) => note.id === id)?.title;
    if (title === stateTitle || !stateTitle) return title;
    return stateTitle || title;
  }, [state, folderId, id, title]);

  useEffect(() => {
    if (!isEditing) {
      setLocalTitle(noteTitleFromState);
    }
  }, [noteTitleFromState, isEditing]);

  const navigatePage = () => {
    if (noteId === id) return;

    setIsNavigating(true);
    console.log('Navigating to note:', id);

    toast.info('Loading note...', { duration: 2000 });

    router.push(`/dashboard/${folderId}/${id}`);

    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    if (!isEditing) return;
    setIsEditing(false);
    if (!localTitle) return;

    if (folderId) {
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          note: { title: localTitle },
          noteId: id,
          folderId,
        },
      });
    }

    const updatePromise = updateNote(id, { title: localTitle });
    toast.promise(updatePromise, {
      loading: 'Updating note title...',
      success: 'Note title updated successfully.',
      error: 'Error! Could not update the title for this note.',
    });
  };

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!folderId) return;
    setNewEmoji(selectedEmoji);
    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        folderId,
        noteId: id,
        note: { iconId: selectedEmoji },
      },
    });
    const updatePromise = updateNote(id, { iconId: selectedEmoji });
    toast.promise(updatePromise, {
      loading: 'Updating emoji...',
      success: 'Emoji updated successfully.',
      error: 'Error! Could not update the emoji for this note.',
    });
  };

  const noteTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const moveToTrash = async () => {
    if (!folderId) return;
    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        note: { status: 'archived' },
        noteId: id,
        folderId,
      },
    });

    const updatePromise = updateNote(id, { status: 'archived' });
    toast.promise(updatePromise, {
      loading: 'Archiving note...',
      success: 'Note archived successfully.',
      error: 'Could not archive the note.',
    });
  };

  return (
    <div
      className='relative border-none text-md'
      onClick={(e) => {
        e.stopPropagation();
        if (e.currentTarget === e.target) {
          navigatePage();
        }
      }}
    >
      <div className={clsx(
        "flex p-2 dark:text-muted-foreground text-sm",
        {
          "bg-amber-100/60 dark:bg-amber-100/10 text-accent-foreground font-medium": id === noteId,
          "hover:bg-accent hover:text-accent-foreground": id !== noteId
        }
      )}>
        <div className='dark:text-white whitespace-nowrap flex justify-between items-center w-full relative group/note'>
          <div className="flex gap-4 items-center justify-center overflow-hidden">
            <div className="relative">
              {isNavigating && id !== noteId ? (
                <div className="flex items-center justify-center w-6 h-6">
                  <Loader />
                </div>
              ) : (
                <EmojiPicker getValue={onChangeEmoji}>{newEmoji}</EmojiPicker>
              )}
            </div>
            <input
              type="text"
              value={isEditing ? localTitle : noteTitleFromState}
              className={clsx(
                'outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',
                {
                  'bg-muted cursor-text': isEditing,
                  'bg-transparent cursor-pointer': !isEditing,
                  'opacity-70': isNavigating && id !== noteId,
                }
              )}
              readOnly={!isEditing}
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              onChange={noteTitleChange}
              onClick={(e) => {
                if (!isEditing) {
                  e.stopPropagation()
                  navigatePage();
                }
              }}
            />
          </div>
          <div className='h-full hidden rounded-sm absolute right-0 items-center justify-center group-hover/note:flex'>
            <TooltipComponent message="Delete Note">
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors mr-1"
              />
            </TooltipComponent>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
'use client';

import React, { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

import TooltipComponent from '@/components/tooltip';
import NoteItem from './NoteItem';

import { useAppState } from '@/lib/providers/app-state-provider';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { Note } from '@/types/Note';
import { User } from '@/types/User';
import { createNote } from '@/lib/server_actions/notes';

interface NotesDropdownListProps {
  user: User;
  notes: Note[];
  folderId: string;
}

export default function NotesDropdownList({ user, notes, folderId }: NotesDropdownListProps) {
  const { state, dispatch, noteId } = useAppState();
  const { setOpen } = useSubscriptionModal();
  const [notesInFolder, setNotesInFolder] = useState(notes);
  const { subscriptionPlan } = user;

  useEffect(() => {
    if (notes.length > 0) {
      dispatch({
        type: 'SET_NOTES',
        payload: {
          folderId,
          notes: notes
        },
      });
    }
  }, [notes, folderId]);

  useEffect(() => {
    setNotesInFolder(
      state.folders.find((folder) => folder.id === folderId)
        ?.notes || []
    );
  }, [state]);

  const addNoteHandler = async () => {
    if (notesInFolder.length >= 3 && !subscriptionPlan) {
      setOpen(true);
      return;
    }

    const newNote: Omit<Note, 'id' | "updatedAt" | "createdAt"> = {
      userId: user.id,
      folderId: folderId,
      title: 'Untitled',
      content: '',
      contentPlainText: '',
      isPublic: false,
      iconId: '📄',
      bannerUrl: '',
      status: 'draft',
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReview: new Date(),
      lastReview: new Date(),
      history: [],
      metadata: {},
    };

    const { data: note, error } = await createNote(newNote);
    if (error) {
      toast.error('Could not create a note');
      return;
    }
    if (note) {
      toast.info('New note created.');
      dispatch({
        type: 'ADD_NOTE',
        payload: { note, folderId },
      });
    }
  };

  return (
    <>
      <div className="flex sticky z-20 top-0 bg-background w-full h-10 group/title justify-between items-center pr-4 text-Neutrals/neutrals-8">
        <span className="text-Neutrals-8 font-bold text-xs ml-1">
          NOTES
        </span>
        <TooltipComponent message="Create Note">
          <PlusIcon
            onClick={addNoteHandler}
            size={16}
            className="group-hover/title:inline-block hidden cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>
      <div className="pb-20">
        {notes
          .filter((note) => note.status !== 'archived')
          .map((note) => (
            <NoteItem
              key={note.id}
              title={note.title}
              id={note.id}
              iconId={note.iconId}
            />
          ))}
      </div>
    </>
  );
};

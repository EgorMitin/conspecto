'use client';

import React, { useEffect, useState } from 'react';
import { useAppState } from '@/lib/providers/app-state-provider';
import { FileIcon, FolderIcon } from 'lucide-react';
import Link from 'next/link';
import { Note } from '@/types/Note';
import { Folder } from '@/types/Folder';

export default function TrashRestore() {
  const { state, folderId } = useAppState();
  const [folders, setFolders] = useState<Folder[] | []>([]);
  const [notes, setNotes] = useState<Note[] | []>([]);

  useEffect(() => {
    const stateFolders =
      state.folders.filter((folder) => folder.inTrash) || [];
    setFolders(stateFolders);

    let stateNotes: Note[] = [];
    state.folders.forEach((folder) => {
        folder.notes.forEach((note) => {
          if (note.status === 'archived') {
            stateNotes.push(note);
          }
        });
      });
    setNotes(stateNotes);
  }, [state, folderId]);

  return (
    <section>
      {!!folders.length && (
        <>
          <h3>Folders</h3>
          {folders.map((folder) => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex item-center justify-between"
              href={`/dashboard/${folder.id}`}
              key={folder.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FolderIcon />
                  {folder.name}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!!notes.length && (
        <>
          <h3>Notes</h3>
          {notes.map((note) => (
            <Link
              key={note.id}
              className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${note.folderId}/${note.id}`}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {note.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}
      {!notes.length && !folders.length && (
        <div
          className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2"
        >
          No Items in trash
        </div>
      )}
    </section>
  );
};
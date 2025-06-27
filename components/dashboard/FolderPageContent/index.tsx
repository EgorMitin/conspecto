'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, BookOpen, Trash, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppState } from '@/lib/providers/app-state-provider';
import { Note } from '@/types/Note';
import { User } from '@/types/User';
import { createNote, updateNote } from '@/lib/server_actions/notes';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderPageContentProps {
  notes: Note[];
  user: User;
}

export default function FolderPageContent({ notes: initialNotes, user }: FolderPageContentProps) {
  const router = useRouter();
  const { state, dispatch, folderId } = useAppState();
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  useEffect(() => {
    if (folderId) {
      const folderNotes = state.folders.find(folder => folder.id === folderId)?.notes || [];
      setNotes(folderNotes.filter(note => note.status !== 'archived'));
    }
  }, [state, folderId]);

  const handleCreateNote = async () => {
    if (!folderId || !user) return;

    const newNote: Omit<Note, 'id' | "updatedAt" | "createdAt"> = {
      userId: user.id,
      folderId: folderId,
      title: 'Untitled',
      content: '',
      contentPlainText: '',
      isPublic: false,
      iconId: '📄',
      bannerUrl: '',
      status: 'active',
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReview: new Date(),
      lastReview: new Date(),
      history: [],
      metadata: {},
    };

    const { data: note, error } = await createNote(newNote);
    if (error !== null) {
      toast.error('Could not create a note');
      return;
    }

    const appStateNote = {...note, questions: [], aiReviews: []};

    if (note) {
      toast.success('New note created');
      dispatch({
        type: 'ADD_NOTE',
        payload: { note: appStateNote, folderId, },
      });

      router.push(`/dashboard/${folderId}/${note.id}`);
    }
  };

  const handleEditNote = (noteId: string) => {
    router.push(`/dashboard/${folderId}/${noteId}`);
  };

  const handleStudyNote = (noteId: string) => {
    router.push(`/dashboard/${folderId}/${noteId}/study`);
  };

  const handleMoveToTrash = async (noteId: string) => {
    if (!folderId) return;

    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        note: { status: 'archived' },
        noteId: noteId,
        folderId,
      },
    });

    const { error } = await updateNote(noteId, { status: 'archived' });
    if (error) {
      toast.error('Could not move note to trash');
    } else {
      toast.success('Note moved to trash');
    }
  };

  const handleStudyFolder = () => {
    router.push(`/dashboard/${folderId}/study`);
  };

  const getContentPreview = (content: string) => {
    if (!content) return 'Empty note';
    return content.substring(0, 150) + '...';
  };

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Notes</h1>
        <div className="flex gap-2">
          <Button onClick={handleStudyFolder} variant="outline" className="flex items-center gap-2">
            <GraduationCap size={16} />
            Study Folder
          </Button>
          <Button onClick={handleCreateNote} className="flex items-center gap-2">
            <Plus size={16} />
            Create Note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <p className="text-muted-foreground mb-4">This folder is empty</p>
          <Button onClick={handleCreateNote}>Create your first note</Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-150px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {notes.map(note => (
              <Card key={note.id} className="hover:shadow-xl transition-shadow">
                <div onClick={() => handleEditNote(note.id)} className="cursor-pointer flex-grow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span>{note.iconId || '📄'}</span>
                      <span className="truncate">{note.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {getContentPreview(note.contentPlainText)}
                    </p>
                  </CardContent>
                </div>
                <CardFooter className="flex justify-between pt-2">
                  <Badge variant="outline">
                    {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditNote(note.id)}
                      title="Edit Note"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStudyNote(note.id)}
                      title="Study Note"
                    >
                      <BookOpen size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveToTrash(note.id)}
                      title="Move to Trash"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
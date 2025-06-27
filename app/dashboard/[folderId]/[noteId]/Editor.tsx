'use client';

import dynamic from 'next/dynamic';
import { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { saveEditorContentToDb } from './actions';
import { useUser } from '@/lib/context/UserContext';
import { AppNoteType, useAppState } from '@/lib/providers/app-state-provider';

// Dynamically import the Editor with SSR disabled
const EditorApp = dynamic(
  () => import("@/lib/Editor/App"),
  { ssr: false }
);

export default function Editor({ note }: { note: AppNoteType }) {
  const { user } = useUser()
  const { dispatch } = useAppState();
  if (!user) return;

  const saveNoteToDb = async (content: SerializedEditorState<SerializedLexicalNode>) => {
    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        noteId: note.id,
        folderId: note.folderId,
        note: { content: JSON.stringify(content) }
      }
    });
    const result = await saveEditorContentToDb(content, note.id, user.id, note.content);

    return result;
  };

  return (
    <div className='max-w-full md:max-w-[85%] pl-1 pr-3 md:p-0 flex justify-center mx-auto w-full'>
      <EditorApp save={saveNoteToDb} content={note.content} />
    </div>
  );
}
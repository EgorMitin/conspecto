'use client';

import dynamic from 'next/dynamic';
import { SerializedEditorState, SerializedLexicalNode } from "lexical";
import { Note } from '@/types/Note';
import { saveEditorContentToDb } from './actions';
import { useUser } from '@/lib/context/UserContext';

// Dynamically import the Editor with SSR disabled
const EditorApp = dynamic(
  () => import("@/lib/Editor/App"),
  { ssr: false }
);

export default function Editor({ note }: { note: Note }) {
  const user = useUser()
  if (!user) return;

  const saveNoteToDb = async (content: SerializedEditorState<SerializedLexicalNode>) => {
    console.log('LOOOGGGGG!!!11111111')
    const result = await saveEditorContentToDb(content, note.id, user.id, note.content);

    return result;
  };

  return (
    <div className='max-w-[85%] flex justify-center mx-auto w-full'>
      <EditorApp save={saveNoteToDb} content={note.content} />
    </div>
  );
}
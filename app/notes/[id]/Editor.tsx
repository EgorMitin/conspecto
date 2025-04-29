'use client';

import dynamic from 'next/dynamic';
import { SerializedEditorState, SerializedLexicalNode } from "lexical";

// Dynamically import the Editor with SSR disabled
const EditorApp = dynamic(
  () => import("@/lib/Editor/App"),
  { ssr: false }
);

export default async function Editor({
  save,
  content
}:{
  save?: (content: SerializedEditorState<SerializedLexicalNode>) => Promise<{success: boolean; id?: string; message?: string}>,
  content: string
}) {
  return (
    <EditorApp save={save} content={content} />
  );
}
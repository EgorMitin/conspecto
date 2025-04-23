'use client';
import dynamic from 'next/dynamic';

// Dynamically import the Editor with SSR disabled
const EditorApp = dynamic(
  () => import("@/lib/Editor/App"),
  { ssr: false }
);


export default function Editor() {
  return (
    <EditorApp />
  );
}
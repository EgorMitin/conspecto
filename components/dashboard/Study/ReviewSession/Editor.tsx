import dynamic from "next/dynamic";

const EditorApp = dynamic(
  () => import("@/lib/Editor/Review"),
  { ssr: false }
);

export default function ReviewEditor({ content = '' }: { content?: string; }) {
  return <EditorApp key={content} content={content} />;
}
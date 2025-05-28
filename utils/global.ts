import { type ClassValue, clsx } from 'clsx';
import { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractPlainTextFromState(content: string): string {
  let plainText = '';

  const editorState: SerializedEditorState<SerializedLexicalNode> | null = JSON.parse(content);
  
  // Traverse root and its children recursively
  function extractTextFromNode(node: SerializedLexicalNode): void {
    if (node.type === 'text') {
      plainText += (node as unknown as { text: string }).text;
    }
    
      if ('children' in node && Array.isArray((node as any).children)) {
        (node as any).children.forEach(extractTextFromNode);
      }
  }
  
  if (editorState && editorState.root) {
    extractTextFromNode(editorState.root);
  }
  
  return plainText;
}
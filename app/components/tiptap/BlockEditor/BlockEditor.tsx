import { EditorContent } from '@tiptap/react'
import { useRef } from 'react'
import type { EditorContentType } from '~/lib/types'
import { LinkMenu } from '../menus'

import { useBlockEditor } from '~/hooks/useBlockEditor'

import '../styles/index.css'

import { ImageBlockMenu } from '~/extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '~/extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '~/extensions/Table/menus'
import { EditorHeader } from './components/EditorHeader'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'

import { useFetcher, useLocation } from '@remix-run/react'



export default function BlockEditor ({
  initialContent,
  noteId
}: {
  initialContent: EditorContentType | null
  noteId: string
}) {
  const menuContainerRef = useRef(null)
  const fetcher = useFetcher()
  const isStudyMode = useLocation().pathname.endsWith('/study')

  const onChange = (content: string) => {
    fetcher.submit(
      { content },
      { method: "post", action: `/dashboard/notes/${noteId}` },
    );
  };

  const editor = useBlockEditor({
    initialContent,
    onChange,
    isStudyMode
  })

  if (!editor) {
    return null
  }

  return (
    <div className="relative flex flex-col flex-1 h-full overflow-visible" ref={menuContainerRef}>
        <EditorHeader editor={editor} />
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <ContentItemMenu editor={editor} isEditable={!isStudyMode} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
    </div>
  )
}
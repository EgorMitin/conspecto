import { useEditor } from '@tiptap/react'
import type { AnyExtension, Editor, EditorOptions } from '@tiptap/core'

import { ExtensionKit } from '~/extensions/extension-kit'
import type { EditorContentType } from '~/lib/types'

declare global {
  interface Window {
    editor: Editor | null
  }
}

export const useBlockEditor = ({
  initialContent,
  onChange,
  ...editorOptions
}: {
  initialContent: EditorContentType | null
  onChange: (content: string) => void
} & Partial<Omit<EditorOptions, 'extensions'>>) => {

  initialContent = initialContent || {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      }
    ]
  }

  const editor = useEditor(
    {
      ...editorOptions,
      immediatelyRender: true,
      shouldRerenderOnTransaction: false,
      autofocus: true,
      onCreate: ctx => {
        if (ctx.editor.isEmpty) {
          ctx.editor.commands.setContent(initialContent)
          ctx.editor.commands.focus('start', { scrollIntoView: true })
        }
        console.count("editor create")
      },
      onUpdate: ({ editor }) => {
        // Convert editor content to JSON string and call onChange
        const content = JSON.stringify(editor.getJSON())
        onChange(content)
        console.count("editor update")
      },
      extensions: [
        ...ExtensionKit({}),
      ].filter((e): e is AnyExtension => e !== undefined),
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          class: 'min-h-full',
        },
      },
    },
    [],
  )

  window.editor = editor

  return editor
}

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
  onChange?: (content: string) => void
} & Partial<Omit<EditorOptions, 'extensions'>>) => {

  const editor = useEditor(
    {
      ...editorOptions,
      immediatelyRender: true,
      content: initialContent,
      shouldRerenderOnTransaction: false,
      autofocus: true,
      onCreate: ctx => {
        if (ctx.editor.isEmpty) {
          ctx.editor.commands.setContent(initialContent)
          ctx.editor.commands.focus('start', { scrollIntoView: true })
        }
      },
      onUpdate: ({ editor }) => {
        // Convert editor content to JSON string and call onChange
        const content = JSON.stringify(editor.getJSON())
        onChange?.(content)
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

  return { editor }
}

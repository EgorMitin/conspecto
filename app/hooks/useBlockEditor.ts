import { useEditor } from '@tiptap/react'
import type { AnyExtension, Editor, EditorOptions } from '@tiptap/core'

import { ExtensionKit } from '~/extensions/extension-kit'
import type { EditorContentType } from '~/lib/types'

declare global {
  interface Window {
    editor: Editor | null
  }
}

const getAllQaMarks = (editor) => {
  const { doc } = editor.state
  const qas = []
  doc.descendants((node, pos) => {
    if (node.isText) {
      const marks = node.marks.filter(mark => mark.type.name === 'qa')
      if (marks.length) {
        marks.forEach(mark => {
          qas.push({
            text: node.text,
            pos,
            mark
          })
        })
      }
    }
  })
  return qas
}

const getAllQaMarksToRepeat = (editor) => {
  const { doc } = editor.state
  const qas = []
  const today = new Date()
    .toLocaleString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      })
    .replace(",", "")
  doc.descendants((node, pos, from, to) => {
    if (node.isText) {
      const marks = node.marks.filter(mark => mark.type.name === 'qa' && mark.attrs.nextRep === today)
      if (marks.length) {
        marks.forEach(mark => {
          qas.push({
            text: node.text,
            pos,
            mark,
            from,
            to
          })
        })
      }
    }
  })
  return qas
}

const setActiveQaOff = (editor) => {
  const { doc } = editor.state
  doc.descendants((node, pos) => {
    if (node.isText) {
      const marks = node.marks.filter(mark => mark.type.name === 'qa' && mark.attrs.status === "active")
      if (marks.length) {
        marks.forEach(mark => {
          editor.chain().focus(pos).extendMarkRange('qa').updateQaStatus("default").run()
        })
      }
    }
  })
}


export const useBlockEditor = ({
  initialContent,
  onChange,
  isStudyMode,
  ...editorOptions
}: {
  initialContent: EditorContentType | null
  onChange: (content: string) => void
  isStudyMode: boolean
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
      editable: !isStudyMode,

      onCreate: ({ editor }) => {
        if (editor.isEmpty) {
          editor.commands.setContent(initialContent)
          editor.commands.focus('start', { scrollIntoView: true })
        }
        setActiveQaOff(editor)
        if (isStudyMode) {
          editor.storage.qa.status = "question"
          const allQasToRepeat = getAllQaMarksToRepeat(editor)
          const randomQa = allQasToRepeat[Math.floor(Math.random() * allQasToRepeat.length)]
          editor.chain().focus(randomQa.pos).extendMarkRange('qa').updateQaStatus("active").run()
        }
      },

      onUpdate: ({ editor }) => {
        const content = JSON.stringify(editor.getJSON())
        onChange(content)
        console.count("EDITOR UPDATE")
      },

      extensions: [
        ...ExtensionKit(),
      ].filter((e): e is AnyExtension => e !== undefined),

      editorProps: {
        attributes: {
          'data-study-mode': isStudyMode,
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

import { Icon } from '../../ui/Icon'
import { EditorInfo } from './EditorInfo'
import { Toolbar } from '../../ui/Toolbar'
import { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { useCallback } from 'react'

export type EditorHeaderProps = {
  editor: Editor
}

export const EditorHeader = ({ editor }: EditorHeaderProps) => {
  const { characters, words } = useEditorState({
    editor,
    selector: (ctx): { characters: number; words: number } => {
      const { characters, words } = ctx.editor?.storage.characterCount || { characters: () => 0, words: () => 0 }
      return { characters: characters(), words: words() }
    },
  })

  const toggleEditable = useCallback(() => {
    editor.setOptions({ editable: !editor.isEditable })
    // force update the editor
    editor.view.dispatch(editor.view.state.tr)
  }, [editor])

  return (
    <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-white border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <Toolbar.Button tooltip={editor.isEditable ? 'Disable editing' : 'Enable editing'} onClick={toggleEditable}>
            <Icon name={editor.isEditable ? 'PenOff' : 'Pen'} />
          </Toolbar.Button>
        </div>
      </div>
      <EditorInfo characters={characters} words={words} />
    </div>
  )
}

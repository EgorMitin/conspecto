import { Icon } from '../../ui/Icon'
import { Toolbar } from '../../ui/Toolbar'
import { Editor } from '@tiptap/react'

import * as Popover from '@radix-ui/react-popover'
import { Surface } from '../../ui/Surface'
import { DropdownButton } from '../../ui/Dropdown'
import useContentItemActions from './hooks/useContentItemActions'
import { useData } from './hooks/useData'
import { useEffect, useState } from 'react'

export type ContentItemMenuProps = {
  editor: Editor
  isEditable?: boolean
}

export const ContentItemMenu = ({ editor, isEditable = true }: ContentItemMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const data = useData()
  const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos)

  useEffect(() => {
    const updateCurrentNode = ({ editor }: { editor: Editor }) => {
      const { selection, doc } = editor.state
      const pos = selection.anchor
      const node = pos >= 0 ? doc.nodeAt(pos) : null

      data.handleNodeChange({
        node,
        editor,
        pos
      })
    }

    // Listen for selection changes
    editor.on('selectionUpdate', updateCurrentNode)
    // Initial update
    updateCurrentNode({ editor })

    return () => {
      editor.off('selectionUpdate', updateCurrentNode)
    }
  }, [editor, data])

  return (
    <>
      {isEditable
      ? (
      <div className="flex items-center gap-0.5">
          <Toolbar.Button onClick={actions.handleAdd}>
            <Icon name="Plus" />
          </Toolbar.Button>
          <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Popover.Trigger asChild>
              <Toolbar.Button>
                <Icon name="GripVertical" />
              </Toolbar.Button>
            </Popover.Trigger>
            <Popover.Content side="bottom" align="start" sideOffset={8}>
              <Surface className="p-2 flex flex-col min-w-[16rem]">
                <Popover.Close>
                  <DropdownButton onClick={actions.resetTextFormatting}>
                    <Icon name="RemoveFormatting" />
                    Clear formatting
                  </DropdownButton>
                </Popover.Close>
                <Popover.Close>
                  <DropdownButton onClick={actions.copyNodeToClipboard}>
                    <Icon name="Clipboard" />
                    Copy to clipboard
                  </DropdownButton>
                </Popover.Close>
                <Popover.Close>
                  <DropdownButton onClick={actions.duplicateNode}>
                    <Icon name="Copy" />
                    Duplicate
                  </DropdownButton>
                </Popover.Close>
                <Toolbar.Divider horizontal />
                <Popover.Close>
                  <DropdownButton
                    onClick={actions.deleteNode}
                    className="text-red-500 bg-red-500 dark:text-red-500 hover:bg-red-500 dark:hover:text-red-500 dark:hover:bg-red-500 bg-opacity-10 hover:bg-opacity-20 dark:hover:bg-opacity-20"
                  >
                    <Icon name="Trash2" />
                    Delete
                  </DropdownButton>
                </Popover.Close>
              </Surface>
            </Popover.Content>
          </Popover.Root>
        </div>
      ) : <div></div>}
    </>
  )
}

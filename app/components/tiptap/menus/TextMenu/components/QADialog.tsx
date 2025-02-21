import * as Dialog from '@radix-ui/react-dialog'
// import { Button } from '../../../ui/Button'
import { Button } from '~/components/ui/button'
import { useState, useEffect } from 'react'

interface QaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (question: string) => void
  onDelete: () => void
  value?: string
}

export const QADialog = ({ open, onOpenChange, onSave, onDelete, value = '' }: QaDialogProps) => {
  const [question, setQuestion] = useState(value)
  useEffect(() => {
    setQuestion(String(value))
  }, [value])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-primary/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-foreground rounded-lg p-6 w-[400px] shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add Question
          </Dialog.Title>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded-md p-2 mb-4 bg-input"
            placeholder="Enter your question..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              onOpenChange(false)
              onDelete()
            }}>
              delete
            </Button>
            <Button onClick={() => {
              onSave(question)
              onOpenChange(false)
            }}>
              Save
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
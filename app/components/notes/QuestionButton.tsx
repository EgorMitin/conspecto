// QuestionButton.tsx
import { useBlockNoteEditor, useComponentsContext } from "@blocknote/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useState } from "react";

export function QAButton() {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [selectedText, setSelectedText] = useState("");

  const handleCreateCard = () => {
    const selection = editor.getSelectedText();
    if (selection) {
      setSelectedText(selection);
      setIsDialogOpen(true);
    }
  };

  const handleSaveCard = () => {
    if (question && selectedText) {
      editor.focus();

      const text = editor.getSelectedText();
      editor.insertInlineContent([
        {
          type: "text",
          text: `Q: ${question}   `,
          styles: {
            backgroundColor: "",
            textColor: "default",
            bold: true,
            italic: false,
          },
        },
        {
          type: "text",
          text: `Answer: ${text}`,
          styles: {
            backgroundColor: "yellow",
            textColor: "default",
            bold: true,
            italic: false,
          },
        },
        {
          type: "text",
          text: ` `,
          styles: {
            textColor: "default",
          },
        },
      ]);
      editor.toggleStyles({ backgroundColor: "blue/10" });

      setIsDialogOpen(false);
      setQuestion("");
    }
  };

  return (
    <>
      <Components.FormattingToolbar.Button
        mainTooltip="Create Q&A Card"
        onClick={handleCreateCard}
        isSelected={false}
      >
        Q&A
      </Components.FormattingToolbar.Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Question-Answer Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Answer:</label>
              <p className="mt-1 p-2 bg-secondary/50 rounded">{selectedText}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Question:</label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCard}>Save Card</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

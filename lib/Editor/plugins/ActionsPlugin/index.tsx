import type { LexicalEditor, SerializedLexicalNode } from 'lexical';
import type { JSX } from 'react';

import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  SerializedDocument,
  serializedDocumentFromEditorState,
} from '@lexical/file';
import { useCollaborationContext } from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useState, useRef } from 'react';

import { INITIAL_SETTINGS } from '../../appSettings';
import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import { docFromHash, docToHash } from '../../utils/docSerialization';
import {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION,
} from '../SpeechToTextPlugin';
import type { SerializedEditorState } from 'lexical';

import {
  FiMic,
  FiUpload,
  FiDownload,
  FiSave,
  FiShare2,
  FiTrash2,
  FiLoader
} from 'react-icons/fi';
import { useAppState } from '@/lib/providers/app-state-provider';
import { toast } from 'sonner';


// Debounce function to prevent too many API calls
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(window.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, '', newUrl);
  await window.navigator.clipboard.writeText(newUrl);
}

export default function ActionsPlugin({
  isRichText,
  shouldPreserveNewLinesInMarkdown,
  saveFunction,
}: {
  isRichText: boolean;
  shouldPreserveNewLinesInMarkdown: boolean;
  saveFunction?: (content: SerializedEditorState<SerializedLexicalNode>) => Promise<{ success: boolean; id?: string; message?: string }>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, showModal] = useModal();
  const { isCollabActive } = useCollaborationContext();

  const { noteId } = useAppState()
  const lastSavedContentRef = useRef<SerializedEditorState<SerializedLexicalNode> | null>(null);

  // Create a debounced save function to avoid too many saves
  const debouncedSave = useCallback(
    debounce(async () => {
      if (!saveFunction) return;
      const currentContent = editor.getEditorState().toJSON();

      // Don't save if content hasn't changed since last save
      if (currentContent === lastSavedContentRef.current) {
        return;
      }

      setIsSaving(true);
      try {
        const result = await saveFunction(currentContent);
        if (result.success) {
          lastSavedContentRef.current = currentContent;
        } else {
          toast.error(result.message || 'Failed to save note');
        }
        setIsSaving(false);
      } catch (error) {
        console.log(error)
        setIsSaving(false)
      }
    }, 2000), // 2 second debounce
    [editor, saveFunction]
  );

  useEffect(() => {
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === 'Playground') {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);

  // Register update listener to detect changes and trigger auto-save
  useEffect(() => {
    return editor.registerUpdateListener(
      ({ dirtyElements }) => {

        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
          } else {
            if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren();
              setIsEditorEmpty(paragraphChildren.length === 0);
            } else {
              setIsEditorEmpty(false);
            }
          }
        });

        // Trigger auto-save if content has changed and is not empty and noteId is present
        if (dirtyElements.size > 0 && !isEditorEmpty && noteId) {
          debouncedSave();
        }
      },
    );
  }, [editor, isEditable, isEditorEmpty, debouncedSave, noteId]);

  const handleForceSave = async () => {
    if (!saveFunction) return

    setIsSaving(true);
    const currentContent = editor.getEditorState().toJSON();
    const result = await saveFunction(currentContent);

    if (result.success) {
      editor.getEditorState().read(() => {
        lastSavedContentRef.current = currentContent;
      });
      toast.success('Note saved successfully');
    } else {
      toast.error(result.message || 'Failed to save note');
    }

    setIsSaving(false);
  };

  return (
    <div className="actions">
      {SUPPORT_SPEECH_RECOGNITION && (
        <button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          className={
            'action-button action-button-mic ' +
            (isSpeechToText ? 'active' : '')
          }
          title="Speech To Text"
          aria-label={`${isSpeechToText ? 'Enable' : 'Disable'
            } speech to text`}>
          <FiMic />
        </button>
      )}
      <button
        className="action-button import"
        onClick={() => importFile(editor)}
        title="Import"
        aria-label="Import editor state from JSON">
        <FiUpload />
      </button>

      <button
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `${noteId} ${new Date().toISOString()}`,
            source: 'Conspecto',
          })
        }
        title="Export"
        aria-label="Export editor state to JSON">
        <FiDownload />
      </button>

      {/* Save button */}
      <button
        className={`action-button save ${isSaving ? 'active' : ''}`}
        onClick={handleForceSave}
        disabled={isEditorEmpty || isSaving || !noteId}
        title="Save"
        aria-label="Save note to database">
        {isSaving ? <FiLoader className="icon-spin" /> : <FiSave />}
      </button>

      <button
        className="action-button share"
        disabled={isCollabActive || INITIAL_SETTINGS.isCollab}
        onClick={() =>
          shareDoc(
            serializedDocumentFromEditorState(editor.getEditorState(), {
              source: 'Conspecto',
            }),
          ).then(
            () => toast.info('URL copied to clipboard'),
            () => toast.error('URL could not be copied to clipboard'),
          )
        }
        title="Share"
        aria-label="Share link to current editor state">
        <FiShare2 />
      </button>
      <button
        className="action-button clear"
        disabled={isEditorEmpty}
        onClick={() => {
          showModal('Clear editor', (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
          ));
        }}
        title="Clear"
        aria-label="Clear editor contents">
        <FiTrash2 />
      </button>
      {modal}
    </div>
  );
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}>
          Clear
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus();
            onClose();
          }}>
          Cancel
        </Button>
      </div>
    </>
  );
}


import type {LexicalEditor} from 'lexical';
import type {JSX} from 'react';

import {$createCodeNode, $isCodeNode} from '@lexical/code';
import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  SerializedDocument,
  serializedDocumentFromEditorState,
} from '@lexical/file';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';
import {useCollaborationContext} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import {
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COLLABORATION_TAG,
  COMMAND_PRIORITY_EDITOR,
  HISTORIC_TAG,
} from 'lexical';
import {useCallback, useEffect, useState, useRef} from 'react';
import {useParams} from 'next/navigation';

import {INITIAL_SETTINGS} from '../../appSettings';
import useFlashMessage from '../../hooks/useFlashMessage';
import useModal from '../../hooks/useModal';
import Button from '../../ui/Button';
import {docFromHash, docToHash} from '../../utils/docSerialization';
import {PLAYGROUND_TRANSFORMERS} from '../MarkdownTransformers';
import {
  SPEECH_TO_TEXT_COMMAND,
  SUPPORT_SPEECH_RECOGNITION,
} from '../SpeechToTextPlugin';

// Debounce function to prevent too many API calls
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return function(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Save editor content to PostgreSQL database via API
 */
async function saveEditorContentToDb(
  editor: LexicalEditor, 
  noteId: string,
  title: string
): Promise<{success: boolean; id?: string; message?: string}> {
  try {
    // Convert editor state to markdown for storing in DB
    let content = '';
    editor.getEditorState().read(() => {
      content = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
    });

    // If content is empty, don't save
    if (!content.trim()) {
      return { success: false, message: 'Content is empty' };
    }

    // Create payload for API
    const payload = {
      id: noteId, // Always use the ID from the route params
      title: title || 'Untitled Note',
      content,
      userId: 'anonymous' // Use anonymous user for now
    };

    // Send to API
    const response = await fetch('/api/notes/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    return { 
      success: result.success,
      id: result.note?.id,
      message: result.message || 'Failed to save note'
    };
  } catch (error) {
    console.error('Error saving note:', error);
    return { success: false, message: 'Error saving note' };
  }
}

async function validateEditorState(editor: LexicalEditor): Promise<void> {
  const stringifiedEditorState = JSON.stringify(editor.getEditorState());
  let response = null;
  try {
    response = await fetch('http://localhost:1235/validateEditorState', {
      body: stringifiedEditorState,
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    // NO-OP
  }
  if (response !== null && response.status === 403) {
    throw new Error(
      'Editor state validation failed! Server did not accept changes.',
    );
  }
}

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(window.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, '', newUrl);
  await window.navigator.clipboard.writeText(newUrl);
}

/**
 * Load note from database using the path parameter
 */
async function loadNoteFromDb(noteId: string): Promise<{success: boolean; note?: any}> {
  try {
    const response = await fetch(`/api/notes/load/${noteId}`);
    const data = await response.json();
    
    if (response.ok && data.note) {
      return { success: true, note: data.note };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error loading note:', error);
    return { success: false };
  }
}

export default function ActionsPlugin({
  isRichText,
  shouldPreserveNewLinesInMarkdown,
}: {
  isRichText: boolean;
  shouldPreserveNewLinesInMarkdown: boolean;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, showModal] = useModal();
  const showFlashMessage = useFlashMessage();
  const {isCollabActive} = useCollaborationContext();
  const params = useParams();
  const noteId = params.id as string; // Get ID from route params
  const lastSavedContentRef = useRef<string>('');
  const [noteTitle, setNoteTitle] = useState('Untitled Note');
  
  // Create a debounced save function to avoid too many saves
  const debouncedSave = useCallback(
    debounce(async (noteId: string) => {
      let currentContent = '';
      editor.getEditorState().read(() => {
        currentContent = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
      });
      
      // Don't save if content hasn't changed since last save
      if (currentContent === lastSavedContentRef.current) {
        return;
      }
      
      setIsSaving(true);
      const result = await saveEditorContentToDb(editor, noteId, noteTitle);
      
      if (result.success) {
        lastSavedContentRef.current = currentContent;
        showFlashMessage('Note saved');
      } else {
        showFlashMessage(result.message || 'Failed to save note');
      }
      
      setIsSaving(false);
    }, 2000), // 2 second debounce
    [editor, noteTitle]
  );

  // Load note from database if ID is present
  useEffect(() => {
    if (noteId) {
      loadNoteFromDb(noteId).then(({success, note}) => {
        if (success && note) {
          // Set title
          setNoteTitle(note.title);
          
          // Set content
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            
            // Import markdown content
            $convertFromMarkdownString(
              note.content,
              PLAYGROUND_TRANSFORMERS,
              undefined,
              shouldPreserveNewLinesInMarkdown,
            );
            
            // Save initial content reference
            lastSavedContentRef.current = note.content;
          });
          
          showFlashMessage('Note loaded');
        }
      });
    }
  }, [noteId, editor, shouldPreserveNewLinesInMarkdown, showFlashMessage]);

  useEffect(() => {
    if (INITIAL_SETTINGS.isCollab) {
      return;
    }
    docFromHash(window.location.hash).then((doc) => {
      if (doc && doc.source === 'Playground') {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);
  
  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerCommand<boolean>(
        CONNECTED_COMMAND,
        (payload) => {
          const isConnected = payload;
          setConnected(isConnected);
          return false;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  // Register update listener to detect changes and trigger auto-save
  useEffect(() => {
    return editor.registerUpdateListener(
      ({dirtyElements, prevEditorState, tags}) => {
        // If we are in read only mode, validate editor state
        if (
          !isEditable &&
          dirtyElements.size > 0 &&
          !tags.has(HISTORIC_TAG) &&
          !tags.has(COLLABORATION_TAG)
        ) {
          validateEditorState(editor);
        }
        
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
          debouncedSave(noteId);
        }
      },
    );
  }, [editor, isEditable, isEditorEmpty, debouncedSave, noteId]);

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === 'markdown') {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS,
          undefined, // node
          shouldPreserveNewLinesInMarkdown,
        );
      } else {
        const markdown = $convertToMarkdownString(
          PLAYGROUND_TRANSFORMERS,
          undefined, //node
          shouldPreserveNewLinesInMarkdown,
        );
        const codeNode = $createCodeNode('markdown');
        codeNode.append($createTextNode(markdown));
        root.clear().append(codeNode);
        if (markdown.length === 0) {
          codeNode.select();
        }
      }
    });
  }, [editor, shouldPreserveNewLinesInMarkdown]);

  // Force save handler for the save button
  const handleForceSave = async () => {
    if (!noteId) {
      showFlashMessage('Cannot save note without ID');
      return;
    }
    
    setIsSaving(true);
    const result = await saveEditorContentToDb(editor, noteId, noteTitle);
    
    if (result.success) {
      editor.getEditorState().read(() => {
        lastSavedContentRef.current = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
      });
      showFlashMessage('Note saved successfully');
    } else {
      showFlashMessage(result.message || 'Failed to save note');
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
          aria-label={`${
            isSpeechToText ? 'Enable' : 'Disable'
          } speech to text`}>
          <i className="mic" />
        </button>
      )}
      <button
        className="action-button import"
        onClick={() => importFile(editor)}
        title="Import"
        aria-label="Import editor state from JSON">
        <i className="import" />
      </button>

      <button
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `${noteTitle} ${new Date().toISOString()}`,
            source: 'Conspecto',
          })
        }
        title="Export"
        aria-label="Export editor state to JSON">
        <i className="export" />
      </button>
      
      {/* Save button */}
      <button
        className={`action-button save ${isSaving ? 'active' : ''}`}
        onClick={handleForceSave}
        disabled={isEditorEmpty || isSaving || !noteId}
        title="Save"
        aria-label="Save note to database">
        <i className={isSaving ? 'loading' : 'save'} />
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
            () => showFlashMessage('URL copied to clipboard'),
            () => showFlashMessage('URL could not be copied to clipboard'),
          )
        }
        title="Share"
        aria-label="Share link to current editor state">
        <i className="share" />
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
        <i className="clear" />
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

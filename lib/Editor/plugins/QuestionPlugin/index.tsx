import type {
  EditorState,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
  RangeSelection,
} from 'lexical';
import type { JSX } from 'react';

import './index.css';

import {
  $createMarkNode,
  $getMarkIDs,
  $isMarkNode,
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
  MarkNode,
} from '@lexical/mark';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { createDOMRange, createRectsFromDOMRange } from '@lexical/selection';
import { $isRootTextContentEmpty, $rootTextContent } from '@lexical/text';
import { mergeRegister, registerNestedElementResolver } from '@lexical/utils';
import {
  $getNodeByKey,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  getDOMSelection,
  KEY_ESCAPE_COMMAND,
  CLICK_COMMAND,
} from 'lexical';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import {
  QuestionStore,
  useQuestionStore,
} from '../../QuestionStorage';
import useModal from '../../hooks/useModal';
import CommentEditorTheme from '../../themes/CommentEditorTheme';
import Button from '../../ui/Button';
import ContentEditable from '../../ui/ContentEditable';
import { Question, Questions } from '@/types/Question';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useUser } from '@/lib/context/UserContext';
import { LucideMailQuestion, LucideShieldQuestion, Trash2 } from 'lucide-react';
import { useReviewStore } from '@/lib/stores/review-store';

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_INLINE_COMMAND',
);

export const SUBMIT_QUESTION_COMMAND: LexicalCommand<KeyboardEvent> = createCommand(
  'SUBMIT_QUESTION_COMMAND',
);

function createQuestion(userId: string, questionText: string, answerText: string, noteId: string): Question {
  const now = new Date();

  return {
    id: `q-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    noteId,
    userId,
    question: questionText,
    answer: answerText,
    timeStamp: Date.now(),
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    nextReview: now,
    lastReview: now,
    history: []
  };
}


function AddQuestionBox({
  anchorKey,
  editor,
  onAddQuestion,
}: {
  anchorKey: NodeKey;
  editor: LexicalEditor;
  onAddQuestion: () => void;
}): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const boxElem = boxRef.current;
    const rootElement = editor.getRootElement();
    const anchorElement = editor.getElementByKey(anchorKey);

    if (boxElem !== null && rootElement !== null && anchorElement !== null) {
      const { right } = rootElement.getBoundingClientRect();
      const { top } = anchorElement.getBoundingClientRect();
      boxElem.style.left = `${right - 20}px`;
      boxElem.style.top = `${top - 30}px`;
    }
  }, [anchorKey, editor]);

  useEffect(() => {
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [editor, updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [anchorKey, editor, updatePosition]);

  return (
    <div className="CommentPlugin_AddCommentBox" ref={boxRef}>
      <button
        className="CommentPlugin_AddCommentBox_button"
        onClick={onAddQuestion}>
        <i className="icon add-comment" />
      </button>
    </div>
  );
}

function EscapeHandlerPlugin({
  onEscape,
}: {
  onEscape: (e: KeyboardEvent) => boolean;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event: KeyboardEvent) => {
        return onEscape(event);
      },
      2,
    );
  }, [editor, onEscape]);

  return null;
}

function SubmitHandlerPlugin({
  onSubmit,
}: {
  onSubmit: () => void;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      SUBMIT_QUESTION_COMMAND,
      (_event: KeyboardEvent) => {
        onSubmit();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, onSubmit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault();
        editor.dispatchCommand(SUBMIT_QUESTION_COMMAND, event);
      }
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener('keydown', handleKeyDown);
      return () => {
        rootElement.removeEventListener('keydown', handleKeyDown);
      };
    }

    // Fallback to window if no root element
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  return null;
}

function InitialContentPlugin({
  initialContent,
}: {
  initialContent: string;
}): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialContent) {
      editor.update(() => {
        const root = $getRoot();
        const paragraphNode = $createParagraphNode();
        const textNode = $createTextNode(initialContent);
        paragraphNode.append(textNode);
        root.clear();
        root.append(paragraphNode);

        textNode.select(initialContent.length, initialContent.length);
      });
    }
  }, [editor, initialContent]);

  return null;
}

function PlainTextEditor({
  className,
  autoFocus,
  onEscape,
  onChange,
  editorRef,
  placeholder = 'Type a question...',
  onSubmit,
  initialContent,
}: {
  autoFocus?: boolean;
  className?: string;
  editorRef?: { current: null | LexicalEditor };
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
  onEscape: (e: KeyboardEvent) => boolean;
  placeholder?: string;
  onSubmit?: () => void;
  initialContent?: string;
}) {
  const initialConfig = {
    namespace: 'Questions',
    nodes: [],
    onError: (error: Error) => {
      throw error;
    },
    theme: CommentEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="CommentPlugin_CommentInputBox_EditorContainer">
        <PlainTextPlugin
          contentEditable={
            <ContentEditable placeholder={placeholder} className={className} />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {autoFocus !== false && <AutoFocusPlugin />}
        <EscapeHandlerPlugin onEscape={onEscape} />
        <ClearEditorPlugin />
        {editorRef !== undefined && <EditorRefPlugin editorRef={editorRef} />}
        {onSubmit !== undefined && <SubmitHandlerPlugin onSubmit={onSubmit} />}
        {initialContent && <InitialContentPlugin initialContent={initialContent} />}
      </div>
    </LexicalComposer>
  );
}

function useOnChange(
  setContent: (text: string) => void,
  setCanSubmit: (canSubmit: boolean) => void,
) {
  return useCallback(
    (editorState: EditorState, _editor: LexicalEditor) => {
      editorState.read(() => {
        setContent($rootTextContent());
        setCanSubmit(!$isRootTextContentEmpty(_editor.isComposing(), true));
      });
    },
    [setCanSubmit, setContent],
  );
}

function QuestionInputBox({
  editor,
  cancelAddQuestion,
  submitAddQuestion,
}: {
  cancelAddQuestion: () => void;
  editor: LexicalEditor;
  submitAddQuestion: (
    question: Question,
    selection: RangeSelection | null,
  ) => void;
}) {
  const [question, setQuestion] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: [],
    }),
    [],
  );
  const selectionRef = useRef<RangeSelection | null>(null);
  const user = useUser();
  if (!user) return;
  const userId = user.id;
  const { noteId } = useAppState()

  const updateLocation = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset,
        );
        const boxElem = boxRef.current;
        if (range !== null && boxElem !== null) {
          const { left, bottom, width } = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft =
            selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${bottom +
            20 +
            (window.pageYOffset || document.documentElement.scrollTop)
            }px`;
          const selectionRectsLength = selectionRects.length;
          const { container } = selectionState;
          const elements: Array<HTMLSpanElement> = selectionState.elements;
          const elementsLength = elements.length;

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i];
            let elem: HTMLSpanElement = elements[i];
            if (elem === undefined) {
              elem = document.createElement('span');
              elements[i] = elem;
              container.appendChild(elem);
            }
            const color = '255, 212, 0';
            const style = `position:absolute;top:${selectionRect.top +
              (window.pageYOffset || document.documentElement.scrollTop)
              }px;left:${selectionRect.left}px;height:${selectionRect.height
              }px;width:${selectionRect.width
              }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
            elem.style.cssText = style;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i];
            container.removeChild(elem);
            elements.pop();
          }
        }
      }
    });
  }, [editor, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener('resize', updateLocation);

    return () => {
      window.removeEventListener('resize', updateLocation);
    };
  }, [updateLocation]);

  const onEscape = (event: KeyboardEvent): boolean => {
    event.preventDefault();
    cancelAddQuestion();
    return true;
  };

  const submitQuestion = () => {
    if (canSubmit) {
      let answer = editor.getEditorState().read(() => {
        const selection = selectionRef.current;
        return selection ? selection.getTextContent() : '';
      });
      if (answer.length > 100) {
        answer = answer.slice(0, 99) + '…';
      }
      if (!noteId) return;

      submitAddQuestion(
        createQuestion(userId, question, answer, noteId),
        selectionRef.current,
      );
      selectionRef.current = null;
    }
  };

  const onChange = useOnChange(setQuestion, setCanSubmit);

  return (
    <div className="CommentPlugin_CommentInputBox" ref={boxRef}>
      <PlainTextEditor
        className="CommentPlugin_CommentInputBox_Editor"
        onEscape={onEscape}
        onChange={onChange}
        onSubmit={canSubmit ? submitQuestion : undefined}
      />
      <div className="CommentPlugin_CommentInputBox_Buttons">
        <Button
          onClick={cancelAddQuestion}
          className="CommentPlugin_CommentInputBox_Button">
          Cancel
        </Button>
        <Button
          onClick={submitQuestion}
          disabled={!canSubmit}
          className="CommentPlugin_CommentInputBox_Button primary">
          Add question <span className="shortcut-hint">(⌘+⏎)</span>
        </Button>
      </div>
    </div>
  );
}

function QuestionEditBox({
  editor,
  cancelEditQuestion,
  submitEditQuestion,
  deleteQuestion,
  activeIDs,
  markNodeMap,
  questions,
}: {
  editor: LexicalEditor;
  cancelEditQuestion: () => void;
  submitEditQuestion: (
    question: Question,
  ) => void;
  deleteQuestion: (
    question: Question,
  ) => void;
  activeIDs: Array<string>;
  markNodeMap: Map<string, Set<NodeKey>>;
  questions: Questions;
}) {
  const [newQuestion, setNewQuestion] = useState(questions.find(q => activeIDs.includes(q.id))?.question || '');
  const [canSubmit, setCanSubmit] = useState(false);
  const [modal, showModal] = useModal();
  const boxRef = useRef<HTMLDivElement>(null);
  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: [],
    }),
    [],
  );
  const selectionRef = useRef<RangeSelection | null>(null);
  const user = useUser();
  if (!user) return;
  const question = questions.find(q => activeIDs.includes(q.id))

  const updateLocation = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset,
        );
        const boxElem = boxRef.current;
        if (range !== null && boxElem !== null) {
          const { left, bottom, width } = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft =
            selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${bottom +
            20 +
            (window.pageYOffset || document.documentElement.scrollTop)
            }px`;
          const selectionRectsLength = selectionRects.length;
          const { container } = selectionState;
          const elements: Array<HTMLSpanElement> = selectionState.elements;
          const elementsLength = elements.length;

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i];
            let elem: HTMLSpanElement = elements[i];
            if (elem === undefined) {
              elem = document.createElement('span');
              elements[i] = elem;
              container.appendChild(elem);
            }
            const color = '255, 212, 0';
            const style = `position:absolute;top:${selectionRect.top +
              (window.pageYOffset || document.documentElement.scrollTop)
              }px;left:${selectionRect.left}px;height:${selectionRect.height
              }px;width:${selectionRect.width
              }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
            elem.style.cssText = style;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i];
            container.removeChild(elem);
            elements.pop();
          }
        }
      }
    });
  }, [editor, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener('resize', updateLocation);

    return () => {
      window.removeEventListener('resize', updateLocation);
    };
  }, [updateLocation]);

  const onEscape = (event: KeyboardEvent): boolean => {
    event.preventDefault();
    cancelEditQuestion();
    return true;
  };

  const updateQuestion = () => {
    if (canSubmit && question) {
      question.question = newQuestion;
      submitEditQuestion(question);
      selectionRef.current = null;
    }
  };

  const submitDeleteQuestion = () => {
    if (question) {
      deleteQuestion(question);
      selectionRef.current = null;
      cancelEditQuestion();
    }
  }

  const onChange = useOnChange(setNewQuestion, setCanSubmit);

  return (
    <div className="CommentPlugin_CommentInputBox" ref={boxRef}>
      <PlainTextEditor
        className="CommentPlugin_CommentInputBox_Editor"
        onEscape={onEscape}
        onChange={onChange}
        initialContent={newQuestion}
        onSubmit={canSubmit ? updateQuestion : undefined}
      />
      <div className="CommentPlugin_CommentInputBox_Buttons">
        <Button
          onClick={submitDeleteQuestion}
          className="CommentPlugin_CommentInputBox_Button">
          <Trash2 size={16} />
        </Button>
        <Button
          onClick={updateQuestion}
          disabled={!canSubmit}
          className="CommentPlugin_CommentInputBox_Button primary">
          Update <span className="shortcut-hint">(⌘+⏎)</span>
        </Button>
      </div>
    </div>
  );
}

function QuestionsComposer({
  submitUpdateQuestion,
  question,
  placeholder,
}: {
  submitUpdateQuestion: (
    question: Question
  ) => void;
  question: Question;
  placeholder: string;
}) {
  const [newQuestion, setnewQuestion] = useState(question.question);
  const [canSubmit, setCanSubmit] = useState(newQuestion !== question.question);
  const editorRef = useRef<LexicalEditor>(null);

  const onChange = useOnChange(setnewQuestion, setCanSubmit);

  const submitQuestion = () => {
    if (canSubmit) {
      question.question = newQuestion;
      submitUpdateQuestion(question);
    }
  };

  return (
    <>
      <PlainTextEditor
        className="CommentPlugin_CommentsPanel_Editor"
        autoFocus={false}
        onEscape={() => {
          return true;
        }}
        onChange={onChange}
        editorRef={editorRef}
        placeholder={placeholder}
        onSubmit={canSubmit ? submitQuestion : undefined}
        initialContent={question.question}
      />
      <Button
        className="CommentPlugin_CommentsPanel_SendButton"
        onClick={submitQuestion}
        disabled={!canSubmit}
        title="Submit (⌘+Enter)">
        <i className="send" />
      </Button>
    </>
  );
}

function ShowQuestionDialog({
  question,
  deleteQuestion,
  onClose,
}: {
  question: Question;
  deleteQuestion: (
    question: Question,
  ) => void;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to delete this question?
      <div className="Modal__content">
        <Button
          onClick={() => {
            deleteQuestion(question);
            onClose();
          }}>
          Delete
        </Button>{' '}
        <Button
          onClick={() => {
            onClose();
          }}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function QuestionsPanelList({
  activeIDs,
  questions,
  deleteQuestion,
  listRef,
  submitUpdateQuestion,
  markNodeMap,
}: {
  activeIDs: Array<string>;
  questions: Questions;
  deleteQuestion: (
    question: Question,
  ) => void;
  listRef: { current: null | HTMLUListElement };
  markNodeMap: Map<string, Set<NodeKey>>;
  submitUpdateQuestion: (
    question: Question,
  ) => void;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [counter, setCounter] = useState(0);
  const [modal, showModal] = useModal();
  const rtf = useMemo(
    () =>
      new Intl.RelativeTimeFormat('en', {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'short',
      }),
    [],
  );

  useEffect(() => {
    // Used to keep the time stamp up to date
    const id = setTimeout(() => {
      setCounter(counter + 1);
    }, 10000);

    return () => {
      clearTimeout(id);
    };
  }, [counter]);

  return (
    <ul className="CommentPlugin_CommentsPanel_List" ref={listRef}>
      {questions.map((question) => {
        const id = question.id;
        const handleClick = () => {
          const markNodeKeys = markNodeMap.get(id);
          if (
            markNodeKeys !== undefined &&
            (activeIDs === null || activeIDs.indexOf(id) === -1)
          ) {
            const activeElement = document.activeElement;
            // Move selection to the start of the mark, so that we
            // update the UI with the selected thread.
            editor.update(
              () => {
                const markNodeKey = Array.from(markNodeKeys)[0];
                const markNode = $getNodeByKey<MarkNode>(markNodeKey);
                if ($isMarkNode(markNode)) {
                  markNode.selectStart();
                }
              },
              {
                onUpdate() {
                  // Restore selection to the previous element
                  if (activeElement !== null) {
                    (activeElement as HTMLElement).focus();
                  }
                },
              },
            );
          }
        };

        return (
           
          <li
            key={id}
            onClick={handleClick}
            className={`CommentPlugin_CommentsPanel_List_Thread ${markNodeMap.has(id) ? 'interactive' : ''
              } ${activeIDs.indexOf(id) === -1 ? '' : 'active'}`}>
            <div className="CommentPlugin_CommentsPanel_List_Thread_QuoteBox">
              <blockquote className="CommentPlugin_CommentsPanel_List_Thread_Quote">
                {'> '}
                <span>{question.answer}</span>
              </blockquote>
              <Button
                onClick={() => {
                  showModal('Delete Qustion', (onClose) => (
                    <ShowQuestionDialog
                      question={question}
                      deleteQuestion={deleteQuestion}
                      onClose={onClose}
                    />
                  ));
                }}
                className="CommentPlugin_CommentsPanel_List_DeleteButton">
                <i className="delete" />
              </Button>
              {modal}
            </div>
            <div className="CommentPlugin_CommentsPanel_List_Thread_Editor">
              <QuestionsComposer
                submitUpdateQuestion={submitUpdateQuestion}
                question={question}
                placeholder="Write a new question..."
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function QuestionsPanel({
  activeIDs,
  deleteQuestion,
  questions,
  submitUpdateQuestion,
  markNodeMap,
}: {
  activeIDs: Array<string>;
  questions: Questions;
  deleteQuestion: (
    question: Question,
  ) => void;
  markNodeMap: Map<string, Set<NodeKey>>;
  submitUpdateQuestion: (
    question: Question,
  ) => void;
}): JSX.Element {
  const listRef = useRef<HTMLUListElement>(null);
  const isEmpty = questions.length === 0;

  return (
    <div className="CommentPlugin_CommentsPanel">
      <h2 className="CommentPlugin_CommentsPanel_Heading">Questions</h2>
      {isEmpty ? (
        <div className="CommentPlugin_CommentsPanel_Empty">No Questions</div>
      ) : (
        <QuestionsPanelList
          activeIDs={activeIDs}
          questions={questions}
          deleteQuestion={deleteQuestion}
          listRef={listRef}
          submitUpdateQuestion={submitUpdateQuestion}
          markNodeMap={markNodeMap}
        />
      )}
    </div>
  );
}

export default function QuestionPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const questionStore = useMemo(() => new QuestionStore(editor), [editor]);
  const questions = useQuestionStore(questionStore);
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map();
  }, []);
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>();
  const [activeIDs, setActiveIDs] = useState<Array<string>>([]);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const { currentSession } = useReviewStore();

  const cancelAddQuestion = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        selection.dirty = true;
      }
    });
    setShowQuestionInput(false);
  }, [editor]);

  const cancelEditQuestion = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if (selection !== null) {
        selection.dirty = true;
      }
    });
    setShowEditQuestion(false);
  }, [editor]);

  const deleteQuestion = useCallback(
    (question: Question) => {
      questionStore.deleteQuestion(question);
      const id = question.id;
      const markNodeKeys = markNodeMap.get(id);
      if (markNodeKeys !== undefined) {
        // Do async to avoid causing a React infinite loop
        setTimeout(() => {
          editor.update(() => {
            for (const key of markNodeKeys) {
              const node: null | MarkNode = $getNodeByKey(key);
              if ($isMarkNode(node)) {
                node.deleteID(id);
                if (node.getIDs().length === 0) {
                  $unwrapMarkNode(node);
                }
              }
            }
          });
        });
      }
    },
    [questionStore, editor, markNodeMap],
  );

  const submitAddQuestion = useCallback(
    (
      question: Question,
      selection: RangeSelection | null,
    ) => {
      questionStore.addQuestion(question);

      editor.update(() => {
        if ($isRangeSelection(selection)) {
          const isBackward = selection.isBackward();
          const id = question.id;

          $wrapSelectionInMarkNode(selection, isBackward, id);

          let markNode: null | MarkNode = null;
          const nodeAfterSelection = selection.focus.getNode();

          if ($isTextNode(nodeAfterSelection)) {
            let parent = nodeAfterSelection.getParent();
            while (parent && !$isMarkNode(parent)) {
              parent = parent.getParent();
            }
            if (parent && $isMarkNode(parent)) {
              markNode = parent;
            } else {
              // Try to get the next sibling if we're at the end of a text node
              const next = nodeAfterSelection.getNextSibling();
              if (next && $isMarkNode(next)) {
                markNode = next;
              }
            }
          } else if ($isMarkNode(nodeAfterSelection)) {
            markNode = nodeAfterSelection;
          }

          // Place the cursor after the mark node
          if (markNode) {
            markNode.selectNext();
          }
        }
      });
      setShowQuestionInput(false);
    },
    [questionStore, editor],
  );

  const submitEditQuestion = useCallback(
    (
      question: Question,
    ) => {
      questionStore.updateQuestion(question);
      setShowEditQuestion(false);
    },
    [editor, questionStore],
  );


  useEffect(() => {
    const changedElems: Array<HTMLElement> = [];
    if (!currentSession) return;

    for (let i = 0; i < currentSession.questions.length; i++) {
      const currentId = currentSession.questions[i].id;
      console.log(currentId, currentSession.questionsToAnswer);
      if (currentSession.questionsToAnswer.has(currentId)) {
        const keys = markNodeMap.get(currentId);
        if (keys !== undefined) {
          for (const key of keys) {
            const elem = editor.getElementByKey(key);
            if (elem !== null) {
              elem.classList.add('PlaygroundEditorTheme__mark');
              changedElems.push(elem);
            }
          }
        }
      } else {
        const keys = markNodeMap.get(currentId);
        if (keys !== undefined) {
          for (const key of keys) {
            const elem = editor.getElementByKey(key);
            if (elem !== null) {
              elem.classList.remove('PlaygroundEditorTheme__mark');
              changedElems.push(elem);
            }
          }
        }
      }
    }

    const id = currentSession?.currentQuestionId;
    if (id && !currentSession.isShowingAnswer) {
      const keys = markNodeMap.get(id);
      if (keys !== undefined) {
        for (const key of keys) {
          const elem = editor.getElementByKey(key);
          if (elem !== null) {
            elem.classList.add('review');
            changedElems.push(elem);
          }
        }
      }
    } else if (id && currentSession?.isShowingAnswer) {
      for (const key of markNodeMap.get(id) || []) {
        const elem = editor.getElementByKey(key);
        if (elem !== null) {
          elem.classList.remove('review');
          elem.classList.add('showingAnswer');
          elem.classList.remove('PlaygroundEditorTheme__mark');
          changedElems.push(elem);
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i];
        changedElem.classList.remove('review');
        changedElem.classList.remove('showingAnswer');
      }
    };
  }, [editor, markNodeMap, currentSession?.currentQuestionId, currentSession?.isShowingAnswer]);

  useEffect(() => {
    const changedElems: Array<HTMLElement> = [];
    if (!currentSession) {
      for (let i = 0; i < activeIDs.length; i++) {
        const id = activeIDs[i];
        const keys = markNodeMap.get(id);
        if (keys !== undefined) {
          for (const key of keys) {
            const elem = editor.getElementByKey(key);
            if (elem !== null) {
              elem.classList.add('selected');
              changedElems.push(elem);
            }
          }
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i];
        changedElem.classList.remove('selected');
      }
    };
  }, [activeIDs, editor, markNodeMap]);

  useEffect(() => {
    const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map();

    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => {
          return $createMarkNode(from.getIDs());
        },
        (from: MarkNode, to: MarkNode) => {
          // Merge the IDs
          const ids = from.getIDs();
          ids.forEach((id) => {
            to.addID(id);
          });
        },
      ),
      editor.registerMutationListener(
        MarkNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, mutation] of mutations) {
              const node: null | MarkNode = $getNodeByKey(key);
              let ids: NodeKey[] = [];

              if (mutation === 'destroyed') {
                ids = markNodeKeysToIDs.get(key) || [];
              } else if ($isMarkNode(node)) {
                ids = node.getIDs();
              }

              for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let markNodeKeys = markNodeMap.get(id);
                markNodeKeysToIDs.set(key, ids);

                if (mutation === 'destroyed') {
                  if (markNodeKeys !== undefined) {
                    markNodeKeys.delete(key);
                    if (markNodeKeys.size === 0) {
                      markNodeMap.delete(id);
                    }
                  }
                } else {
                  if (markNodeKeys === undefined) {
                    markNodeKeys = new Set();
                    markNodeMap.set(id, markNodeKeys);
                  }
                  if (!markNodeKeys.has(key)) {
                    markNodeKeys.add(key);
                  }
                }
              }
            }
          });
        },
        { skipInitialization: false },
      ),
      editor.registerUpdateListener(({ editorState, tags }) => {
        editorState.read(() => {
          const selection = $getSelection();
          let hasActiveIds = false;
          let hasAnchorKey = false;

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();

            if ($isTextNode(anchorNode)) {
              const questionIDs = $getMarkIDs(
                anchorNode,
                selection.anchor.offset,
              );
              if (questionIDs !== null) {
                setActiveIDs(questionIDs);
                hasActiveIds = true;
              }
              if (!selection.isCollapsed()) {
                setActiveAnchorKey(anchorNode.getKey());
                hasAnchorKey = true;
              }
            }
          }
          if (!hasActiveIds) {
            setActiveIDs((_activeIds) =>
              _activeIds.length === 0 ? _activeIds : [],
            );
          }
          if (!hasAnchorKey) {
            setActiveAnchorKey(null);
          }
          if ($isRangeSelection(selection)) {
            setShowQuestionInput(false);
            setShowEditQuestion(false);
          }
        });
      }),
      editor.registerCommand(
        INSERT_INLINE_COMMAND,
        () => {
          const domSelection = getDOMSelection(editor._window);
          if (domSelection !== null) {
            domSelection.removeAllRanges();
          }
          setShowQuestionInput(true);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement;

          let current: HTMLElement | null = target;
          let isQuestionNode = false;

          while (current && current !== editor.getRootElement()) {
            if (current.classList.contains('PlaygroundEditorTheme__mark')) {
              isQuestionNode = true;
              break;
            }
            current = current.parentElement;
          }

          if (isQuestionNode) {
            setShowEditQuestion(true);
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor, markNodeMap]);

  const onAddQuestion = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

  return (
    <>
      {showQuestionInput &&
        createPortal(
          <QuestionInputBox
            editor={editor}
            cancelAddQuestion={cancelAddQuestion}
            submitAddQuestion={submitAddQuestion}
          />,
          document.body,
        )}
      {editor.isEditable() &&
        activeAnchorKey !== null &&
        activeAnchorKey !== undefined &&
        !showQuestionInput &&
        createPortal(
          <AddQuestionBox
            anchorKey={activeAnchorKey}
            editor={editor}
            onAddQuestion={onAddQuestion}
          />,
          document.body,
        )}
      {/* {editor.isEditable() &&
        createPortal(
        <Button
          className={`CommentPlugin_ShowCommentsButton shadow-md hover:shadow-lg ${
            showQuestions ? 'active' : ''
          }`}
          onClick={() => setShowQuestions(!showQuestions)}
          title={showQuestions ? 'Hide Questions' : 'Show Questions'}>
          <i className="format add-comment" />
        </Button>,
        document.body,
      )} */}
      {editor.isEditable() && showEditQuestion &&
        createPortal(
          <QuestionEditBox
            editor={editor}
            cancelEditQuestion={cancelEditQuestion}
            submitEditQuestion={submitEditQuestion}
            deleteQuestion={deleteQuestion}
            activeIDs={activeIDs}
            markNodeMap={markNodeMap}
            questions={questions}
          />,
          document.body,
        )}
    </>
  );
}

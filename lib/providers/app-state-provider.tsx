'use client';

import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { Folder } from '@/types/Folder';
import { Note } from '@/types/Note';
import { Question } from '@/types/Question';
import { AiReviewSession, AiReviewSourceType } from '@/types/AiReviewSession';
import { User } from '@/types/User';
import { toast } from 'sonner';
import { getAppStateByUserId } from '../server_actions/users';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


export type AppNoteType = Note & { questions: Question[], aiReviews: AiReviewSession[] }
export type AppFolderType = Omit<Folder, 'notes'> & { notes: AppNoteType[], aiReviews: AiReviewSession[] };

interface AppState {
  folders: AppFolderType[];
  currentNote: AppNoteType | null;
}

export type Action =
  | { type: 'SET_FOLDERS'; payload: { folders: AppFolderType[] } }
  | { type: 'ADD_FOLDER'; payload: { folder: AppFolderType } }
  | { type: 'UPDATE_FOLDER'; payload: { folder: Partial<Folder>; id: string } }
  | { type: 'DELETE_FOLDER'; payload: { id: string } }
  | { type: 'SET_NOTES'; payload: { notes: AppNoteType[]; folderId: string } }
  | { type: 'ADD_NOTE'; payload: { note: AppNoteType; folderId: string } }
  | { type: 'UPDATE_NOTE'; payload: { note: Partial<Note>; folderId: string; noteId: string } }
  | { type: 'DELETE_NOTE'; payload: { folderId: string; noteId: string } }
  | { type: 'SET_CURRENT_NOTE'; payload: { note: AppNoteType | null } }
  | { type: 'UPDATE_CURRENT_NOTE'; payload: { note: Partial<Note> } }
  | { type: 'ADD_QUESTION'; payload: { question: Question; noteId: string, folderId: string } }
  | { type: 'UPDATE_QUESTION'; payload: { question: Partial<Question>; noteId: string; questionId: string, folderId: string } }
  | { type: 'DELETE_QUESTION'; payload: { questionId: string, folderId: string, noteId: string } }
  | { type: 'ADD_AI_REVIEW'; payload: { aiReview: AiReviewSession; sourceType: AiReviewSourceType; sourceId: string } }
  | { type: 'UPDATE_AI_REVIEW'; payload: { aiReview: Partial<AiReviewSession>; sourceType: AiReviewSourceType; sourceId: string; aiReviewId: string } }
  | { type: 'DELETE_AI_REVIEW'; payload: { aiReviewId: string, sourceType: AiReviewSourceType; sourceId: string } };

const initialState: AppState = {
  folders: [],
  currentNote: null,
};

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  let updatedState: AppState;
  let stateAfterDelete: AppState;

  switch (action.type) {
    case 'SET_FOLDERS':
      return {
        ...state,
        folders: action.payload.folders.sort(
          (a, b) => (a.createdAt ?? new Date()).getTime() - (b.createdAt ?? new Date()).getTime()
        ),
      };

    case 'ADD_FOLDER':
      return {
        ...state,
        folders: [...state.folders, action.payload.folder].sort(
          (a, b) => (a.createdAt ?? new Date()).getTime() - (b.createdAt ?? new Date()).getTime()
        ),
      };

    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.id) {
            return { ...folder, ...action.payload.folder, notes: folder.notes };
          }
          return folder;
        }),
      };

    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(
          (folder) => folder.id !== action.payload.id
        ),
      };

    case 'SET_NOTES':
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: action.payload.notes.sort(
                (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
              ),
            };
          }
          return folder;
        }),
      };

    case 'ADD_NOTE':
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: [...folder.notes, action.payload.note].sort(
                (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
              ),
            };
          }
          return folder;
        }),
      };

    case 'UPDATE_NOTE':
      updatedState = {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: folder.notes.map((note) => {
                if (note.id === action.payload.noteId) {
                  return { ...note, ...action.payload.note, };
                }
                return note;
              }),
            };
          }
          return folder;
        }),
      };

      if (state.currentNote && state.currentNote.id === action.payload.noteId) {
        updatedState.currentNote = { ...state.currentNote, ...action.payload.note };
      }

      return updatedState;

    case 'DELETE_NOTE':
      stateAfterDelete = {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: folder.notes.filter(
                (note) => note.id !== action.payload.noteId
              ),
            };
          }
          return folder;
        }),
      };

      if (state.currentNote && state.currentNote.id === action.payload.noteId) {
        stateAfterDelete.currentNote = null;
      }
      return stateAfterDelete;

    case 'SET_CURRENT_NOTE':
      return {
        ...state,
        currentNote: action.payload.note,
      };

    case 'UPDATE_CURRENT_NOTE':
      return {
        ...state,
        currentNote: state.currentNote ? { ...state.currentNote, ...action.payload.note } : null,
      };

    case 'ADD_QUESTION':
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: folder.notes.map((note) => {
                if (note.id === action.payload.noteId) {
                  return {
                    ...note,
                    questions: [...note.questions, action.payload.question]
                  };
                }
                return note;
              })
            }
          }
          return folder;
        }),
      };

    case 'UPDATE_QUESTION':
      updatedState = {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: folder.notes.map((note) => {
                if (note.id === action.payload.noteId) {
                  return {
                    ...note,
                    questions: note.questions.map((question) => {
                      if (question.id === action.payload.questionId) {
                        return { ...question, ...action.payload.question };
                      }
                      return question
                    })
                  };
                }
                return note;
              })
            }
          }
          return folder;
        }),
      };

      if (state.currentNote && state.currentNote.id === action.payload.noteId) {
        updatedState.currentNote = {
          ...state.currentNote,
          questions: state.currentNote.questions.map((question) => {
            if (question.id === action.payload.questionId) {
              return { ...question, ...action.payload.question };
            }
            return question;
          }),
        };
      }

      return updatedState;

    case 'DELETE_QUESTION':
      stateAfterDelete = {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: folder.notes.map((note) => {
                if (note.id === action.payload.noteId) {
                  return {
                    ...note,
                    questions: note.questions.filter(
                      (question) => question.id !== action.payload.questionId
                    ),
                  };
                }
                return note
              }),
            };
          }
          return folder;
        }),
      };

      if (state.currentNote && state.currentNote.id === action.payload.noteId) {
        stateAfterDelete.currentNote = { ...state.currentNote, questions: state.currentNote.questions.filter(q => q.id !== action.payload.questionId) };
      }
      return stateAfterDelete;

    case 'ADD_AI_REVIEW':
      if (action.payload.sourceType === 'note') {
        return {
          ...state,
          folders: state.folders.map((folder) => {
            const noteIndex = folder.notes.findIndex(note => note.id === action.payload.sourceId);
            if (noteIndex !== -1) {
              return {
                ...folder,
                notes: folder.notes.map((note) =>
                  note.id === action.payload.sourceId
                    ? { ...note, aiReviews: [...note.aiReviews, action.payload.aiReview] }
                    : note
                ),
              };
            }
            return folder;
          }),
        };
      } else if (action.payload.sourceType === 'folder') {
        return {
          ...state,
          folders: state.folders.map((folder) => {
            if (folder.id === action.payload.sourceId) {
              return {
                ...folder,
                aiReviews: [...folder.aiReviews, action.payload.aiReview]
              }
            }
            return folder;
          }),
        };
      }
      return state

    case 'UPDATE_AI_REVIEW':
      if (action.payload.sourceType === 'note') {
        updatedState = {
          ...state,
          folders: state.folders.map((folder) => {
            const noteIndex = folder.notes.findIndex(note => note.id === action.payload.sourceId);
            if (noteIndex !== -1) {
              return {
                ...folder,
                notes: folder.notes.map((note) => {
                  if (note.id === action.payload.sourceId) {
                    return {
                      ...note,
                      aiReviews: note.aiReviews.map((aiReview) => {
                        if (aiReview.id === action.payload.aiReviewId) {
                          return { ...aiReview, ...action.payload.aiReview };
                        }
                        return aiReview;
                      }),
                    };
                  }
                  return note;
                }),
              };
            }
            return folder;
          }),
        };

        if (state.currentNote && state.currentNote.id === action.payload.sourceId) {
          updatedState.currentNote = {
            ...state.currentNote,
            aiReviews: state.currentNote.aiReviews.map((aiReview) => {
              if (aiReview.id === action.payload.aiReviewId) {
                return { ...aiReview, ...action.payload.aiReview };
              }
              return aiReview;
            }),
          };
        }

        return updatedState;

      } else if (action.payload.sourceType === 'folder') {
        return {
          ...state,
          folders: state.folders.map((folder) => {
            if (folder.id === action.payload.sourceId) {
              return {
                ...folder,
                aiReviews: folder.aiReviews.map((aiReview) => {
                  if (aiReview.id === action.payload.aiReviewId) {
                    return { ...aiReview, ...action.payload.aiReview };
                  }
                  return aiReview;
                }),
              }
            }
            return folder;
          }),
        };
      }
      return state;

    case 'DELETE_AI_REVIEW':
      if (action.payload.sourceType === 'note') {
        stateAfterDelete = {
          ...state,
          folders: state.folders.map((folder) => {
            const noteIndex = folder.notes.findIndex(note => note.id === action.payload.sourceId);
            if (noteIndex !== -1) {
              return {
                ...folder,
                notes: folder.notes.map((note) => {
                  if (note.id === action.payload.sourceId) {
                    return {
                      ...note,
                      aiReviews: note.aiReviews.filter(
                        (aiReview) => aiReview.id !== action.payload.aiReviewId
                      ),
                    };
                  }
                  return note;
                }),
              };
            }
            return folder;
          }),
        };

        if (state.currentNote && state.currentNote.id === action.payload.sourceId) {
          stateAfterDelete.currentNote = {
            ...state.currentNote,
            aiReviews: state.currentNote.aiReviews.filter(
              (r) => r.id !== action.payload.aiReviewId
            ),
          };
        }
        return stateAfterDelete;
      }
      else if (action.payload.sourceType === 'folder') {
        return {
          ...state,
          folders: state.folders.map((folder) => {
            if (folder.id === action.payload.sourceId) {
              return {
                ...folder,
                aiReviews: folder.aiReviews.filter(
                  (aiReview) => aiReview.id !== action.payload.aiReviewId
                ),
              };
            }
            return folder;
          }),
        };
      }
      return state

    default:
      return state;
  }
};

const AppStateContext = createContext<
  | {
    state: AppState;
    dispatch: Dispatch<Action>;
    folderId: string | undefined;
    noteId: string | undefined;
    currentNote: AppNoteType | null;
    isLoading: boolean;
  }
  | undefined
>(undefined);

interface AppStateProviderProps {
  children: React.ReactNode;
  user: User;
}

export default function AppStateProvider({ children, user }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const folderId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments && urlSegments[0] === 'dashboard' && urlSegments.length > 1) {
      return urlSegments[1];
    }
  }, [pathname]);

  const noteId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments && urlSegments[0] === 'dashboard' && urlSegments.length > 2) {
      const potentialNoteId = urlSegments[2];
      if (UUID_V4_REGEX.test(potentialNoteId)) {
        return potentialNoteId;
      }
    }
  }, [pathname]);


  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const folders = await getAppStateByUserId(user.id)
        dispatch({ type: 'SET_FOLDERS', payload: { folders } });
      }
      catch (error) {
        toast.error('Error fetching folders:');
        console.error('Error fetching folders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFolders();
  }, [user.id]);

  useEffect(() => {
    if (isLoading || state.folders.length === 0) {
      return;
    }

    if (!noteId || !folderId) {
      if (state.currentNote !== null) {
        dispatch({ type: 'SET_CURRENT_NOTE', payload: { note: null } });
      }
      return;
    }

    const currentFolder = state.folders.find(folder => folder.id === folderId);
    if (currentFolder) {
      const note = currentFolder.notes.find(note => note.id === noteId);
      if (note && note.id !== state.currentNote?.id) {
        dispatch({ type: 'SET_CURRENT_NOTE', payload: { note } });
      } else if (!note && state.currentNote !== null) {
        dispatch({ type: 'SET_CURRENT_NOTE', payload: { note: null } });
      }
    }
  }, [noteId, folderId, state.folders, state.currentNote?.id, isLoading]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    folderId,
    noteId,
    currentNote: state.currentNote,
    isLoading
  }), [state, dispatch, folderId, noteId, isLoading]);

  return (
    <AppStateContext.Provider
      value={contextValue}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

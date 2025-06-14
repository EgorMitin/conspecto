'use client';

import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { usePathname } from 'next/navigation';
import { Folder } from '@/types/Folder';
import { Note } from '@/types/Note';
import { getNotesByFolderId } from '@/lib/server_actions/notes';

export type AppFolderType = Folder & { notes: Note[] };

interface AppState {
  folders: AppFolderType[];
}

type Action =
  | { type: 'SET_FOLDERS'; payload: { folders: AppFolderType[] } }
  | { type: 'ADD_FOLDER'; payload: { folder: AppFolderType } }
  | { type: 'UPDATE_FOLDER'; payload: { folder: Partial<Folder>; id: string } }
  | { type: 'DELETE_FOLDER'; payload: { id: string } }
  | { type: 'SET_NOTES'; payload: { notes: Note[]; folderId: string } }
  | { type: 'ADD_NOTE'; payload: { note: Note; folderId: string } }
  | { type: 'UPDATE_NOTE'; payload: { note: Partial<Note>; folderId: string; noteId: string } }
  | { type: 'DELETE_NOTE'; payload: { folderId: string; noteId: string } };

const initialState: AppState = { folders: [] };

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case 'SET_FOLDERS':
      return {
        ...state,
        folders: action.payload.folders.sort(
          (a, b) => (a.createdAt ?? new Date()).getTime() - (a.createdAt ?? new Date()).getTime()
        ),
      };

    case 'ADD_FOLDER':
      return {
        ...state,
        folders: [...state.folders, action.payload.folder].sort(
          (a, b) => (a.createdAt ?? new Date()).getTime() - (a.createdAt ?? new Date()).getTime()
        ),
      };

    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.id) {
            return { ...folder, ...action.payload.folder };
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
      return {
        ...state,
        folders: state.folders.map((folder) => {
          if (folder.id === action.payload.folderId) {
            return {
              ...folder,
              notes: folder.notes.map((note) => {
                if (note.id === action.payload.noteId) {
                  return { ...note, ...action.payload.note };
                }
                return note;
              }),
            };
          }
          return folder;
        }),
      };

    case 'DELETE_NOTE':
      return {
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
    }
  | undefined
>(undefined);

interface AppStateProviderProps {
  children: React.ReactNode;
}

export default function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const pathname = usePathname();

  // Extract folderId from URL (dashboard/[folderId])
  const folderId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments && urlSegments[0] === 'dashboard' && urlSegments.length > 1) {
      return urlSegments[1];
    }
  }, [pathname]);

  // Extract noteId from URL (dashboard/[folderId]/[noteId])
  const noteId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments && urlSegments[0] === 'dashboard' && urlSegments.length > 2) {
      return urlSegments[2];
    }
  }, [pathname]);

  // Load notes when folder changes
  useEffect(() => {
    if (!folderId) return;
    
    const fetchNotes = async () => {
      try {
        const { data: notes } = await getNotesByFolderId(folderId);
        if (notes) {
          dispatch({
            type: 'SET_NOTES',
            payload: { folderId, notes },
          });
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    };

    fetchNotes();
  }, [folderId]);

  return (
    <AppStateContext.Provider
      value={{ state, dispatch, folderId, noteId }}
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

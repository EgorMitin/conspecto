'use client';

import { useState } from 'react';
import { Archive, Calendar, Save, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';

import { updateNote } from '@/lib/server_actions/notes';
import { Note } from '@/types/Note';
import { useAppState } from '@/lib/providers/app-state-provider';
import { toast } from 'sonner';
import EmojiPicker from '@/components/emoji-picker';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogAction, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';

interface NoteHeaderProps {
  note: Note;
}

const getStatusColor = (status: 'active' | 'archived') => {
  switch (status) {
    case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    case 'archived': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    default: return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
  }
};

export default function NoteHeader({ note }: NoteHeaderProps) {
  const { dispatch, folderId } = useAppState();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(note.title);
  const [isConfirmingStatus, setIsConfirmingStatus] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState<"active" | "archived" | null>(null);
  const lastUpdated = formatDistanceToNow(note.updatedAt, { addSuffix: true });
  const router = useRouter();
  const pathname = usePathname();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (!folderId) return;
    if (!localTitle.trim()) {
      setLocalTitle(note.title);
      return;
    }

    if (localTitle !== note.title) {
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          note: { title: localTitle },
          noteId: note.id,
          folderId,
        },
      });

      const { error } = await updateNote(note.id, { title: localTitle });
      if (error) {
        toast.error('Error! Could not update the note title.');
        setLocalTitle(note.title);
      } else {
        toast.success('Note title updated successfully.');
      }
    }
  };

  const handleIconChange = async (selectedEmoji: string) => {
    if (!folderId) return;
    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        folderId,
        noteId: note.id,
        note: { iconId: selectedEmoji },
      },
    });

    const { error } = await updateNote(note.id, { iconId: selectedEmoji });
    if (error) {
      toast.error('Error! Could not update the emoji for this note');
    } else {
      toast.success('Note emoji updated successfully');
    }
  };

  const confirmStatusChange = (newStatus: "active" | "archived") => {
    setStatusToConfirm(newStatus);
    setIsConfirmingStatus(true);
  };

  const handleStatusChange = async (newStatus: "active" | "archived") => {
    if (!folderId) return;
    toast.loading(`Changing note status to ${newStatus}...`, { duration: 1000 });
    setIsConfirmingStatus(false)

    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        note: { status: newStatus },
        noteId: note.id,
        folderId,
      },
    });

    const { error } = await updateNote(note.id, { status: newStatus });
    if (error) {
      toast.error(`Could not change note status to ${newStatus}`);
    } else {
      if (newStatus === 'active') {
        toast.success('Note saved successfully.');
      } else if (newStatus === 'archived') {
        toast.info('Note moved to trash.');
      }
    }
  };

  const getConfirmationContent = () => {
    if (statusToConfirm === 'active') {
      return {
        title: "Save this note?",
        description: "This will mark the note as active and make it available for study sessions.",
        confirmText: "Save",
        confirmVariant: "default" as const
      };
    } else if (statusToConfirm === 'archived') {
      return {
        title: "Move to trash?",
        description: "This will archive the note and remove it from your active notes.",
        confirmText: "Move to trash",
        confirmVariant: "destructive" as const
      };
    }
    return {
      title: "Change status?",
      description: "Are you sure you want to change the status of this note?",
      confirmText: "Continue",
      confirmVariant: "default" as const
    };
  };

  const confirmationContent = getConfirmationContent();

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <EmojiPicker getValue={handleIconChange}>
            <div className="text-4xl cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-lg hover:bg-muted/50">
              {note.iconId || '📄'}
            </div>
          </EmojiPicker>

          <div className="flex flex-col gap-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className="text-2xl font-bold leading-tight outline-none bg-muted p-1 rounded"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
              />
            ) : (
              <h1
                className="text-2xl font-bold leading-tight cursor-pointer hover:bg-muted"
                onClick={() => setIsEditingTitle(true)}
                onDoubleClick={() => setIsEditingTitle(true)}
              >
                {localTitle}
              </h1>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${getStatusColor(note.status)} self-start px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-default shadow-sm`}
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${note.status === 'active' ? 'bg-emerald-400' :
                  'bg-slate-400'
                }`} />
              {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
            </div>
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {pathname.includes('/study') && (
            <Button
              variant="outline"
              size="default"
              className="text-muted-foreground mr-3 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => router.push(`/dashboard/${folderId}/${note.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Note
            </Button>
          )}
          {note.status === 'archived' && (
            <Button
              variant="ghost"
              size="default"
              className="text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
              onClick={() => confirmStatusChange('active')}
            >
              <Save className="w-4 h-4 mr-2" />
              Restore
            </Button>
          )}

          {note.status !== 'archived' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={() => confirmStatusChange('archived')}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}
        </div>
      </div>
      <AlertDialog open={isConfirmingStatus} onOpenChange={setIsConfirmingStatus}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStatusToConfirm(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusToConfirm) {
                  handleStatusChange(statusToConfirm);
                  setStatusToConfirm(null);
                }
              }}
              className={statusToConfirm === 'archived' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmationContent.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
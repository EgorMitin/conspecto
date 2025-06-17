'use client';

import { useState } from 'react';
import { Archive, Calendar, Save, ArrowLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from 'next/navigation';

import { AppFolderType, useAppState } from '@/lib/providers/app-state-provider';
import { toast } from 'sonner';
import EmojiPicker from '@/components/emoji-picker';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogAction, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { updateFolder } from '@/lib/server_actions/folders';

interface FolderHeaderProps {
  folder: AppFolderType;
}

const getStatusColor = (inTrash: boolean) => {
  if (inTrash) return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
};

export default function FolderHeader({ folder }: FolderHeaderProps) {
  const { dispatch } = useAppState();
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(folder.name);
  const [isConfirmingStatus, setIsConfirmingStatus] = useState(false);
  const [statusToConfirm, setStatusToConfirm] = useState<boolean>(folder.inTrash);
  const lastUpdated = formatDistanceToNow(folder.updatedAt, { addSuffix: true });
  const router = useRouter();
  const pathname = usePathname();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  const handleTitleBlur = async () => {
    setIsEditingName(false);
    if (!localName.trim()) {
      setLocalName(folder.name);
      return;
    }

    if (localName !== folder.name) {
      dispatch({
        type: 'UPDATE_FOLDER',
        payload: {
          folder: { name: localName },
          id: folder.id,
        },
      });

      const { success } = await updateFolder(folder.id, { name: localName });
      if (!success) {
        toast.error('Error! Could not update the folder name.');
        setLocalName(folder.name);
      } else {
        toast.success('Folder name updated successfully.');
      }
    }
  };

  const handleIconChange = async (selectedEmoji: string) => {
    dispatch({
      type: 'UPDATE_FOLDER',
      payload: {
        folder: { iconId: selectedEmoji },
        id: folder.id,
      },
    });

    const { success } = await updateFolder(folder.id, { iconId: selectedEmoji });
    if (!success) {
      toast.error('Error! Could not update the emoji for this folder');
    } else {
      toast.success('Folder emoji updated successfully');
    }
  };

  const confirmStatusChange = (newStatus: boolean) => {
    setStatusToConfirm(newStatus);
    setIsConfirmingStatus(true);
  };

  const handleStatusChange = async (newStatus: boolean) => {
    toast.loading(`Changing folder status...`, { duration: 1000 });
    setIsConfirmingStatus(false)

    dispatch({
      type: 'UPDATE_FOLDER',
      payload: {
        folder: { inTrash: newStatus },
        id: folder.id,
      },
    });

    const { success } = await updateFolder(folder.id, { inTrash: newStatus });
    if (!success) {
      toast.error(`Could not change folder status`);
    } else {
      if (!newStatus) {
        toast.success('Folder is not in trash any more.');
      } else {
        toast.info('Folder moved to trash.');
      }
    }
  };

  const getConfirmationContent = () => {
    if (!statusToConfirm) {
      return {
        title: "Move this folder from trash?",
        description: "This will mark the folder as active and make it available for study sessions.",
        confirmText: "Save",
        confirmVariant: "default" as const
      };
    } else {
      return {
        title: "Move to trash?",
        description: "This will archive the folder and remove it from your active folders.",
        confirmText: "Move to trash",
        confirmVariant: "destructive" as const
      };
    }
  };

  const confirmationContent = getConfirmationContent();

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <EmojiPicker getValue={handleIconChange}>
            <div className="text-4xl cursor-pointer hover:scale-110 transition-transform duration-200 p-2 rounded-lg hover:bg-muted/50">
              {folder.iconId || '📄'}
            </div>
          </EmojiPicker>

          <div className="flex flex-col gap-1">
            {isEditingName ? (
              <input
                type="text"
                value={localName}
                onChange={handleNameChange}
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
                onClick={() => setIsEditingName(true)}
                onDoubleClick={() => setIsEditingName(true)}
              >
                {localName}
              </h1>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${getStatusColor(folder.inTrash)} self-start px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-default shadow-sm`}
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${folder.inTrash ? 'bg-slate-400' : 'bg-emerald-400'}`} />
              {folder.inTrash ? 'In Trash' : 'Active'}
            </div>
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {pathname.includes('/study') && (
            <Button
              variant="outline"
              size="default"
              className="text-muted-foreground mr-3 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => router.push(`/dashboard/${folder.id}/`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Folder
            </Button>
          )}
          {folder.inTrash && (
            <Button
              variant="ghost"
              size="default"
              className="text-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
              onClick={() => confirmStatusChange(false)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}

          {!folder.inTrash && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={() => confirmStatusChange(true)}
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
            <AlertDialogCancel onClick={() => setStatusToConfirm(statusToConfirm)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusToConfirm) {
                  handleStatusChange(statusToConfirm);
                  setStatusToConfirm(!statusToConfirm);
                }
              }}
              className={statusToConfirm ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmationContent.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
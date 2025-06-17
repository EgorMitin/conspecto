import React from 'react';

import { Folder } from '@/types/Folder';
import Image from 'next/image';
import Link from 'next/link';
import EmojiPicker from '@/components/emoji-picker';
import { useAppState } from '@/lib/providers/app-state-provider';
import { updateFolder } from '@/lib/server_actions/folders';
import { toast } from 'sonner';

interface SelectedFolderProps {
  folder: Folder;
  onClick?: (option: Folder) => void;
}

export default function SelectedFolder({ folder, onClick }: SelectedFolderProps) {
  const { dispatch, folderId } = useAppState();
  const [newEmoji, setNewEmoji] = React.useState(folder.iconId);

  const onChangeEmoji = async (selectedEmoji: string) => {
    if (!folderId) return;
    setNewEmoji(selectedEmoji);
    dispatch({
      type: 'UPDATE_FOLDER',
      payload: {
        id: folderId,
        folder: { iconId: selectedEmoji },
      },
    });
    const updatePromise = updateFolder(folderId, { iconId: selectedEmoji });
    toast.promise(updatePromise, {
      loading: 'Updating emoji...',
      success: 'Emoji updated successfully!',
      error: 'Error! Could not update the emoji for this folder',
    });
  };

  return (
    <div className="flex rounded-md hover:bg-amber-100/60 hover:dark:bg-amber-100/10 transition-all flex-row p-2 gap-1 justify-center cursor-pointer items-center my-2">
      {folder.logo
        ? <Image
          src={folder.logo || '/favicon.png'}
          alt="folder logo"
          width={26}
          height={26}
          objectFit="cover"
        />
        : <EmojiPicker getValue={onChangeEmoji}>{newEmoji}</EmojiPicker>
      }
      <div
        onClick={() => {
          if (onClick) onClick(folder);
        }}
        className="flex flex-col"
      >
        <p className="text-sm max-w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {folder.name}
        </p>
      </div>
    </div>
  );
};

import React from 'react';

import { Folder } from '@/types/Folder';
import Image from 'next/image';
import Link from 'next/link';

interface SelectedFolderProps {
  folder: Folder;
  onClick?: (option: Folder) => void;
}

export default function SelectedFolder ({ folder, onClick }: SelectedFolderProps) {
  return (
    <Link
      href={`/dashboard/${folder.id}`}
      onClick={() => {
        if (onClick) onClick(folder);
      }}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-1 justify-center cursor-pointer items-center my-2"
    >
      <Image
        src={folder.logo || '/favicon.png'}
        alt="folder logo"
        width={26}
        height={26}
        objectFit="cover"
      />
      <div className="flex flex-col">
        <p className="text-sm max-w-[170px] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {folder.name}
        </p>
      </div>
    </Link>
  );
};

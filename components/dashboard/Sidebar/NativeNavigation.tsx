import Link from 'next/link';
import React from 'react';
import { Settings as SettingsIcon, Trash as TrashIcon, Home as HomeIcon, PlusCircle as Plus } from 'lucide-react';
import Settings from '../Settings';
import Trash from '../Trash';
import CustomDialogTrigger from '@/components/CustomDialogTrigger';
import FolderCreator from '../FolderCreator';
import { User } from '@/types/User';

interface NativeNavigationProps {
  folderId?: string;
  user: User;
}

export default function NativeNavigation({ folderId, user }: NativeNavigationProps) {
  return (
    <nav className='my-2'>
      <ul className="flex flex-col gap-2">
        <Settings>
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2 cursor-pointer">
            <SettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>

        <Trash>
          <li className="group/native flex text-Neutrals/neutrals-7 transition-all gap-2">
            <TrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
      </ul>
    </nav>
  );
};

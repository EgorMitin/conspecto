import React from 'react';
import CustomDialogTrigger from '@/components/CustomDialogTrigger';
import TrashRestore from './TrashRestore';

interface TrashProps {
  children: React.ReactNode;
}

export default function Trash ({ children }: TrashProps) {
  return (
    <CustomDialogTrigger
      header="Trash"
      content={<TrashRestore />}
    >
      {children}
    </CustomDialogTrigger>
  );
};
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import clsx from 'clsx';

interface CustomDialogTriggerProps {
  header?: string;
  content?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export default function CustomDialogTrigger({
  header,
  content,
  children,
  description,
  className,
}: CustomDialogTriggerProps) {
  return (
    <Dialog>
      <DialogTrigger className={clsx('cursor-pointer', className)}>{children}</DialogTrigger>
      <DialogContent className="h-screen block sm:h-[440px] overflow-scroll w-full ">
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

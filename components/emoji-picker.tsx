'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme } from 'next-themes';
import { Theme } from 'emoji-picker-react';

const Picker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

interface EmojiPickerProps {
  children: React.ReactNode;
  getValue?: (emoji: string) => void;
}

export default function EmojiPicker({ children, getValue }: EmojiPickerProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const onClick = (selectedEmoji: { emoji: string }) => {
    setOpen(false);
    if (getValue) getValue(selectedEmoji.emoji);
  };
  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <Picker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};


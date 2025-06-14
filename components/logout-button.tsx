'use client'

import { useAppState } from '@/lib/providers/app-state-provider';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from './ui/button';
import { useUser } from '@/lib/context/UserContext';
import { logOut } from '@/lib/auth/logOut';

interface LogoutButtonProps {
  children: React.ReactNode;
}

export default function LogoutButton ({ children }: LogoutButtonProps) {
  const user = useUser();
  const { dispatch } = useAppState();
  const router = useRouter();
  const logout = async () => {
    await logOut();
    router.refresh();
    dispatch({ type: 'SET_FOLDERS', payload: { folders: [] } });
  };
  return (
    <Button
      variant="ghost"
      className="p-0"
      onClick={logout}
    >
      {children}
    </Button>
  );
};

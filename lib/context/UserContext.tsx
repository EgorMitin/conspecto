'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { User } from '@/types/User';

type UserContextType = {
  user: User | null;
  isLoading: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, userPromise }: { children: ReactNode; userPromise: Promise<User | null> }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const user = await userPromise;
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
    fetchUser();
  }, [userPromise]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
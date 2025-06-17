'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { User } from '@/types/User';

interface UserContextType {
  user: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, userPromise }: { children: ReactNode; userPromise: Promise<User | null> }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const user = await userPromise;
      setUser(user);
    }
    fetchUser();
  }, [userPromise]);

  return (
    <UserContext.Provider value={{ user: user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): User | null => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context.user;
};
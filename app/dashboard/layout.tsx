'use client';

import React from 'react';
import { PRODUCTS } from '@/config';
import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import AppStateProvider from '@/lib/providers/app-state-provider';
import { useUser } from '@/lib/context/UserContext';
import Sidebar from '@/components/dashboard/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full min-w-0">
      <SubscriptionModalProvider products={PRODUCTS}>
        <AppStateProvider user={user}>
          <Sidebar
            user={user}
          />
          {children}
        </AppStateProvider>
      </SubscriptionModalProvider>
    </main>
  );
};
'use client';

import React, { useEffect } from 'react';
import { PRODUCTS } from '@/config';
import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import AppStateProvider from '@/lib/providers/app-state-provider';
import { useUser } from '@/lib/context/UserContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to landing page");
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return null;
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
'use client';

import React, { useEffect } from 'react';
import { PRODUCTS } from '@/config';
import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import AppStateProvider from '@/lib/providers/app-state-provider';
import { useUser } from '@/lib/context/UserContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';

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
          <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">

            <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 px-4 w-full">
              <div className="w-full px-2">
                <Breadcrumbs />
              </div>
            </header>
            {children}
          </div>
        </AppStateProvider>
      </SubscriptionModalProvider>
    </main>
  );
};
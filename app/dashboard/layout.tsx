'use client';

import React, { useEffect, useMemo } from 'react';
import { PRODUCTS } from '@/config';
import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import AppStateProvider, { useAppState } from '@/lib/providers/app-state-provider';
import { useUser } from '@/lib/context/UserContext';
import Sidebar from '@/components/dashboard/Sidebar';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/dashboard/Breadcrumbs';
import Loader from '@/components/Loader';
import StreakDisplay from '@/components/dashboard/StreakDisplay';
import { calculateStreak } from '@/utils/dashboard-statistics';

interface LayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children, user }: { children: React.ReactNode; user: any }) {
  const { state, isLoading } = useAppState();
  const folders = state.folders || [];
  const currentStreak = useMemo(() => {
    if (isLoading || state.folders.length === 0) {
      return null;
    }
    return calculateStreak(folders);
  }, [state.folders, isLoading]);

  return (
    <>
      <Sidebar user={user} />
      <div className="dark:border-Neutrals-12/70 border-l-[1px] relative overflow-auto flex-1 h-full flex flex-col">
        <header className="z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-4 w-full">
          <div className="w-full px-2 flex items-center justify-between">
            <Breadcrumbs />
            <StreakDisplay streak={currentStreak || 0} />
          </div>
        </header>
        {children}
      </div>
    </>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log("No user found, redirecting to landing page");
      router.replace("/");
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return <Loader />;
  }

  return (
    <main className="flex h-screen w-full min-w-0">
      <SubscriptionModalProvider products={PRODUCTS}>
        <AppStateProvider user={user}>
          <DashboardContent user={user}>
            {children}
          </DashboardContent>
        </AppStateProvider>
      </SubscriptionModalProvider>
    </main>
  );
};
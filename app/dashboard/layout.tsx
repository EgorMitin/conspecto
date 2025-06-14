'use server';

import React from 'react';
import { PRODUCTS } from '@/config';
import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout ({ children }: LayoutProps) {
  return (
    <main className="flex over-hidden h-screen">
      <SubscriptionModalProvider products={PRODUCTS}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};
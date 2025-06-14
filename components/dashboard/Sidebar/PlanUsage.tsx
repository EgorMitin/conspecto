'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { MAX_FOLDERS_FREE_PLAN } from '@/lib/constants';
import { useAppState } from '@/lib/providers/app-state-provider';
import { Progress } from '@/components/ui/progress';
import { Subscription } from '@/types/Subscription';
import Diamond from '@/public/icons/diamond.svg';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import Button from '@/lib/Editor/ui/Button';

interface PlanUsageProps {
  foldersLength: number;
  subscription: Subscription | null;
}

export default function PlanUsage({ foldersLength, subscription }: PlanUsageProps) {
  const { state } = useAppState();
  const { setOpen } = useSubscriptionModal()
  const [usagePercentage, setUsagePercentage] = useState(
    (foldersLength / MAX_FOLDERS_FREE_PLAN) * 100
  );

  useEffect(() => {
    const stateFoldersLength = state.folders.length;
    if (stateFoldersLength === undefined) return;
    setUsagePercentage((stateFoldersLength / MAX_FOLDERS_FREE_PLAN) * 100);
  }, [state]);

  return (
    <article className="mb-4">
      {!['active', 'trailing'].includes(subscription?.status || "") && (
        <div
          className="flex gap-2 text-muted-foreground mb-2 items-center">
          <div className="h-4 w-4">
            <button
              onClick={() => setOpen(true)}
              className="h-4 w-4 hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
              aria-label="Upgrade to Pro Plan"
              title="Upgrade to Pro Plan"
            >
              <Image
                src={Diamond}
                alt="Pro Plan Icon"
              />
            </button>
          </div>
          <div className="flex justify-between w-full items-center">
            <div>Free Plan</div>
            <small>{usagePercentage.toFixed(0)}% / 100%</small>
          </div>
        </div>
      )}
      {!['active', 'trailing'].includes(subscription?.status || "") && (
        <Progress
          value={usagePercentage}
          className="h-1"
        />
      )}
    </article>
  );
};
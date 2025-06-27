'use client';

import AiReviewConfig from '@/components/dashboard/Study/AIReview/AiReviewConfig';
import { useUser } from '@/lib/context/UserContext';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AiReviewPage() {
  const { user } = useUser();
  const router = useRouter();
  const { state, folderId, isLoading } = useAppState();

  useEffect(() => {
    if (!user) {
      toast.error("No user found, redirecting to landing page");
      router.push('/');
    }
  }, [user, router]);

  const currentFolder = state.folders.find(f => f.id === folderId);

  if (!user || !currentFolder) {
    return ("LOADING...");
  }

  return (
    <main className="overflow-auto flex-1 flex flex-col">
      <AiReviewConfig />
    </main>
  );
}

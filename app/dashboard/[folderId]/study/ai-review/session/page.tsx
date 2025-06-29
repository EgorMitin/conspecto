'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AiReviewSession from '@/components/dashboard/Study/AIReview/AiReviewSession';
import { useAiReviewStore } from '@/lib/stores/ai-review-store';
import { useAppState } from '@/lib/providers/app-state-provider';
import { Loader2 } from 'lucide-react';

export default function AiReviewSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');
  const { loadSession, isLoading, currentSession } = useAiReviewStore();
  const { folderId } = useAppState();

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  useEffect(() => {
    if (currentSession && currentSession.status === 'pending') {
      const baseUrl = `/dashboard/${folderId}/study/ai-review`;
      router.push(`${baseUrl}/loading?sessionId=${sessionId}`);
    }
  }, [currentSession, router, folderId, sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading AI review session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="overflow-auto flex-1 flex flex-col">
      <AiReviewSession />
    </main>
  );
}

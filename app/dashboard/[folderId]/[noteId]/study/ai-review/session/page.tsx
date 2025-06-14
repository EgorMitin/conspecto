'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AiReviewSession from '@/components/dashboard/Study/AIReview/AiReviewSession';
import { useAiReviewStore } from '@/lib/stores/ai-review-store';

export default function AiReviewSessionPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { loadSession } = useAiReviewStore();

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  return (
    <main className="flex-1 flex flex-col">
      <AiReviewSession />
    </main>
  );
}

'use client';

import AiReviewConfig from '@/components/dashboard/Study/AIReview/AiReviewConfig';
import { useUser } from '@/lib/context/UserContext';
import { useAppState } from '@/lib/providers/app-state-provider';
import { Loader2 } from 'lucide-react';
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your AI Review...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="overflow-auto flex-1 flex flex-col">
      <AiReviewConfig />
    </main>
  );
}

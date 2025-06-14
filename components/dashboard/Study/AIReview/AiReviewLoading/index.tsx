'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Loader2, CheckCircle } from 'lucide-react';
import { useAiReviewStore } from '@/lib/stores/ai-review-store';
import { useAppState } from '@/lib/providers/app-state-provider';
import { GENERATION_STEPS } from '../constants';


export default function AiReviewLoading() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { folderId, noteId } = useAppState();
  const { loadSession, currentSession, isLoading, error } = useAiReviewStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      router.push(`/dashboard/${folderId}/${noteId}/study/ai-review`);
      return;
    }

    loadSession(sessionId);
  }, [sessionId, loadSession, router, folderId, noteId]);

  useEffect(() => {
    if (progress >= 95) return; // Don't go above 95% until ready

    const minDelay = 300;
    const maxDelay = 1200;
    const minIncrement = 2;
    const maxIncrement = 7;

    const timeout = setTimeout(() => {
      setProgress((prev) => {
        const increment = Math.random() * (maxIncrement - minIncrement) + minIncrement;
        return Math.min(prev + increment, 95);
      });
    }, Math.random() * (maxDelay - minDelay) + minDelay);

    return () => clearTimeout(timeout);
  }, [progress]);

  useEffect(() => {
    const steps = GENERATION_STEPS.length;
    const percentPerStep = 95 / steps;
    const step = Math.min(
      Math.floor(progress / percentPerStep),
      steps - 1
    );
    setCurrentStep(step);
  }, [progress]);

  // Jump to 100% when session is ready
  useEffect(() => {
    if (currentSession && currentSession.status === 'ready_for_review') {
      setProgress(100);
      setTimeout(() => {
        router.push(`/dashboard/${folderId}/${noteId}/study/ai-review/session`);
        return;
      }, 500);
    }

    if (error) {
      router.push(`/dashboard/${folderId}/${noteId}/study/ai-review?error=${encodeURIComponent(error)}`);
      return;
    }
  }, [currentSession, error, router, folderId, noteId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl">Generating AI Review</CardTitle>
            <p className="text-sm text-muted-foreground">
              Creating personalized questions based on your note content
            </p>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Progress */}
            <div className="space-y-2">
              <Progress
                value={progress}
                className="h-3 transition-all duration-500 ease-out bg-gray-200 [&>div]:transition-all [&>div]:duration-700 [&>div]:ease-in-out"
              />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>

            {/* Current Step */}
            <div className="space-y-4">
              {GENERATION_STEPS.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${index === currentStep
                    ? 'bg-purple-50 border border-purple-200'
                    : index < currentStep
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                    }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : index === currentStep ? (
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={`text-sm ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                This usually takes 30-60 seconds
              </p>
              <p className="text-xs text-muted-foreground">
                Please don't close this page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

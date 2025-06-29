'use client';

import ReviewSession from "@/components/dashboard/Study/ReviewSession";
import { useUser } from "@/lib/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserReviewPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'due' | 'all' | null>(null);

  // Get mode from URL params or show selection
  useEffect(() => {
    const modeParam = searchParams.get('mode') as 'due' | 'all' | null;
    if (modeParam === 'due' || modeParam === 'all') {
      setMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      toast.error("No user found");
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (mode) {
    return (
      <main className="flex-1 flex flex-col overflow-auto">
        <ReviewSession sourceType="user" sourceId={user.id} mode={mode} />
      </main>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review All Notes</h1>
        <p className="text-muted-foreground">
          Choose how you want to review questions from all your notes and folders.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
          onClick={() => router.push('/dashboard/review?mode=due')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100 dark:bg-orange-900/20 w-fit">
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-xl">Due Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Review questions that are scheduled for today based on spaced repetition.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Optimized for retention</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Focus on what needs review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
          onClick={() => router.push('/dashboard/review?mode=all')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 w-fit">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl">All Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Practice with all questions from your notes, regardless of schedule.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Complete practice session</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Review everything</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className="min-w-32"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

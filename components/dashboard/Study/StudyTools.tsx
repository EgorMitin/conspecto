'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Zap, BookOpen, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReviewStore } from "@/lib/stores/review-store";

interface QuickActionsProps {
  noteId: string;
  folderId: string;
  totalQuestions: number;
}

export default function StudyTools({
  noteId,
  folderId,
  totalQuestions = 0,
}: QuickActionsProps) {
  const router = useRouter();
  const { startReviewSession } = useReviewStore();

  const handleReviewAll = async (): Promise<void> => {
    await startReviewSession({ mode: 'all', scope: 'note', scopeId: noteId });
    router.push(`${window.location.pathname}/review`);
  };

  const handleAiSummary = () => {
    router.push(`/dashboard/${folderId}/${noteId}/study/ai-summary`);
  };

  const handleAiReview = () => {
    router.push(`/dashboard/${folderId}/${noteId}/study/ai-review`);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Study Tools</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Review All Questions */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                Review All
              </span>
              {totalQuestions > 0 && (
                <Badge variant="secondary">
                  {totalQuestions} total
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 flex-grow">
            <p className="text-sm text-muted-foreground">
              {totalQuestions > 0
                ? `Practice with all ${totalQuestions} question${totalQuestions === 1 ? '' : 's'} from this note`
                : "No questions available yet"
              }
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleReviewAll}
              disabled={totalQuestions === 0}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              {totalQuestions > 0 ? "Review All" : "No Questions"}
            </Button>
          </CardFooter>
        </Card>

        {/* AI Summary */}
        <Card className="relative overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                AI Summary
              </span>
              <Badge variant="outline">
                Quick Read
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 flex-grow">
            <p className="text-sm text-muted-foreground">
              Get an AI-generated summary of key concepts and important points from your notes
            </p>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAiSummary}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <FileText className="h-4 w-4" />
              Generate Summary
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Trophy, Brain, TrendingUp, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviewStore } from "@/lib/stores/review-store";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/providers/app-state-provider";
import { formatNextReviewDate } from "@/utils/global";

interface TodaySectionProps {
  questionsDueToday: number;
  questionsDueTomorrow: number;
  nextAiReviewDate: Date;
  lastSessionScore?: number;
  lastSessionMaxScore?: number;
}



export default function TodaySection({
  questionsDueToday = 0,
  questionsDueTomorrow = 0,
  nextAiReviewDate,
  lastSessionScore,
  lastSessionMaxScore = 10
}: TodaySectionProps) {
  const scorePercentage = lastSessionScore ? (lastSessionScore / lastSessionMaxScore) * 100 : 0;
  const { startReviewSession } = useReviewStore();
  const { noteId } = useAppState();
  if (!noteId) return <div className="p-6">No note selected</div>;
  const router = useRouter()

  const handleQuestionReview = async (): Promise<void> => {
    await startReviewSession({ mode: 'due', scope: 'note', scopeId: noteId });
    router.push(`${window.location.pathname}/review`);
  };

  const handleAiReview = async () => {
    router.push(`${window.location.pathname}/ai-review`);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Due Today</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Today's Reviews
              </span>
              <Badge variant={questionsDueToday > 0 ? "default" : "secondary"}>
                {questionsDueToday}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-grow">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {questionsDueToday > 0
                  ? `You have ${questionsDueToday} question${questionsDueToday === 1 ? '' : 's'} to review today`
                  : "No questions due today! Great job staying on top of your reviews."
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {`And ${questionsDueTomorrow} question${questionsDueTomorrow === 1 ? '' : 's'} to review tommorow`}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleQuestionReview}
              disabled={questionsDueToday === 0}
              className="w-full"
              size="sm"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              {questionsDueToday > 0 ? "Start Review" : "All Done"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                AI Concept Review
              </span>
              <Badge variant="secondary">
                Not to remember<br />
                - to understand
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-grow">
            <div className="space-y-2">
              {nextAiReviewDate ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {formatNextReviewDate(nextAiReviewDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for deeper concept understanding
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Ready for your first AI concept review?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Test your deep understanding of the material
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAiReview}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Brain className="h-4 w-4 mr-2" />
              Start AI Review
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Last Session
              </span>
              {lastSessionScore !== undefined && (
                <Badge variant={scorePercentage >= 80 ? "default" : scorePercentage >= 60 ? "secondary" : "outline"}>
                  {lastSessionScore}/{lastSessionMaxScore}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-grow">
            <div className="space-y-3">
              {lastSessionScore !== undefined ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="text-sm font-medium">{scorePercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={scorePercentage} className="h-2" />
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No previous sessions yet. Start your first review to track progress!
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <div className="pt-2 border-t w-full">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {scorePercentage >= 80 ? "Wanna beat it? 🎯" :
                    scorePercentage >= 60 ? "Room for improvement!" :
                      "Ready for a comeback?"}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
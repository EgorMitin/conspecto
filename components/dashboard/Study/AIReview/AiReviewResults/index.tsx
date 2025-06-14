'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  SkipForward, 
  Brain, 
  Trophy,
  TrendingUp,
  RotateCcw,
  Home
} from 'lucide-react';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useAiReviewStore } from '@/lib/stores/ai-review-store';
import QuestionReview from './QuestionReview';
import { formatTime } from '../functions';
import ScoreCard from './ScoreCard';


export default function AiReviewResults() {
  const router = useRouter();
  const { folderId, noteId } = useAppState();
  const { currentSession, endSession, getSessionElapsedTime } = useAiReviewStore();

  useEffect(() => {
    if (!currentSession || currentSession.status !== 'completed') {
      router.push(`/dashboard/${folderId}/${noteId}/study/ai-review`);
    }
  }, [currentSession, router, folderId, noteId]);

  if (!currentSession || !currentSession.result || !currentSession.generatedQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  const { result, generatedQuestions, difficulty } = currentSession;
  const { totalQuestions, correctAnswers, skippedAnswers } = result;
  const incorrectAnswers = totalQuestions - correctAnswers - skippedAnswers;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const sessionTime = getSessionElapsedTime();

  const getScoreMessage = () => {
    if (scorePercentage >= 90) return { message: "Outstanding! 🎉", color: "text-green-600" };
    if (scorePercentage >= 80) return { message: "Excellent work! 🌟", color: "text-green-600" };
    if (scorePercentage >= 70) return { message: "Good job! 👍", color: "text-blue-600" };
    if (scorePercentage >= 60) return { message: "Not bad! 💪", color: "text-orange-600" };
    return { message: "Keep practicing! 📚", color: "text-red-600" };
  };

  const scoreMessage = getScoreMessage();

  const handleRetryReview = () => {
    endSession();
    router.push(`/dashboard/${folderId}/${noteId}/study/ai-review`);
  };

  const handleBackToStudy = () => {
    endSession();
    router.push(`/dashboard/${folderId}/${noteId}/study/`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Review Complete!</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {difficulty?.toUpperCase()} Level • {formatTime(sessionTime)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Score Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">{scorePercentage}%</h2>
                <p className={`text-lg font-medium ${scoreMessage.color}`}>
                  {scoreMessage.message}
                </p>
              </div>
              
              <Progress value={scorePercentage} className="w-full h-3" />
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <ScoreCard
                  title="Correct"
                  value={correctAnswers}
                  total={totalQuestions}
                  icon={CheckCircle}
                  color="bg-green-500"
                />
                <ScoreCard
                  title="Incorrect"
                  value={incorrectAnswers}
                  total={totalQuestions}
                  icon={XCircle}
                  color="bg-red-500"
                />
                <ScoreCard
                  title="Skipped"
                  value={skippedAnswers}
                  total={totalQuestions}
                  icon={SkipForward}
                  color="bg-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Session Stats</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Total Questions: {totalQuestions}</p>
                  <p>Time Spent: {formatTime(sessionTime)}</p>
                  <p>Average per Question: {formatTime(Math.floor(sessionTime / totalQuestions))}</p>
                  <p>Difficulty Level: {difficulty?.toUpperCase()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Next Steps</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {scorePercentage >= 80 && (
                    <p>✅ Consider trying a higher difficulty level</p>
                  )}
                  {scorePercentage < 80 && scorePercentage >= 60 && (
                    <p>📖 Review the material and try again</p>
                  )}
                  {scorePercentage < 60 && (
                    <p>📚 Focus on understanding core concepts</p>
                  )}
                  <p>🔄 Take regular AI reviews to track progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <QuestionReview
                key={question.id} 
                question={question} 
                index={index} 
              />
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleRetryReview}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={handleBackToStudy}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Study
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

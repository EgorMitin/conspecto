'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  SkipForward,
  Brain,
  Trophy,
  TrendingUp,
  RotateCcw,
  Home,
  Clock,
  FolderOpen
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
      router.push(`/dashboard/${folderId}/${noteId ? noteId + '/' : ''}study/ai-review`);
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
  const sessionTime = getSessionElapsedTime();

  // Enhanced scoring logic that considers partial scores
  const detailedResults = generatedQuestions?.reduce((acc, question) => {
    if (question.status === 'skipped') {
      acc.skipped++;
    } else if (question.evaluation === 'correct') {
      acc.correct++;
      acc.totalScore += question.score || 100;
    } else if (question.evaluation === 'partial') {
      acc.partial++;
      acc.totalScore += question.score || 50;
    } else if (question.evaluation === 'incorrect') {
      acc.incorrect++;
      acc.totalScore += question.score || 0;
    }
    return acc;
  }, { correct: 0, partial: 0, incorrect: 0, skipped: 0, totalScore: 0 }) ||
    { correct: correctAnswers, partial: 0, incorrect: totalQuestions - correctAnswers - skippedAnswers, skipped: skippedAnswers, totalScore: correctAnswers * 100 };

  const maxPossibleScore = totalQuestions * 100;
  const actualScorePercentage = maxPossibleScore > 0 ? Math.round((detailedResults.totalScore / maxPossibleScore) * 100) : 0;

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding! 🎉", color: "text-green-600", bgColor: "bg-green-100", gradient: "from-green-500 to-emerald-600" };
    if (score >= 80) return { message: "Excellent work! 🌟", color: "text-green-600", bgColor: "bg-green-100", gradient: "from-green-500 to-green-600" };
    if (score >= 70) return { message: "Good job! 👍", color: "text-blue-600", bgColor: "bg-blue-100", gradient: "from-blue-500 to-blue-600" };
    if (score >= 60) return { message: "Not bad! 💪", color: "text-orange-600", bgColor: "bg-orange-100", gradient: "from-orange-500 to-yellow-600" };
    return { message: "Keep practicing! 📚", color: "text-red-600", bgColor: "bg-red-100", gradient: "from-red-500 to-red-600" };
  };

  const scoreMessage = getScoreMessage(actualScorePercentage);

  const handleRetryReview = () => {
    endSession();
    router.push(`/dashboard/${folderId}/${noteId ? noteId + '/' : ''}study/ai-review`);
  };

  const handleBackToStudy = () => {
    endSession();
    router.push(`/dashboard/${folderId}/${noteId ? noteId + '/' : ''}study/`);
  };

  const handleToStudyFolder = () => {
    router.push(`/dashboard/${folderId}/study`)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    Review Complete!
                  </CardTitle>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="bg-white/70 dark:bg-gray-800/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                      {difficulty?.toUpperCase()} Level
                    </Badge>
                    <Badge variant="secondary" className="bg-white/70 dark:bg-gray-800/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(sessionTime)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Session Score</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {actualScorePercentage}%
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${scoreMessage.gradient} opacity-5`}></div>
          <CardContent className="p-8 relative">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className={`p-3 rounded-full ${scoreMessage.bgColor}`}>
                    <Trophy className={`h-8 w-8 ${scoreMessage.color}`} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                      {actualScorePercentage}%
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Total Score: {detailedResults.totalScore}/{maxPossibleScore} points
                    </p>
                  </div>
                </div>
                <p className={`text-xl font-semibold ${scoreMessage.color}`}>
                  {scoreMessage.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Progress</span>
                  <span>{actualScorePercentage}%</span>
                </div>
                <Progress value={actualScorePercentage} className="w-full h-4" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <ScoreCard
                  title="Correct"
                  value={detailedResults.correct}
                  total={totalQuestions}
                  icon={CheckCircle}
                  color="bg-green-500"
                />
                <ScoreCard
                  title="Partial"
                  value={detailedResults.partial}
                  total={totalQuestions}
                  icon={Brain}
                  color="bg-yellow-500"
                />
                <ScoreCard
                  title="Incorrect"
                  value={detailedResults.incorrect}
                  total={totalQuestions}
                  icon={XCircle}
                  color="bg-red-500"
                />
                <ScoreCard
                  title="Skipped"
                  value={detailedResults.skipped}
                  total={totalQuestions}
                  icon={SkipForward}
                  color="bg-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  📊 Session Statistics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Total Questions:</span>
                    <span className="font-medium text-foreground">{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Time Spent:</span>
                    <span className="font-medium text-foreground">{formatTime(sessionTime)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Average per Question:</span>
                    <span className="font-medium text-foreground">{formatTime(Math.floor(sessionTime / totalQuestions))}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty Level:</span>
                    <span className="font-medium text-foreground capitalize">{difficulty}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy Score:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{actualScorePercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  🎯 Performance Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-foreground">Perfect answers: {detailedResults.correct}</span>
                  </div>
                  {detailedResults.partial > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-foreground">Partial credit: {detailedResults.partial}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-foreground">Need improvement: {detailedResults.incorrect}</span>
                  </div>
                  {detailedResults.skipped > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-foreground">Skipped: {detailedResults.skipped}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                💡 Personalized Recommendations
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {actualScorePercentage >= 85 && (
                  <p className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">✅</span>
                    Excellent performance! Consider trying a higher difficulty level to challenge yourself further.
                  </p>
                )}
                {actualScorePercentage >= 70 && actualScorePercentage < 85 && (
                  <p className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">📈</span>
                    Good work! Review the questions you got wrong and try similar questions to solidify your understanding.
                  </p>
                )}
                {actualScorePercentage >= 50 && actualScorePercentage < 70 && (
                  <p className="flex items-center gap-2">
                    <span className="text-orange-600 dark:text-orange-400">📖</span>
                    Consider reviewing the material more thoroughly before your next session.
                  </p>
                )}
                {actualScorePercentage < 50 && (
                  <p className="flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400">📚</span>
                    Focus on understanding the core concepts. Consider breaking down the material into smaller sections.
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">🔄</span>
                  Regular AI reviews help track your progress and improve retention over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg pt-0">
          <CardHeader className="rounded-t-xl pt-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Question Review & Analysis
              <Badge variant="secondary" className="ml-auto">
                {generatedQuestions?.length || 0} Questions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {generatedQuestions?.map((question, index) => (
                <QuestionReview
                  key={question.id}
                  question={question}
                  index={index}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-b-none bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border-2 border-b-0 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">What's Next?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Choose your next action to continue your learning journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className='flex flex-row items-center justify-center gap-4'>
                  <Button
                    onClick={handleRetryReview}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-3 px-6 py-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Try Again</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">New set of questions</div>
                    </div>
                  </Button>

                  {noteId &&
                    <Button
                      onClick={handleToStudyFolder}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-3 px-6 py-3 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200"
                    >
                      <FolderOpen className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">Study Folder</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">All notes at once</div>
                      </div>
                    </Button>
                  }
                </div>

                <Button
                  onClick={handleBackToStudy}
                  type="button"
                  size="lg"
                  className="flex items-center gap-3 px-2 py-1 border border-transparent hover:border-blue-700 dark:hover:border-indigo-700 rounded-lg bg-gradient-to-r bg-indigo-600 hover:bg-blue-700 transition-all duration-200 shadow-lg text-primary font-medium"
                  style={{ minWidth: 0 }}
                >
                  <Home className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium text-xs">Back to Study</div>
                    <div className="text-xs opacity-90">Continue learning</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

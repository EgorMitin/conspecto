'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  SkipForward,
  CheckCircle,
  Loader2,
  Brain,
  Target
} from 'lucide-react';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useAiReviewStore } from '@/lib/stores/ai-review-store';
import QuestionTypeInfo from './QuestionTypeInfo';
import EvaluationDisplay from './EvaluationDisplay';
import { formatTime } from '../functions';

export default function AiReviewSession() {
  const router = useRouter();
  const { folderId, noteId } = useAppState();
  const {
    currentSession,
    submitAnswer,
    evaluateAnswer,
    skipQuestion,
    nextQuestion,
    previousQuestion,
    completeSession,
    endSession,
    getSessionElapsedTime,
    getCurrentQuestion,
    addTimeSpentToCurrentQuestion,
    getProgress,
  } = useAiReviewStore();

  const [sessionTime, setSessionTime] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();


  useEffect(() => {
    if (!currentSession) {
      router.push(`/dashboard/${folderId}/${noteId}/study/ai-review`);
      return;
    }

    const interval = setInterval(() => {
      setSessionTime(getSessionElapsedTime());
      if (currentQuestion && currentQuestion.status === 'generated') {
        addTimeSpentToCurrentQuestion(1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, getSessionElapsedTime, currentQuestion, addTimeSpentToCurrentQuestion, router, folderId, noteId]);

  useEffect(() => {
    if (currentQuestion) {
      setCurrentAnswer(currentQuestion.answer || '');
    }
  }, [currentQuestion?.id]);

  const handleEndSession = () => {
    router.push(`/dashboard/${folderId}/${noteId}/study/`);
    endSession();
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !currentAnswer.trim()) return;

    submitAnswer(currentQuestion.id, currentAnswer.trim());
  };

  const handleEvaluateAnswer = async () => {
    if (!currentQuestion) return;

    setIsEvaluating(true);
    try {
      await evaluateAnswer(currentQuestion.id);
    } catch (error) {
      console.error('Evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkipQuestion = () => {
    if (!currentQuestion) return;

    skipQuestion(currentQuestion.id);
    nextQuestion();
    setCurrentAnswer('');
  };

  const handleNextQuestion = () => {
    nextQuestion();
    setCurrentAnswer('');
  };

  const handlePreviousQuestion = () => {
    previousQuestion();
  };

  const handleCompleteSession = async () => {
    await completeSession();
    router.push(`/dashboard/${folderId}/${noteId}/study/ai-review/results`);
  };

  console.debug('Current Question:', currentQuestion);

  const isLastQuestion = currentSession && currentQuestion &&
    currentSession.currentQuestionIndex === (currentSession.generatedQuestions?.length || 0) - 1;

  const allQuestionsAnswered = currentSession?.generatedQuestions?.every(
    q => q.status === 'answered' || q.status === 'skipped' || q.status === 'evaluated'
  ) || false;

  if (!currentSession || !currentQuestion) {
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">AI Review Session</CardTitle>
                </div>
                <Badge variant="outline">
                  {currentSession.difficulty?.toUpperCase()} Level
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEndSession}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
            <div className="flex items-start justify-start gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="inline-block w-12">{formatTime(sessionTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="inline-block w-12">
                  {formatTime(currentQuestion.timeSpent || 0)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>
                  Question {currentSession.currentQuestionIndex + 1} of {currentSession.generatedQuestions?.length || 0}
                </span>
              </div>
            </div>
            <Progress value={progress.percentage} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <QuestionTypeInfo type={currentQuestion.question_type} />

              <div className="flex items-center gap-2">
                {/* Submit Session Button */}
                {!allQuestionsAnswered && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCompleteSession}
                      size="lg"
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Submit Session
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousQuestion}
                  disabled={currentSession.currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextQuestion}
                  disabled={!!isLastQuestion}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-medium text-foreground">
                {currentQuestion.question}
              </h3>
              {currentQuestion.options && (
                <ul className="list-disc pl-5">
                  {currentQuestion.options.map((option, index) => (
                    <li key={index} className="text-muted-foreground">
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px] resize-none"
                disabled={currentQuestion.status === 'skipped'}
              />

              <div className="flex items-center gap-3">
                {currentQuestion.status === 'generated' && (
                  <>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!currentAnswer.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Submit Answer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSkipQuestion}
                      className="flex items-center gap-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip Question
                    </Button>
                  </>
                )}

                {currentQuestion.status === 'answered' && !currentQuestion.evaluation && (
                  <Button
                    onClick={handleEvaluateAnswer}
                    disabled={isEvaluating}
                    className="flex items-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Evaluate Answer
                      </>
                    )}
                  </Button>
                )}

                {currentQuestion.status === 'evaluating' && (
                  <Button disabled className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </Button>
                )}
              </div>
            </div>

            {/* Evaluation Result */}
            <EvaluationDisplay question={currentQuestion} />
          </CardContent>
        </Card>

        {/* Navigation & Completion */}
        {allQuestionsAnswered && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Session Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    You've answered all questions. Ready to see your results?
                  </p>
                </div>
                <Button
                  onClick={handleCompleteSession}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  View Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

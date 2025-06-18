'use client';

import { useEffect, useRef, useState } from 'react';
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
import Confetti from 'react-dom-confetti';
import AnimatedEvaluatingBorder from './AnimatedEvaluatingBorder';

export default function AiReviewSession() {
  const router = useRouter();
  const { folderId, noteId, dispatch } = useAppState();
  const {
    currentSession,
    submitAnswer,
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
  const [showConfetti, setShowConfetti] = useState(false);

  const currentQuestion = getCurrentQuestion();
  const currentQuestionId = currentQuestion?.id || '';
  const progress = getProgress();
  const prevStatusRef = useRef(currentQuestion?.status);

  const isLastQuestion = currentSession && currentQuestion &&
    currentSession.currentQuestionIndex === (currentSession.generatedQuestions?.length || 0) - 1;
  const allQuestionsAnswered = currentSession?.generatedQuestions?.every(
    q => q.status === 'answered' || q.status === 'skipped' || q.status === 'evaluated'
  ) || false;

  useEffect(() => {
    if (!currentSession) {
      router.push(`/dashboard/${folderId}/${noteId ? noteId+'/' : ''}study/ai-review`);
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
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      setCurrentAnswer(currentQuestion.answer || '');
    }
  }, [currentQuestionId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Submit answer with Cmd/Ctrl + Enter
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (currentQuestion?.status === 'generated' && currentAnswer.trim() && !isEvaluating) {
          handleSubmitAnswer();
        }
      }

      // Navigate with arrow keys (only when not typing in textarea!)
      if (event.target !== document.querySelector('textarea')) {
        // Previous question with Left arrow or Cmd/Ctrl + Left
        if (event.key === 'ArrowLeft' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft')) {
          event.preventDefault();
          if (currentSession && currentSession.currentQuestionIndex > 0) {
            handlePreviousQuestion();
          }
        }

        // Next question with Right arrow or Cmd/Ctrl + Right
        if (event.key === 'ArrowRight' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight')) {
          event.preventDefault();
          if (currentSession && !isLastQuestion) {
            handleNextQuestion();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, currentAnswer, isEvaluating, currentSession, isLastQuestion]);

  useEffect(() => {
    if (
      currentQuestion &&
      prevStatusRef.current === 'evaluating' &&
      currentQuestion.status === 'evaluated' &&
      currentQuestion.evaluation === 'correct'
    ) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }
    prevStatusRef.current = currentQuestion?.status;
  }, [currentQuestion?.status, currentQuestion?.evaluation]);

  const handleEndSession = () => {
    router.push(`/dashboard/${folderId}/${noteId ? noteId+'/' : ''}study/`);
    endSession();
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentAnswer.trim()) return;
    setIsEvaluating(true);

    submitAnswer(currentQuestion.id, currentAnswer.trim()).then(() => {
      setIsEvaluating(false);
    }).catch((error) => {
      console.error('Error submitting answer:', error);
      setIsEvaluating(false);
    });
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
    await completeSession(dispatch);
    router.push(`/dashboard/${folderId}/${noteId ? noteId+'/' : ''}study/ai-review/results`);
  };

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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <QuestionTypeInfo type={currentQuestion.question_type} />

              <div className="flex items-center gap-2">
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

            <div className="space-y-3">
              <div className="flex relative justify-center">
                <div className="relative z-10 m-[2px] w-full bg-background rounded-md">
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className={`min-h-[120px] border-white resize-none transition-all duration-300 ${isEvaluating ? 'border-transparent' : ''
                      }`}
                    disabled={['skipped', 'evaluated', 'answered'].includes(currentQuestion.status)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Confetti active={showConfetti} />
                  </div>
                </div>
                {isEvaluating && (<AnimatedEvaluatingBorder />)}
              </div>

              <div className="flex items-center gap-3">
                {currentQuestion.status === 'generated' && (
                  <>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!currentAnswer.trim() || isEvaluating}
                      className="flex items-center gap-2"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Evaluate Answer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSkipQuestion}
                      disabled={!!isLastQuestion}
                      className="flex items-center gap-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip Question
                    </Button>
                  </>
                )}

                {currentQuestion.status === 'evaluating' && (
                  <Button disabled className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating...
                  </Button>
                )}
              </div>
            </div>

            <EvaluationDisplay question={currentQuestion} />
            {(!isLastQuestion && currentQuestion.status === 'evaluated' && currentQuestion.evaluation) && (
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleNextQuestion}
                  variant="secondary"
                  className="flex items-center gap-2"
                  disabled={isEvaluating}
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {allQuestionsAnswered && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Session Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ve answered all questions. Ready to see your results?
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

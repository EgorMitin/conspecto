'use client';

import { useEffect, useState } from 'react';
import { useReviewStore } from '@/lib/stores/review-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Eye, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useRouter } from 'next/navigation';
import ReviewEditor from './Editor';
import { Question } from '@/types/Question';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const FeedbackButton = ({
  level,
  label,
  onClick
}: {
  level: 1 | 2 | 3 | 4;
  label: string;
  onClick: () => void;
}) => {
  const variants = {
    1: 'bg-red-500 hover:bg-red-600 text-white',
    2: 'bg-orange-500 hover:bg-orange-600 text-white',
    3: 'bg-blue-500 hover:bg-blue-600 text-white',
    4: 'bg-green-500 hover:bg-green-600 text-white',
  };

  return (
    <Button
      onClick={onClick}
      className={`flex-1 ${variants[level]}`}
      size="lg"
    >
      {label}
      <span className="flex items-center justify-center ml-1">
        <kbd className="w-5 h-5 px-1 py-0 flex items-center justify-center rounded text-xs font-mono border border-muted-background/20">
          {level}
        </kbd>
      </span>
    </Button>
  );
};

export default function ReviewSession({ noteContent, noteTitle }: { noteContent: string, noteTitle: string }) {
  const {
    currentSession,
    showAnswer,
    submitFeedback,
    endSession,
    getSessionElapsedTime,
    getCurrentQuestionElapsedTime
  } = useReviewStore();

  const [sessionTime, setSessionTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const router = useRouter();
  const { folderId, noteId } = useAppState();

  const handleEndSession = () => {
    router.push(`/dashboard/${folderId}/${noteId}/study/`);
    endSession()
  }

  useEffect(() => {
    if (!currentSession) {
      router.push(`/dashboard/${folderId}/${noteId}/study/`);
    }
    const interval = setInterval(() => {
      setSessionTime(getSessionElapsedTime());
      setQuestionTime(getCurrentQuestionElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, getSessionElapsedTime, getCurrentQuestionElapsedTime]);


  // Hotkey handler for "Show Answer" (Space) and feedback (1-4)
  useEffect(() => {
    if (!currentSession) {
      router.push(`/dashboard/${folderId}/${noteId}/study/`);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentSession) {
        router.push(`/dashboard/${folderId}/${noteId}/study/`);
        return
      }
      if (!currentSession.isShowingAnswer) {
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          showAnswer();
        }
      } else {
        if (!e.repeat) {
          if (e.key === '1') {
            submitFeedback(1);
          } else if (e.key === '2') {
            submitFeedback(2);
          } else if (e.key === '3') {
            submitFeedback(3);
          } else if (e.key === '4') {
            submitFeedback(4);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSession, showAnswer, submitFeedback]);

  if (!currentSession) {
    return;
  }

  const currentQuestion = currentSession.questions.find(q => q.id === currentSession.currentQuestionId) as Question;
  const answeredQuestionsRation = (currentSession.questions.length - currentSession.questionsToAnswer.size) / currentSession.questions.length
  const progress = answeredQuestionsRation * 100;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">
                  Review Session - {currentSession.mode === 'due' ? 'Due Questions' : 'All Questions'}
                </CardTitle>
                <Badge variant="outline">
                  {currentSession.questions.length - currentSession.questionsToAnswer.size} / {currentSession.questions.length}
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
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Session: {formatTime(sessionTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Question: {formatTime(questionTime)}</span>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        <Card className='gap-0'>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{noteTitle}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-none ReviewEditor">
              <ReviewEditor content={noteContent} />
            </div>

          </CardContent>
        </Card>

        <Card
          className="fixed bottom-4 left-1/2 z-30 transform -translate-x-1/2 w-full max-w-xl shadow-xl border border-muted bg-amber-100/10 backdrop-blur py-2 rounded-2xl px-0 sm:px-2 transition-all"
          style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)' }}
        >
          <CardContent className="py-0 z-10 my-0">
            {!currentSession.isShowingAnswer ? (
              <div className="text-center py-0 flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-2">
                  {currentQuestion.question}
                </p>
                <Button onClick={showAnswer} size="sm" className="px-8 rounded-full shadow flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Show Answer
                  <span className="flex items-center justify-center ml-1">
                    <kbd className="pb-0.5 px-1 pt-0 rounded text-xs font-mono border border-muted-background/20">
                      ␣
                    </kbd>
                  </span>
                </Button>
              </div>
            ) : (
              <div className="border-t border-muted space-y-4">
                <h3 className="text-lg font-semibold text-center p-0">
                  How well did you answer?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <FeedbackButton
                    level={1}
                    label="Again"
                    onClick={() => submitFeedback(1)}
                  />
                  <FeedbackButton
                    level={2}
                    label="Hard"
                    onClick={() => submitFeedback(2)}
                  />
                  <FeedbackButton
                    level={3}
                    label="Good"
                    onClick={() => submitFeedback(3)}
                  />
                  <FeedbackButton
                    level={4}
                    label="Easy"
                    onClick={() => submitFeedback(4)}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  <p>1: Complete blank • 2: Wrong but had some idea • 3: Right but hesitated • 4: Perfect recall</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
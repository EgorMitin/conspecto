'use client';

import { useEffect, useState } from 'react';
import { useReviewStore } from '@/lib/stores/review-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Eye, X, Loader2 } from 'lucide-react';
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

export default function ReviewSession({
  sourceType,
  sourceId,
  mode
}: {
  sourceType: 'note' | 'folder' | 'user';
  sourceId: string;
  mode: 'due' | 'all';
}) {
  const {
    currentSession,
    startReviewSession,
    showAnswer,
    submitFeedback,
    endSession,
    getSessionElapsedTime,
    getCurrentQuestionElapsedTime
  } = useReviewStore();

  const [sessionTime, setSessionTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const router = useRouter();
  const { folderId, noteId, state } = useAppState();

  // Determine the scope and scope ID based on the provided props
  const determineScope = (): { scope: 'note' | 'folder' | 'user'; scopeId: string; displayTitle: string; content?: string } => {
    if (sourceType === 'folder') {
      const folder = state.folders.find(f => f.id === sourceId);
      if (!folder) throw Error("folder doesn't exist");
      return {
        scope: 'folder',
        scopeId: sourceId,
        displayTitle: folder.name
      };
    } else if (sourceType === 'note') {
      const folder = state.folders.find(f => f.id === folderId);
      const note = folder?.notes.find(n => n.id === sourceId);
      if (!note) throw Error("note doesn't exist");
      return {
        scope: 'note',
        scopeId: sourceId,
        displayTitle: note.title,
        content: note.content
      };
    } else if (sourceType === 'user') {
      return {
        scope: 'user',
        scopeId: sourceId,
        displayTitle: 'All Notes'
      };
    }
    throw Error("Unsupported sourceType")
  };

  const { scope, scopeId, displayTitle, content } = determineScope();

  const handleEndSession = () => {
    if (scope === 'note') {
      router.push(`/dashboard/${folderId}/${noteId}/study/`);
    } else if (scope === 'folder') {
      router.push(`/dashboard/${folderId}/study/`);
    } else {
      router.push(`/dashboard/`);
    }
    endSession();
  };

  useEffect(() => {
    if (!currentSession) {
      startReviewSession({
        mode: mode,
        scope,
        scopeId
      });
    }
  }, [currentSession, startReviewSession, scope, scopeId]);

  useEffect(() => {
    if (!currentSession) {
      if (scope === 'note') {
        router.push(`/dashboard/${folderId}/${noteId}/study/`);
      } else if (scope === 'folder') {
        router.push(`/dashboard/${folderId}/study/`);
      } else {
        router.push(`/dashboard/`);
      }
    }
    const interval = setInterval(() => {
      setSessionTime(getSessionElapsedTime());
      setQuestionTime(getCurrentQuestionElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, getSessionElapsedTime, getCurrentQuestionElapsedTime, router, folderId, noteId, scope]);


  // Hotkey handler for "Show Answer" (Space) and feedback (1-4)
  useEffect(() => {
    if (!currentSession) {
      if (scope === 'note') {
        router.push(`/dashboard/${folderId}/${noteId}/study/`);
      } else if (scope === 'folder') {
        router.push(`/dashboard/${folderId}/study/`);
      } else {
        router.push(`/dashboard/`);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentSession) {
        if (scope === 'note') {
          router.push(`/dashboard/${folderId}/${noteId}/study/`);
        } else if (scope === 'folder') {
          router.push(`/dashboard/${folderId}/study/`);
        } else {
          router.push(`/dashboard/`);
        }
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Starting your review session...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentSession.questions.find(q => q.id === currentSession.currentQuestionId) as Question;
  const answeredQuestionsRatio = (currentSession.questions.length - currentSession.questionsToAnswer.size) / currentSession.questions.length
  const progress = answeredQuestionsRatio * 100;

  const getCurrentQuestionNote = () => {
    if (scope === 'note') {
      return { title: displayTitle, content };
    } else if (scope === 'folder') {
      const folder = state.folders.find(f => f.id === scopeId);
      if (folder) {
        for (const note of folder.notes) {
          if (note.questions.some(q => q.id === currentQuestion.id)) {
            return { title: note.title, content: note.content };
          }
        }
      }
      return { title: 'Unknown Note', content: '' };
    } else {
      // User scope - search through all folders and notes
      for (const folder of state.folders) {
        for (const note of folder.notes) {
          if (note.questions.some(q => q.id === currentQuestion.id)) {
            return { title: note.title, content: note.content, folderName: folder.name };
          }
        }
      }
      return { title: 'Unknown Note', content: '' };
    }
  };

  const currentQuestionNote = getCurrentQuestionNote();
  console.log(currentQuestionNote.content)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg">
                  {scope === 'folder' ? `${displayTitle} Review` :
                   scope === 'user' ? 'All Notes Review' :
                   'Note Review'} - {currentSession.mode === 'due' ? 'Due Questions' : 'All Questions'}
                </CardTitle>
                <Badge variant="outline">
                  {currentSession.questions.length - currentSession.questionsToAnswer.size} / {currentSession.questions.length}
                </Badge>
                {scope === 'folder' && (
                  <Badge variant="secondary">
                    Folder Mode
                  </Badge>
                )}
                {scope === 'user' && (
                  <Badge variant="secondary">
                    User Mode
                  </Badge>
                )}
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
              {(scope === 'folder' || scope === 'user') && (
                <div className="flex items-center gap-2">
                  <span>From: {currentQuestionNote.title}</span>
                  {scope === 'user' && currentQuestionNote.folderName && (
                    <span className="text-xs">({currentQuestionNote.folderName})</span>
                  )}
                </div>
              )}
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        <Card className='gap-0'>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{currentQuestionNote.title}</span>
              {(scope === 'folder' || scope === 'user') && (
                <div className="flex items-center gap-2">
                  {scope === 'user' && currentQuestionNote.folderName && (
                    <Badge variant="outline" className="text-xs">
                      {currentQuestionNote.folderName}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Q {currentSession.questions.findIndex(q => q.id === currentQuestion.id) + 1} of {currentSession.questions.length}
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-none ReviewEditor">
              <ReviewEditor
                key={`${currentQuestion.id}-${currentQuestionNote.title}`}
                content={currentQuestionNote.content || ''}
              />
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
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Settings, ArrowRight, Clock, Target, Zap, Underline, Info, Loader2 } from 'lucide-react';
import { useAppState } from '@/lib/providers/app-state-provider';
import { useAiReviewStore } from '@/lib/stores/ai-review-store';
import { AiReviewDifficulty, AiReviewMode } from '@/types/AiReviewSession';
import { useUser } from '@/lib/context/UserContext';
import { calculateEstimatedTimeString, getRecommendedMode } from '../functions';
import { DIFFICULTY_OPTIONS, MODE_OPTIONS, QUESTION_COUNT_OPTIONS } from '../constants';
import { getNoteById } from '@/lib/server_actions/notes';
import { Note } from '@/types/Note';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function AiReviewConfig() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { noteId, folderId } = useAppState();
  const user = useUser();
  const { startAiReview, isLoading, error: aiReviewError } = useAiReviewStore();

  const [difficulty, setDifficulty] = useState<AiReviewDifficulty>('medium');
  const [mode, setMode] = useState<AiReviewMode>('separate_questions');
  const [questionCount, setQuestionCount] = useState(10);
  const [currentNote, setCurrentNote] = useState<Note | null | undefined>(undefined);
  const [noteLoadingError, setNoteLoadingError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setUrlError(decodeURIComponent(errorParam));

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchNote() {
      if (!noteId) {
        setCurrentNote(undefined);
        return;
      }
      try {
        setNoteLoadingError(null);
        const { data: noteData, error: fetchError } = await getNoteById(noteId);
        if (fetchError !== null) {
          console.error('Failed to fetch note:', fetchError);
          setNoteLoadingError('Failed to load note details.');
          setCurrentNote(null);
        } else {
          setCurrentNote(noteData);
        }
      } catch (e) {
        console.error('Exception while fetching note:', e);
        setNoteLoadingError('An unexpected error occurred while loading note details.');
        setCurrentNote(null);
      }
    }
    fetchNote();
  }, [noteId]);

  const handleStartReview = async () => {
    if (!noteId || !user?.id) return;

    try {
      const sessionId = await startAiReview({
        noteId,
        userId: user.id,
        difficulty,
        mode,
        questionCount
      });
      router.push(`/dashboard/${folderId}/${noteId}/study/ai-review/loading?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Failed to start AI review:', error);
    }
  };

  const selectedDifficulty = DIFFICULTY_OPTIONS.find(d => d.value === difficulty);
  const estimatedTimeString = calculateEstimatedTimeString(difficulty, questionCount);

  const recommendedMode = useMemo(() => {
    if (currentNote === undefined) return undefined;
    if (currentNote === null) return 'separate_questions';
    return getRecommendedMode(currentNote);
  }, [currentNote]);

  if (currentNote === undefined) {
    return (
      <div className="min-h-screen bg-background p-4 flex justify-center items-center">
        <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
        <p className="ml-2">Loading note details...</p>
      </div>
    );
  }

  if (noteLoadingError) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col justify-center items-center">
        <p className="text-red-600">{noteLoadingError}</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        <Button
          variant="outline"
          className="mb-2"
          onClick={() => {
            if (folderId && noteId) {
              router.push(`/dashboard/${folderId}/${noteId}/study`);
            } else {
              router.back();
            }
          }}
        >
          ← Back to Study
        </Button>

        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">AI Concept Review</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test your deep understanding with AI-generated questions
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Difficulty Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Difficulty Level
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DIFFICULTY_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${difficulty === option.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/30'
                    }`}
                  onClick={() => setDifficulty(option.value)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {calculateEstimatedTimeString(option.value, questionCount)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-8">
                    {option.details}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mode & Count Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Review Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Review Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Review Mode
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs">
                        The recommended mode is chosen based on your review history for this note. As you progress, this recommendation may change to best fit your learning needs.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                {MODE_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${mode === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                      }`}
                    onClick={() => setMode(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{option.label}</h4>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {recommendedMode !== undefined && option.value === recommendedMode && (
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-muted-foreground cursor-pointer" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                This recommendation is based on your review history for this note.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-1">
                  <Info className="inline w-3 h-3 mr-1 mb-0.5" />
                  The recommended mode adapts to your learning progress and review quality for this note.
                </p>
              </div>

              {/* Question Count */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Number of Questions</Label>
                <Select
                  value={questionCount.toString()}
                  onValueChange={(value) => setQuestionCount(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_COUNT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {calculateEstimatedTimeString(difficulty, option.value)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Start */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Ready to Start?</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="text-lg">{selectedDifficulty?.icon}</span>
                    {selectedDifficulty?.label} Level
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {questionCount} questions ({estimatedTimeString})
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    {mode === 'separate_questions' ? 'Individual' : 'Comprehensive'} mode
                  </span>
                </div>
              </div>

              <Button
                onClick={handleStartReview}
                disabled={isLoading}
                size="lg"
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Start AI Review
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {(aiReviewError || urlError) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{aiReviewError || urlError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div >
  );
}

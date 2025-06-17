import { create } from 'zustand';
import type { AiReviewSession, AiReviewQuestion, AiReviewMode, AiReviewDifficulty, AiReviewSourceType } from '@/types/AiReviewSession';
import { createAiReviewSession, getAiReviewSession, updateAiReviewSession } from '../server_actions/ai-review';
import { evaluateAnswer, generateQuestionsForSession } from '../server_actions/ai-service';
import { updateNoteReview } from '../server_actions/notes';
import { updateFolderReview } from '../server_actions/folders';
import { Action } from '../providers/app-state-provider';

export interface AiReviewSessionState extends AiReviewSession {
  currentQuestionIndex: number;
  sessionElapsedTime: number;

}

export interface StartAiReviewParams {
  sourceId: string;
  sourceType: AiReviewSourceType;
  userId: string;
  difficulty: AiReviewDifficulty;
  mode: AiReviewMode;
  questionCount: number;
}

interface AiReviewStore {
  currentSession: AiReviewSessionState | null;
  isLoading: boolean;
  error: string | null;

  startAiReview: (params: StartAiReviewParams) => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  submitAnswer: (questionId: string, answer: string) => Promise<void>;
  evaluateAnswer: (questionId: string) => Promise<void>;
  skipQuestion: (questionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeSession: (dispatch: (params: Action) => void) => Promise<void>;
  endSession: () => void;

  getSessionElapsedTime: () => number;
  getCurrentQuestion: () => AiReviewQuestion | null;
  getProgress: () => { answered: number; total: number; percentage: number };

  addTimeSpentToCurrentQuestion: (seconds: number) => void;
  setTimeSpentForQuestion: (questionId: string, seconds: number) => void;
}


export const useAiReviewStore = create<AiReviewStore>((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,

  startAiReview: async (params: StartAiReviewParams) => {
    set({ isLoading: true, error: null });

    try {
      const sessionData: Omit<AiReviewSession, 'id'> = {
        userId: params.userId,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        status: 'pending',
        mode: params.mode,
        difficulty: params.difficulty,
        requestedAt: new Date(),
      };

      const { data: createdSession, error: DBerror } = await createAiReviewSession(sessionData);

      if (DBerror !== null) {
        throw new Error(DBerror);
      }

      generateQuestionsForSession(
        createdSession.id,
        params.sourceId,
        params.difficulty,
        params.questionCount,
        params.mode,
      ).then(({ data: updatedSession, error: AIServiceError }) => {
        if (AIServiceError === null && updatedSession) {
          set((state) => ({
            currentSession: {
              ...state.currentSession,
              ...updatedSession,
              currentQuestionIndex: 0,
              sessionElapsedTime: 0,
            },
            isLoading: false,
          }));
        } else {
          set({ error: 'Failed to generate questions', isLoading: false });
        }
      });

      set({
        currentSession: {
          ...createdSession,
          generatedQuestions: [],
          currentQuestionIndex: 0,
          sessionElapsedTime: 0,
        },
        isLoading: false,
      });

      return createdSession.id;

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false
      });
      throw error;
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: session, error } = await getAiReviewSession(sessionId);
      if (error !== null) {
        throw new Error('Session not found');
      }

      if (session.status === 'ready_for_review') {
        await updateAiReviewSession(
          sessionId,
          {
            status: 'in_progress',
            sessionStartedAt: new Date()
          }
        );
        session.status = 'in_progress';
        session.sessionStartedAt = new Date();
      }

      const sessionState: AiReviewSessionState = {
        ...session,
        currentQuestionIndex: 0,
        sessionElapsedTime: 0,
      };

      set({
        currentSession: sessionState,
        isLoading: false
      });

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load session',
        isLoading: false
      });
    }
  },

  submitAnswer: async (questionId: string, answer: string) => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;

    const updatedQuestions = state.currentSession.generatedQuestions.map(q =>
      q.id === questionId
        ? { ...q, answer, status: 'answered' as const }
        : q
    );

    set({
      currentSession: {
        ...state.currentSession,
        generatedQuestions: updatedQuestions,
      }
    });
    return get().evaluateAnswer(questionId);
  },

  evaluateAnswer: async (questionId: string) => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;

    const updatedQuestions = state.currentSession.generatedQuestions.map(q =>
      q.id === questionId
        ? { ...q, status: 'evaluating' as const }
        : q
    );

    set({
      currentSession: {
        ...state.currentSession,
        generatedQuestions: updatedQuestions,
      }
    });

    try {
      const question = state.currentSession.generatedQuestions.find(q => q.id === questionId);
      if (!question) return;

      const { data: evaluation, error } = await evaluateAnswer(
        state.currentSession.id,
        questionId,
        question.question,
        question.answer || '',
        question.question_type,
      );

      if (error !== null) {
        throw new Error('Failed to evaluate answer');
      }

      const finalUpdatedQuestions = state.currentSession.generatedQuestions.map(q =>
        q.id === questionId
          ? {
            ...q,
            status: 'evaluated' as const,
            evaluation: evaluation.evaluation,
            aiMessage: evaluation.message,
            score: evaluation.score,
            suggestions: evaluation.suggestions,
            correctAnswer: evaluation.correctAnswer,
          }
          : q
      );

      set({
        currentSession: {
          ...state.currentSession,
          generatedQuestions: finalUpdatedQuestions,
        }
      });

    } catch (error) {
      console.error('Evaluation failed:', error);
      // Revert status on error
      const revertedQuestions = state.currentSession.generatedQuestions.map(q =>
        q.id === questionId
          ? { ...q, status: 'answered' as const }
          : q
      );

      set({
        currentSession: {
          ...state.currentSession,
          generatedQuestions: revertedQuestions,
        }
      });
    }
  },

  skipQuestion: (questionId: string) => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;

    const updatedQuestions = state.currentSession.generatedQuestions.map(q =>
      q.id === questionId
        ? { ...q, status: 'skipped' as const }
        : q
    );

    set({
      currentSession: {
        ...state.currentSession,
        generatedQuestions: updatedQuestions,
      }
    });
  },

  nextQuestion: () => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;

    const nextIndex = state.currentSession.currentQuestionIndex + 1;
    if (nextIndex < state.currentSession.generatedQuestions.length) {
      set({
        currentSession: {
          ...state.currentSession,
          currentQuestionIndex: nextIndex,
        }
      });
    }
  },

  previousQuestion: () => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;

    const prevIndex = state.currentSession.currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      set({
        currentSession: {
          ...state.currentSession,
          currentQuestionIndex: prevIndex,
        }
      });
    }
  },

  completeSession: async (dispatch: (params: Action) => void) => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;

    try {
      const questions = state.currentSession.generatedQuestions;
      const unevaluated = questions.filter(
        q => q.status === 'answered' && !q.evaluation
      );
      const currentSessionId = state.currentSession.id;

      await Promise.all(
        unevaluated.map(async (q) => {
          const { data: evaluation, error } = await evaluateAnswer(
            currentSessionId,
            q.id,
            q.question,
            q.answer || '',
            q.question_type,
          );

          if (error === null) {
            q.evaluation = evaluation.evaluation;
            q.aiMessage = evaluation.message;
            q.status = 'evaluated';
          } else {
            q.evaluation = 'error';
            q.status = 'answered';
          }
        })
      );

      const totalQuestions = questions.length;
      const correctAnswers = questions.filter(q => q.evaluation === 'correct').length;
      const skippedAnswers = questions.filter(q => q.status === 'skipped').length;

      const result = {
        totalQuestions,
        correctAnswers,
        skippedAnswers,
      };

      await updateAiReviewSession(state.currentSession.id, {
        status: 'completed',
        result,
        generatedQuestions: questions,
        completedAt: new Date(),
      });

      dispatch({
        type: 'UPDATE_AI_REVIEW',
        payload: {
          aiReview: {
            status: 'completed',
            result,
            generatedQuestions: questions,
            completedAt: new Date(),
          },
          aiReviewId: state.currentSession.id,
          sourceId: state.currentSession.sourceId,
          sourceType: state.currentSession.sourceType,
        }
      });

      const score = (correctAnswers / totalQuestions);
      const discreteScore = score === 0 ? 1 : score < 0.5 ? 2 : score < 0.8 ? 3 : 4;
      if (state.currentSession.sourceType === 'note') {
        await updateNoteReview(state.currentSession.sourceId, discreteScore, state.getSessionElapsedTime());
      } else {
        await updateFolderReview(state.currentSession.sourceId, discreteScore, state.getSessionElapsedTime());
      }

      set({
        currentSession: {
          ...state.currentSession,
          status: 'completed',
          result,
          completedAt: new Date(),
        }
      });

    } catch (error) {
      console.error('Failed to complete session:', error);
      set({ error: 'Failed to complete session' });
    }
  },

  endSession: () => {
    set({ currentSession: null });
  },

  getSessionElapsedTime: () => {
    const state = get();
    if (!state.currentSession?.sessionStartedAt) return 0;
    return Math.floor((Date.now() - new Date(state.currentSession.sessionStartedAt).getTime()) / 1000);
  },

  getCurrentQuestion: () => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return null;
    return state.currentSession.generatedQuestions[state.currentSession.currentQuestionIndex] || null;
  },

  getProgress: () => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) {
      return { answered: 0, total: 0, percentage: 0 };
    }

    const total = state.currentSession.generatedQuestions.length;
    const answered = state.currentSession.generatedQuestions.filter(
      q => q.status === 'evaluated' || q.status === 'answered' || q.status === 'skipped'
    ).length;

    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  },
  addTimeSpentToCurrentQuestion: (seconds: number) => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;
    const idx = state.currentSession.currentQuestionIndex;
    const updatedQuestions = state.currentSession.generatedQuestions.map((q, i) =>
      i === idx
        ? { ...q, timeSpent: (q.timeSpent || 0) + seconds }
        : q
    );
    set({
      currentSession: {
        ...state.currentSession,
        generatedQuestions: updatedQuestions,
      }
    });
  },
  setTimeSpentForQuestion: (questionId: string, seconds: number) => {
    const state = get();
    if (!state.currentSession || !state.currentSession.generatedQuestions) return;
    const updatedQuestions = state.currentSession.generatedQuestions.map(q =>
      q.id === questionId
        ? { ...q, timeSpent: seconds }
        : q
    );
    set({
      currentSession: {
        ...state.currentSession,
        generatedQuestions: updatedQuestions,
      }
    });
  },
}));
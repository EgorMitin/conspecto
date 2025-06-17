import { Question } from '@/types/Question';
import { create } from 'zustand';
import { updateQuestionInDB } from '../server_actions/questions';
import { getQuestionsForScope, GetQuestionsForScopeParams } from '@/utils/review';
import { sm2Algorithm } from '../space-repetition/sm2-algorithm';

export interface ReviewQuestion {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  noteTitle: string;
  lastReviewDate?: Date;
  nextReviewDate?: Date;
  difficulty: 1 | 2 | 3 | 4;
  reviewCount: number;
}

export interface AnsweredQuestion {
  questionId: string;
  feedback: 1 | 2 | 3 | 4;
  timeSpent: number;
}

export interface ReviewSession {
  id: string;
  scope: 'user' | 'folder' | 'note';
  mode: 'due' | 'all';
  questions: (Question & { noteTitle?: string })[];
  questionsToAnswer: Set<string>;
  currentQuestionId: string;
  startTime: Date;
  currentQuestionStartTime: Date;
  answeredQuestions: AnsweredQuestion[];
  isShowingAnswer: boolean;
}

type StartReviewSessionParams = { mode: 'due' | 'all', scope: 'user' | 'folder' | 'note', scopeId: string }

interface ReviewStore {
  currentSession: ReviewSession | null;
  startReviewSession: (params: StartReviewSessionParams) => Promise<void>;
  showAnswer: () => void;
  submitFeedback: (feedback: 1 | 2 | 3 | 4) => void;
  nextQuestion: () => void;
  endSession: () => void;
  getSessionElapsedTime: () => number;
  getCurrentQuestionElapsedTime: () => number;
}

const getQuestionsForReview = async (mode: 'due' | 'all', scope: 'user' | 'folder' | 'note', scopeId: string): Promise<Question[]> => {
  let data: GetQuestionsForScopeParams = { scope: 'note', noteId: scopeId };
  if (scope === 'user') data = { scope: 'user', userId: scopeId };
  else if (scope === 'folder') data = { scope: 'folder', folderId: scopeId };
  const questions = await getQuestionsForScope(data);

  if (mode === 'due') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const questionsDueToday = questions?.filter(question => {
      const reviewDate = new Date(question.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= today;
    });

    return questionsDueToday || [];
  }
  return questions;
};

export const useReviewStore = create<ReviewStore>((set, get) => ({
  currentSession: null,

  startReviewSession: async (params: StartReviewSessionParams) => {
    const { mode, scope, scopeId } = params;
    const questions = await getQuestionsForReview(mode, scope, scopeId);

    if (questions.length === 0) {
      return;
    }

    const questionsToAnswer = new Set(questions.map(q => q.id));
    const firstQuestionId = Array.from(questionsToAnswer)[0];

    const session: ReviewSession = {
      id: `session-${Date.now()}`,
      mode,
      scope,
      questions,
      questionsToAnswer,
      currentQuestionId: firstQuestionId,
      startTime: new Date(),
      currentQuestionStartTime: new Date(),
      answeredQuestions: [],
      isShowingAnswer: false,
    };

    set({ currentSession: session });
  },

  showAnswer: () => {
    set((state) => ({
      currentSession: state.currentSession ? {
        ...state.currentSession,
        isShowingAnswer: true,
      } : null,
    }));
  },

  submitFeedback: async (feedback: 1 | 2 | 3 | 4) => {
    const state = get();
    if (!state.currentSession) return;

    const timeSpent = Date.now() - state.currentSession.currentQuestionStartTime.getTime();

    const answeredQuestion = {
      questionId: state.currentSession.currentQuestionId,
      feedback,
      timeSpent,
    };

    const currentQuestion = state.currentSession.questions.find(q => q.id === answeredQuestion.questionId)!;
    const updatedQuestionPartial = sm2Algorithm(currentQuestion, answeredQuestion.feedback, answeredQuestion.timeSpent);

    // Ensure id is present and of type string for updateQuestionInDB
    const updatedQuestion = { ...updatedQuestionPartial, id: currentQuestion.id };
    const { noteTitle, ...questionForDB } = updatedQuestion;

    await updateQuestionInDB(questionForDB);

    const newQuestionsToAnswer = new Set(state.currentSession.questionsToAnswer);
    let isNextReviewAfterToday = false;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const nextReviewStart = new Date(updatedQuestion.nextReview!); // sm-2 always returns nextReview
    nextReviewStart.setHours(0, 0, 0, 0);

    if (nextReviewStart > todayStart) {
      isNextReviewAfterToday = true;
    }

    if (isNextReviewAfterToday) {
      newQuestionsToAnswer.delete(state.currentSession.currentQuestionId);
    }

    set((s) => ({
      currentSession: s.currentSession ? {
        ...s.currentSession,
        answeredQuestions: [...s.currentSession.answeredQuestions, answeredQuestion],
        questionsToAnswer: newQuestionsToAnswer,
        questions: s.currentSession.questions.map(q => q.id === answeredQuestion.questionId ? { ...q, ...updatedQuestion } : q),
      } : null,
    }));

    get().nextQuestion();
  },

  nextQuestion: () => {
    const state = get();
    if (!state.currentSession || state.currentSession.questionsToAnswer.size === 0) {
      get().endSession();
      return;
    }

    const currentId = state.currentSession.currentQuestionId;
    const questionIdsArray = Array.from(state.currentSession.questionsToAnswer);

    const possibleNextIds = questionIdsArray.length > 1
      ? questionIdsArray.filter(id => id !== currentId)
      : questionIdsArray;

    const randomQuestionId = possibleNextIds[Math.floor(Math.random() * possibleNextIds.length)];

    set((s) => ({
      currentSession: s.currentSession ? {
        ...s.currentSession,
        currentQuestionId: randomQuestionId,
        currentQuestionStartTime: new Date(),
        isShowingAnswer: false,
      } : null,
    }));
  },

  endSession: async () => {
    console.debug('Ending review session');
    // await updateQuestionsInDB(get().currentSession?.answeredQuestions || [], get().currentSession?.questions || []); // Uncomment if you want to update questions in DB at the end of session
    set({ currentSession: null });
  },

  getSessionElapsedTime: () => {
    const state = get();
    if (!state.currentSession) return 0;
    return Math.floor((Date.now() - state.currentSession.startTime.getTime()) / 1000);
  },

  getCurrentQuestionElapsedTime: () => {
    const state = get();
    if (!state.currentSession) return 0;
    return Math.floor((Date.now() - state.currentSession.currentQuestionStartTime.getTime()) / 1000);
  },
}));
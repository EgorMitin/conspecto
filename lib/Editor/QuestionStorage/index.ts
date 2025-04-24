import type {LexicalEditor} from 'lexical';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';

import type {Question, QuestionHistoryItem, Questions} from '@/types/Question';

function createUID(): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 5);
}

export function createQuestion(
  userId: string,
  question: string,
  answer: string,
  id?: string,
  timeStamp?: number,
  repetition?: number,
  interval?: number,
  easeFactor?: number,
  nextReview?: string,
  lastReview?: string,
  history?: QuestionHistoryItem[],
): Question {
  return {
    userId,
    question,
    answer,
    id: id ?? createUID(),
    timeStamp: timeStamp ?? performance.timeOrigin + performance.now(),
    repetition: repetition ?? 0,
    interval: interval ?? 0,
    easeFactor: easeFactor ?? 2.5,
    nextReview: nextReview ?? new Date().toISOString(),
    lastReview: lastReview ?? new Date().toISOString(),
    history: history ?? [],
  };
}

function triggerOnChange(questionStore: QuestionStore): void {
  const listeners = questionStore._changeListeners;
  for (const listener of listeners) {
    listener();
  }
}

export class QuestionStore {
  _editor: LexicalEditor;
  _questions: Questions;
  _changeListeners: Set<() => void>;
  private _storageKey = 'conspecto:questions';
  private _noteId: string | null = null;
  private _isLoadingFromServer = false;

  constructor(editor: LexicalEditor) {
    this._questions = [];
    this._editor = editor;
    this._changeListeners = new Set();
  }

  /**
   * Set the note ID for this question store
   */
  setNoteId(noteId: string): void {
    if (this._noteId === noteId) return;
    this._noteId = noteId;
    this._loadQuestionsFromServer();
  }

  /**
   * Load questions from localStorage (fallback)
   */
  private _loadQuestions(): Questions {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error("Failed to load/parse questions from localStorage", e);
    }
    return [];
  }

  /**
   * Save questions to localStorage (fallback)
   */
  private _saveQuestions(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._questions));
    } catch (e) {
      console.error("Failed to save questions to localStorage", e);
    }
  }
  
  /**
   * Load questions from the server for the current note
   */
  private async _loadQuestionsFromServer(): Promise<void> {
    if (!this._noteId || this._isLoadingFromServer) return;
    
    this._isLoadingFromServer = true;
    try {
      const response = await fetch(`/api/questions?noteId=${this._noteId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.questions)) {
        const questionsById = new Map<string, any>();
        const questionsMap = new Map<string, Question>();
        const result: Questions = [];
        
        // First pass: collect all questons
        data.questions.forEach((question: any) => {
          const newQuestion = createQuestion(
            question.userId,
            question.question,
            question.answer,
            question.id,
            question.timeStamp,
            question.repetition,
            question.interval,
            question.easeFactor,
            question.nextReview,
            question.lastReview,
            question.history,
          );
          questionsMap.set(question.id, newQuestion);
          result.push(newQuestion);
          
          questionsById.set(question.id, question);
        });

        this._questions = result;
        triggerOnChange(this);
      }
    } catch (error) {
      console.error('Error loading questions from server:', error);
      // Fall back to local storage if server fails
      this._questions = this._loadQuestions();
      triggerOnChange(this);
    } finally {
      this._isLoadingFromServer = false;
    }
  }

  private async _saveQuestionsToServer(
    questions: Questions,
  ): Promise<void> {
    if (!this._noteId) {
      console.warn('Cannot save questions: noteId is missing');
      return;
    }
    for (const question of questions) {
      this._saveQuestionToServer(question);
    }
  }

  
  /**
   * Save a question to the server
   */
  private async _saveQuestionToServer(
    question: Question,
  ): Promise<void> {
    if (!this._noteId) {
      console.warn('Cannot save question: noteId is missing');
      return;
    }
    
    try {
      // For debug
      console.log('Saving question to server:', {
        id: question.id,
        question: question,
        noteId: this._noteId,
      });
      
      // Ensure timestamp is an integer (fix for PostgreSQL BIGINT type)
      let timeStamp: number;
      timeStamp = Math.round(question.timeStamp);
      
      // Prepare the question data for the server
      const questionData = {
        id: question.id,
        noteId: this._noteId,
        question: question.question,
        userId: question.userId,
        answer: question.answer,
        timeStamp: timeStamp,
        repetition: question.repetition,
        interval: question.interval,
        easeFactor: question.easeFactor,
        nextReview: question.nextReview,
        lastReview: question.lastReview,
        history: question.history,
      };
      
      // Send to server
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save question: ${response.statusText}${errorData.error ? ' - ' + errorData.error : ''}`);
      }
    } catch (error) {
      console.error('Error saving question to server:', error);
    }
  }
  
  /**
   * Delete a question from the server
   */
  private async _deleteQuestionFromServer(questionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/questions?id=${questionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete question: ${response.statusText}${errorData.error ? ' - ' + errorData.error : ''}`);
      }
    } catch (error) {
      console.error('Error deleting question from server:', error);
    }
  }

  getQuestions(): Questions {
    return this._questions;
  }

  updateQuestion (
    question: Question,
  ): void {
    const questions = this._questions;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.id === question.id) {
        questions.splice(i, 1, question);
        break;
      }
    }
    
    this._questions = questions;
    triggerOnChange(this);
    this._saveQuestions();
    
    // Save to server
    this._saveQuestionToServer(question);
  }

  addQuestion(
    question: Question,
  ): void {
    const questions = this._questions;
    questions.push(question);

    this._questions = questions;
    this._saveQuestionToServer(question)
    triggerOnChange(this);
    this._saveQuestions();
  }

  deleteQuestion(
    question: Question,
  ) {
    const questions = this._questions;
    let questionIndex: number | null = questions.indexOf(question);
    questions.splice(questionIndex, 1);

    // Delete from server
    this._deleteQuestionFromServer(question.id);
    
    this._questions = questions;
    triggerOnChange(this);
    this._saveQuestions();
  }

  registerOnChange(onChange: () => void): () => void {
    const changeListeners = this._changeListeners;
    changeListeners.add(onChange);
    return () => {
      changeListeners.delete(onChange);
    };
  }
}

export function useQuestionStore(questionStore: QuestionStore): Questions {
  const [questions, setQuestions] = useState<Questions>(
    questionStore.getQuestions(),
  );
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      questionStore.setNoteId(params.id as string);
    }
  }, [params, questionStore]);

  useEffect(() => {
    return questionStore.registerOnChange(() => {
      setQuestions(questionStore.getQuestions());
    });
  }, [questionStore]);

  return questions;
}

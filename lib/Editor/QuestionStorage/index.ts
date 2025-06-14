import type {LexicalEditor} from 'lexical';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';

import type {Question, QuestionHistoryItem, Questions} from '@/types/Question';
import { get } from 'http';
import { createQuestion, deleteQuestion, getQuestionsByNoteId, updateQuestion } from '@/lib/server_actions/questions';
import { useAppState } from '@/lib/providers/app-state-provider';

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
      const data = await getQuestionsByNoteId(this._noteId);
      
      if (data.error !== null) {
        throw new Error(`Failed to load questions: ${data.error}`);
      }
      const {data: questions} = data;

      this._questions = questions;
      triggerOnChange(this);
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
      const response = await createQuestion(question)
      
      if (response.error !== null) {
        throw new Error(`Failed to save question: ${response.error}`);
      }
    } catch (error) {
      console.error('Error saving question to server:', error);
    }
  }

  /**
   * Update question on the server
   */
    private async _updateQuestionOnServer(
      question: Question,
    ): Promise<void> {
      if (!this._noteId) {
        console.warn('Cannot update question: noteId is missing');
        return;
      }
      try {
        const response = await updateQuestion(question)

        if (response.error !== null) {
          throw new Error(`Failed to update question: ${response.error}`);
        }
      } catch (error) {
        console.error('Error updating question on the server:', error);
      }
    }
  
  /**
   * Delete a question from the server
   */
  private async _deleteQuestionFromServer(questionId: string): Promise<void> {
    try {
      const response = await deleteQuestion(questionId)
      
      if (!response.success) {
        throw new Error(`Failed to delete question: ${response.message}`);
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
    this._updateQuestionOnServer(question);
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
    const questionIndex: number | null = questions.indexOf(question);
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
  const { noteId, state } = useAppState()

  useEffect(() => {
    if (noteId) {
      questionStore.setNoteId(noteId);
    }
  }, [state, questionStore]);

  useEffect(() => {
    return questionStore.registerOnChange(() => {
      setQuestions(questionStore.getQuestions());
    });
  }, [questionStore]);

  return questions;
}

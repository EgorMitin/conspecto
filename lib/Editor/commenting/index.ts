import type {LexicalEditor} from 'lexical';

import {Provider, TOGGLE_CONNECT_COMMAND} from '@lexical/yjs';
import {COMMAND_PRIORITY_LOW} from 'lexical';
import {useEffect, useState} from 'react';
import {
  Array as YArray,
  Map as YMap,
  Transaction,
  YArrayEvent,
  YEvent,
} from 'yjs';

export type CommentHistoryItem = {
  date: number;
  quality: number;
};

export type Comment = {
  author: string;
  content: string;
  deleted: boolean;
  id: string;
  timeStamp: number;
  type: 'comment';
  repetition: number;
  interval: number;
  ease_factor: number;
  next_review: string;
  last_review: string;
  history: Array<CommentHistoryItem>;
};


export type Thread = {
  comments: Array<Comment>;
  id: string;
  quote: string;
  type: 'thread';
};

export type Comments = Array<Thread | Comment>;

function createUID(): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substring(0, 5);
}

export function createComment(
  content: string,
  author: string,
  id?: string,
  timeStamp?: number,
  deleted?: boolean,
  repetition?: number,
  interval?: number,
  easeFactor?: number,
  nextReview?: string,
  lastReview?: string,
  history?: CommentHistoryItem[],
): Comment {
  return {
    author,
    content,
    deleted: deleted ?? false,
    id: id ?? createUID(),
    timeStamp: timeStamp ?? performance.timeOrigin + performance.now(),
    type: 'comment',
    repetition: repetition ?? 0,
    interval: interval ?? 0,
    ease_factor: easeFactor ?? 2.5,
    next_review: nextReview ?? new Date().toISOString(),
    last_review: lastReview ?? new Date().toISOString(),
    history: history ?? [],
  };
}

export function createThread(
  quote: string,
  comments: Array<Comment>,
  id?: string,
): Thread {
  return {
    comments,
    id: id === undefined ? createUID() : id,
    quote,
    type: 'thread',
  };
}

function cloneThread(thread: Thread): Thread {
  return {
    comments: Array.from(thread.comments),
    id: thread.id,
    quote: thread.quote,
    type: 'thread',
  };
}

function markDeleted(comment: Comment): Comment {
  return {
    author: comment.author,
    content: '[Deleted Comment]',
    deleted: true,
    id: comment.id,
    timeStamp: comment.timeStamp,
    type: 'comment',
    repetition: comment.repetition,
    interval: comment.interval,
    ease_factor: comment.ease_factor,
    next_review: comment.next_review,
    last_review: comment.last_review,
    history: comment.history,
  };
}

function triggerOnChange(commentStore: CommentStore): void {
  const listeners = commentStore._changeListeners;
  for (const listener of listeners) {
    listener();
  }
}

export class CommentStore {
  _editor: LexicalEditor;
  _comments: Comments;
  _changeListeners: Set<() => void>;
  _collabProvider: null | Provider;
  private _storageKey = 'conspecto:questions';
  private _noteId: string | null = null;
  private _isLoadingFromServer = false;

  constructor(editor: LexicalEditor) {
    this._comments = [];
    this._editor = editor;
    this._collabProvider = null;
    this._changeListeners = new Set();
    
    // Try to get noteId from URL path
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 2 && pathParts[1] === 'notes') {
        this._noteId = pathParts[2];
        this._loadCommentsFromServer();
      }
    }
  }

  /**
   * Set the note ID for this comment store
   */
  setNoteId(noteId: string): void {
    this._noteId = noteId;
    this._loadCommentsFromServer();
  }

  /**
   * Load comments from localStorage (fallback)
   */
  private _loadComments(): Comments {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error("Failed to load/parse comments from localStorage", e);
    }
    return [];
  }

  /**
   * Save comments to localStorage (fallback)
   */
  private _saveComments(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._comments));
    } catch (e) {
      console.error("Failed to save comments to localStorage", e);
    }
  }
  
  /**
   * Load comments from the server for the current note
   */
  private async _loadCommentsFromServer(): Promise<void> {
    if (!this._noteId || this._isLoadingFromServer) return;
    
    this._isLoadingFromServer = true;
    try {
      const response = await fetch(`/api/comments?noteId=${this._noteId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load comments: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.comments)) {
        // Process loaded comments and convert to appropriate format
        const commentsById = new Map<string, any>();
        const threadsMap = new Map<string, Thread>();
        const result: Comments = [];
        
        // First pass: collect all comments and threads
        data.comments.forEach((comment: any) => {
          // Create a Comment or Thread based on the type
          if (comment.type === 'thread') {
            const thread = createThread(comment.quote || '', [], comment.id);
            threadsMap.set(comment.id, thread);
            result.push(thread);
          } else if (!comment.threadId) {
            // This is a standalone comment (not in a thread)
            const newComment = createComment(
              comment.content,
              comment.author,
              comment.id,
              comment.timeStamp,
              comment.deleted,
            );
            result.push(newComment);
          }
          
          // Store all comments by ID for the second pass
          commentsById.set(comment.id, comment);
        });
        
        // Second pass: add comments to their threads
        data.comments.forEach((comment: any) => {
          if (comment.type === 'comment' && comment.threadId) {
            const thread = threadsMap.get(comment.threadId);
            if (thread) {
              const newComment = createComment(
                comment.content,
                comment.author,
                comment.id,
                comment.timeStamp,
                comment.deleted,
              );
              thread.comments.push(newComment);
            }
          }
        });
        
        this._withLocalTransaction(() => {
          this._comments = result;
          triggerOnChange(this);
        });
      }
    } catch (error) {
      console.error('Error loading comments from server:', error);
      // Fall back to local storage if server fails
      this._comments = this._loadComments();
      triggerOnChange(this);
    } finally {
      this._isLoadingFromServer = false;
    }
  }
  
  /**
   * Save a comment to the server
   */
  private async _saveCommentToServer(
    comment: Comment | Thread,
    threadId?: string,
  ): Promise<void> {
    if (!this._noteId) {
      console.warn('Cannot save comment: noteId is missing');
      return;
    }
    
    try {
      // For debug purposes, log what we're trying to save
      console.log('Saving comment to server:', { 
        id: comment.id, 
        noteId: this._noteId,
        type: comment.type,
        threadId: threadId || null 
      });
      
      // Ensure timestamp is an integer (fix for PostgreSQL BIGINT type)
      let timeStamp: number;
      if (comment.type === 'comment') {
        // Round to the nearest integer to avoid floating point issues
        timeStamp = Math.round(comment.timeStamp);
      } else {
        timeStamp = Math.round(Date.now());
      }
      
      // Prepare the comment data for the server
      const commentData = {
        id: comment.id,
        noteId: this._noteId,
        threadId: threadId || null,
        content: comment.type === 'comment' ? comment.content : '',
        author: comment.type === 'comment' ? comment.author : 'System',
        quote: comment.type === 'thread' ? comment.quote : null,
        timeStamp: timeStamp, // Using the rounded integer timestamp
        deleted: comment.type === 'comment' ? comment.deleted : false,
        type: comment.type
      };
      
      // Send to server
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save comment: ${response.statusText}${errorData.error ? ' - ' + errorData.error : ''}`);
      }
    } catch (error) {
      console.error('Error saving comment to server:', error);
    }
  }
  
  /**
   * Delete a comment from the server
   */
  private async _deleteCommentFromServer(commentId: string): Promise<void> {
    try {
      // Make sure we're using the correct endpoint path
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete comment: ${response.statusText}${errorData.error ? ' - ' + errorData.error : ''}`);
      }
    } catch (error) {
      console.error('Error deleting comment from server:', error);
    }
  }

  isCollaborative(): boolean {
    return this._collabProvider !== null;
  }

  getComments(): Comments {
    return this._comments;
  }

  replaceComment(
    newComment: Comment,
    thread: Thread,
  ): void {
    const nextComments = Array.from(this._comments);
    // The YJS types explicitly use `any` as well.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharedCommentsArray: YArray<any> | null = this._getCollabComments();

    for (let i = 0; i < nextComments.length; i++) {
      const comment = nextComments[i];
      if (comment.type === 'thread' && comment.id === thread.id) {
        const newThread = cloneThread(comment);
        nextComments.splice(i, 1, newThread);
        
        if (this.isCollaborative() && sharedCommentsArray !== null) {
          const parentSharedArray = sharedCommentsArray
            .get(i)
            .get('comments');
          this._withRemoteTransaction(() => {
            // If there's at least one comment, replace it
            if (parentSharedArray.length > 0) {
              // Delete all existing comments
              while (parentSharedArray.length > 0) {
                parentSharedArray.delete(0);
              }
              // Add the new comment
              const sharedMap = this._createCollabSharedMap(newComment);
              parentSharedArray.insert(0, [sharedMap]);
            } else {
              // Just add the new comment if there are no existing ones
              const sharedMap = this._createCollabSharedMap(newComment);
              parentSharedArray.insert(0, [sharedMap]);
            }
          });
        }
        
        // Replace all comments with just the new one
        newThread.comments = [newComment];
        break;
      }
    }
    
    this._comments = nextComments;
    triggerOnChange(this);
    this._saveComments();
    
    // Save to server
    this._saveCommentToServer(newComment, thread.id);
  }

  addComment(
    commentOrThread: Comment | Thread,
    thread?: Thread,
    offset?: number,
  ): void {
    const nextComments = Array.from(this._comments);
    // The YJS types explicitly use `any` as well.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharedCommentsArray: YArray<any> | null = this._getCollabComments();

    if (thread !== undefined && commentOrThread.type === 'comment') {
      for (let i = 0; i < nextComments.length; i++) {
        const comment = nextComments[i];
        if (comment.type === 'thread' && comment.id === thread.id) {
          const newThread = cloneThread(comment);
          nextComments.splice(i, 1, newThread);
          const insertOffset =
            offset !== undefined ? offset : newThread.comments.length;
          if (this.isCollaborative() && sharedCommentsArray !== null) {
            const parentSharedArray = sharedCommentsArray
              .get(i)
              .get('comments');
            this._withRemoteTransaction(() => {
              const sharedMap = this._createCollabSharedMap(commentOrThread);
              parentSharedArray.insert(insertOffset, [sharedMap]);
            });
          }
          newThread.comments.splice(insertOffset, 0, commentOrThread);
          break;
        }
      }
      
      // Save comment to server
      this._saveCommentToServer(commentOrThread, thread.id);
    } else {
      const insertOffset = offset !== undefined ? offset : nextComments.length;
      if (this.isCollaborative() && sharedCommentsArray !== null) {
        this._withRemoteTransaction(() => {
          const sharedMap = this._createCollabSharedMap(commentOrThread);
          sharedCommentsArray.insert(insertOffset, [sharedMap]);
        });
      }
      nextComments.splice(insertOffset, 0, commentOrThread);
      
      // Save thread to server
      this._saveCommentToServer(commentOrThread);
      
      // If it's a thread, also save its comments
      if (commentOrThread.type === 'thread') {
        commentOrThread.comments.forEach(comment => {
          this._saveCommentToServer(comment, commentOrThread.id);
        });
      }
    }
    
    this._comments = nextComments;
    triggerOnChange(this);
    this._saveComments();
  }

  deleteCommentOrThread(
    commentOrThread: Comment | Thread,
    thread?: Thread,
  ): {markedComment: Comment; index: number} | null {
    const nextComments = Array.from(this._comments);
    // The YJS types explicitly use `any` as well.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sharedCommentsArray: YArray<any> | null = this._getCollabComments();
    let commentIndex: number | null = null;

    if (thread !== undefined) {
      for (let i = 0; i < nextComments.length; i++) {
        const nextComment = nextComments[i];
        if (nextComment.type === 'thread' && nextComment.id === thread.id) {
          const newThread = cloneThread(nextComment);
          nextComments.splice(i, 1, newThread);
          const threadComments = newThread.comments;
          commentIndex = threadComments.indexOf(commentOrThread as Comment);
          if (this.isCollaborative() && sharedCommentsArray !== null) {
            const parentSharedArray = sharedCommentsArray
              .get(i)
              .get('comments');
            this._withRemoteTransaction(() => {
              parentSharedArray.delete(commentIndex);
            });
          }
          threadComments.splice(commentIndex, 1);
          break;
        }
      }
      
      // Mark comment as deleted on the server
      if (commentOrThread.type === 'comment') {
        this._deleteCommentFromServer(commentOrThread.id);
      }
    } else {
      commentIndex = nextComments.indexOf(commentOrThread);
      if (this.isCollaborative() && sharedCommentsArray !== null) {
        this._withRemoteTransaction(() => {
          sharedCommentsArray.delete(commentIndex as number);
        });
      }
      nextComments.splice(commentIndex, 1);
      
      // Delete from server
      this._deleteCommentFromServer(commentOrThread.id);
      
      // If it's a thread, also delete all its comments
      if (commentOrThread.type === 'thread') {
        (commentOrThread as Thread).comments.forEach(comment => {
          this._deleteCommentFromServer(comment.id);
        });
      }
    }
    
    this._comments = nextComments;
    triggerOnChange(this);
    this._saveComments();

    if (commentOrThread.type === 'comment') {
      return {
        index: commentIndex as number,
        markedComment: markDeleted(commentOrThread as Comment),
      };
    }

    return null;
  }

  registerOnChange(onChange: () => void): () => void {
    const changeListeners = this._changeListeners;
    changeListeners.add(onChange);
    return () => {
      changeListeners.delete(onChange);
    };
  }

  _withRemoteTransaction(fn: () => void): void {
    const provider = this._collabProvider;
    if (provider !== null) {
      // @ts-expect-error doc does exist
      const doc = provider.doc;
      doc.transact(fn, this);
    }
  }

  _withLocalTransaction(fn: () => void): void {
    const collabProvider = this._collabProvider;
    try {
      this._collabProvider = null;
      fn();
    } finally {
      this._collabProvider = collabProvider;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _getCollabComments(): null | YArray<any> {
    const provider = this._collabProvider;
    if (provider !== null) {
      // @ts-expect-error doc does exist
      const doc = provider.doc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return doc.get('comments', YArray) as YArray<any>;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _createCollabSharedMap(commentOrThread: Comment | Thread): YMap<any> {
    const sharedMap = new YMap();
    const type = commentOrThread.type;
    const id = commentOrThread.id;
    sharedMap.set('type', type);
    sharedMap.set('id', id);
    if (type === 'comment') {
      sharedMap.set('author', commentOrThread.author);
      sharedMap.set('content', commentOrThread.content);
      sharedMap.set('deleted', commentOrThread.deleted);
      sharedMap.set('timeStamp', commentOrThread.timeStamp);
    } else {
      sharedMap.set('quote', commentOrThread.quote);
      const commentsArray = new YArray();
      commentOrThread.comments.forEach((comment, i) => {
        const sharedChildComment = this._createCollabSharedMap(comment);
        commentsArray.insert(i, [sharedChildComment]);
      });
      sharedMap.set('comments', commentsArray);
    }
    return sharedMap;
  }

  registerCollaboration(provider: Provider): () => void {
    this._collabProvider = provider;
    const sharedCommentsArray = this._getCollabComments();

    const connect = () => {
      provider.connect();
    };

    const disconnect = () => {
      try {
        provider.disconnect();
      } catch (e) {
        // Do nothing
      }
    };

    const unsubscribe = this._editor.registerCommand(
      TOGGLE_CONNECT_COMMAND,
      (payload) => {
        if (connect !== undefined && disconnect !== undefined) {
          const shouldConnect = payload;

          if (shouldConnect) {
            // eslint-disable-next-line no-console
            console.log('Comments connected!');
            connect();
          } else {
            // eslint-disable-next-line no-console
            console.log('Comments disconnected!');
            disconnect();
          }
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );

    const onSharedCommentChanges = (
      // The YJS types explicitly use `any` as well.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events: Array<YEvent<any>>,
      transaction: Transaction,
    ) => {
      if (transaction.origin !== this) {
        for (let i = 0; i < events.length; i++) {
          const event = events[i];

          if (event instanceof YArrayEvent) {
            const target = event.target;
            const deltas = event.delta;
            let offset = 0;

            for (let s = 0; s < deltas.length; s++) {
              const delta = deltas[s];
              const insert = delta.insert;
              const retain = delta.retain;
              const del = delta.delete;
              const parent = target.parent;
              const parentThread =
                target === sharedCommentsArray
                  ? undefined
                  : parent instanceof YMap &&
                    (this._comments.find((t) => t.id === parent.get('id')) as
                      | Thread
                      | undefined);

              if (Array.isArray(insert)) {
                insert
                  .slice()
                  .reverse()
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .forEach((map: YMap<any>) => {
                    const id = map.get('id');
                    const type = map.get('type');

                    const commentOrThread =
                      type === 'thread'
                        ? createThread(
                            map.get('quote'),
                            map
                              .get('comments')
                              .toArray()
                              .map(
                                (
                                  innerComment: Map<
                                    string,
                                    string | number | boolean
                                  >,
                                ) =>
                                  createComment(
                                    innerComment.get('content') as string,
                                    innerComment.get('author') as string,
                                    innerComment.get('id') as string,
                                    innerComment.get('timeStamp') as number,
                                    innerComment.get('deleted') as boolean,
                                  ),
                            id,
                          ))
                        : createComment(
                            map.get('content'),
                            map.get('author'),
                            id,
                            map.get('timeStamp'),
                            map.get('deleted'),
                          );
                    this._withLocalTransaction(() => {
                      this.addComment(
                        commentOrThread,
                        parentThread as Thread,
                        offset,
                      );
                    });
                  });
              } else if (typeof retain === 'number') {
                offset += retain;
              } else if (typeof del === 'number') {
                for (let d = 0; d < del; d++) {
                  const commentOrThread =
                    parentThread === undefined || parentThread === false
                      ? this._comments[offset]
                      : parentThread.comments[offset];
                  this._withLocalTransaction(() => {
                    this.deleteCommentOrThread(
                      commentOrThread,
                      parentThread as Thread,
                    );
                  });
                  offset++;
                }
              }
            }
          }
        }
      }
    };

    if (sharedCommentsArray === null) {
      return () => null;
    }

    sharedCommentsArray.observeDeep(onSharedCommentChanges);

    connect();

    return () => {
      sharedCommentsArray.unobserveDeep(onSharedCommentChanges);
      unsubscribe();
      this._collabProvider = null;
    };
  }
}

export function useCommentStore(commentStore: CommentStore): Comments {
  const [comments, setComments] = useState<Comments>(
    commentStore.getComments(),
  );

  useEffect(() => {
    return commentStore.registerOnChange(() => {
      setComments(commentStore.getComments());
    });
  }, [commentStore]);

  return comments;
}

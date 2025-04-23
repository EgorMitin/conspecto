import { NextRequest, NextResponse } from 'next/server';
import databaseService, { CommentData } from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import { initializeDatabase } from '@/config/dbInit';

// Initialize database on first request
let isInitialized = false;

/**
 * Ensure the database is initialized
 */
async function ensureDbInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

/**
 * POST /api/comments
 * Saves a comment to the database
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database if not already done
    await ensureDbInitialized();
    
    // Parse request body
    const body = await request.json();
    
    // Debug the incoming payload
    logger.info(`Comment save request payload: ${JSON.stringify(body)}`);
    
    // Validate required fields with more detailed error message
    const missingFields = [];
    if (!body.id) missingFields.push('id');
    if (!body.noteId) missingFields.push('noteId');
    if (body.type !== 'thread' && !body.content) missingFields.push('content');
    if (!body.type) missingFields.push('type');
    
    if (missingFields.length > 0) {
      const errorMsg = `Required fields missing: ${missingFields.join(', ')}`;
      logger.error(errorMsg);
      return NextResponse.json(
        { error: errorMsg }, 
        { status: 400 }
      );
    }
    
    // Special handling for thread type comments which might not have content
    const content = body.type === 'thread' ? (body.content || '') : body.content;
    
    // Create comment data object
    const commentData: CommentData = {
      id: body.id,
      noteId: body.noteId,
      threadId: body.threadId || null,
      content: content,
      author: body.author || 'Anonymous',
      quote: body.quote || null,
      timeStamp: body.timeStamp || Date.now(),
      deleted: body.deleted || false,
      type: body.type
    };
    
    // Save comment to database
    const savedComment = await databaseService.saveComment(commentData);
    
    // Return saved comment
    return NextResponse.json({
      success: true,
      message: 'Comment saved successfully',
      comment: savedComment
    }, { status: 200 });
    
  } catch (error) {
    // Log error with more details
    logger.error(`Error saving comment: ${(error as Error).message}`, error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save comment',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments?id={id}
 * Deletes a comment
 */
export async function DELETE(request: NextRequest) {
  try {
    // Initialize database if not already done
    await ensureDbInitialized();
    
    // Get comment ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' }, 
        { status: 400 }
      );
    }
    
    // Delete comment
    const success = await databaseService.deleteComment(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Comment not found' }, 
        { status: 404 }
      );
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error('Error deleting comment', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete comment',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/comments?noteId={noteId}
 * Gets all comments for a note
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize database if not already done
    await ensureDbInitialized();
    
    // Get note ID from query parameters
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    
    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get comments for note
    const comments = await databaseService.getCommentsByNoteId(noteId);
    
    // Return comments
    return NextResponse.json({
      success: true,
      comments
    }, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error('Error getting comments', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get comments',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}
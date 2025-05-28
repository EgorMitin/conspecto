import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/services/DatabaseService/DatabaseService';
import { logger } from '@/utils/logger';
import type { Question } from '@/types/Question';


/**
 * POST /api/questions
 * Saves a question to the database
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Debug the incoming payload
    logger.debug(`Question save request payload: ${JSON.stringify(body)}`);
    
    // Validate required fields with more detailed error message
    const missingFields = [];
    if (!body.id) missingFields.push('id');
    if (!body.noteId) missingFields.push('noteId');
    if (!body.userId) missingFields.push('userId');
    if (!body.answer) missingFields.push('answer');
    if (!body.question) missingFields.push('question');
    if (!body.timeStamp) missingFields.push('timeStamp');
    if (!body.history) missingFields.push('history');
    
    if (missingFields.length > 0) {
      const errorMsg = `Required fields missing: ${missingFields.join(', ')}`;
      logger.error(errorMsg);
      return NextResponse.json(
        { error: errorMsg }, 
        { status: 400 }
      );
    }
    
    // Create question data object
    const questionData: Question = {
      id: body.id,
      noteId: body.noteId,
      userId: body.userId,
      answer: body.answer,
      question: body.question,
      timeStamp: body.timeStamp,
      repetition: body.repetition,
      interval: body.interval,
      easeFactor: body.easeFactor,
      nextReview: body.nextReview,
      lastReview: body.lastReview,
      history: body.history,
    };
    
    // Save question to database
    const savedQuestion = await databaseService.saveQuestion(questionData);
    
    // Return saved question
    return NextResponse.json({
      success: true,
      message: 'Question saved successfully',
      comment: savedQuestion
    }, { status: 200 });
    
  } catch (error) {
    // Log error with more details
    logger.error(`Error saving question: ${(error as Error).message}`, error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save question',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/questions?id={id}
 * Deletes a question
 */
export async function DELETE(request: NextRequest) {
  try {
    // Initialize database if not already done
    await ensureDbInitialized();
    
    // Get question ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' }, 
        { status: 400 }
      );
    }
    
    // Delete question
    const success = await databaseService.deleteQuestion(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Question not found' }, 
        { status: 404 }
      );
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error('Error deleting question', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete question',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/questions?noteId={noteId}
 * Gets all questions for a note
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
    
    // Get questions for note
    const questions = await databaseService.getQuestionsByNoteId(noteId);
    
    // Return questions
    return NextResponse.json({
      success: true,
      questions
    }, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error('Error getting questions', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get questions',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}
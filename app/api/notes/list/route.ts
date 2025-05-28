import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/services/DatabaseService/DatabaseService';
import { logger } from '@/utils/logger';

/**
 * GET /api/notes/list?userId=<user_id>
 * Lists all notes for a user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get notes from database
    const notes = await databaseService.getNotesByUserId(userId);
    
    // Return notes
    return NextResponse.json({ 
      success: true,
      count: notes.length,
      notes 
    }, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error('Error listing notes', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to list notes',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}
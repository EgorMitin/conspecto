import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/services/DatabaseService/DatabaseService';
import { logger } from '@/utils/logger';
import type { Note } from '@/types/Note';


/**
 * POST /api/notes/save
 * Saves editor content to the database
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      );
    }
    
    // Create note object from request
    const note: Note = {
      id: body.id, // Will be undefined for new notes
      title: body.title,
      content: body.content,
      userId: body.userId || 'anonymous' // Use anonymous if userId not provided
    };
    
    // Save note to database
    const savedNote = await databaseService.saveNote(note);
    
    // Return saved note
    return NextResponse.json(
      { 
        success: true, 
        message: note.id ? 'Note updated successfully' : 'Note created successfully',
        note: savedNote 
      }, 
      { status: 200 }
    );
  } catch (error) {
    // Log error
    logger.error('Error saving note', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save note',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/notes/save?id=<note_id>
 * Gets a note by ID
 */
export async function GET(request: NextRequest) {
  try {
    // Get note ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Validate request
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get note from database
    const note = await databaseService.getNoteById(id);
    
    // Return 404 if note not found
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' }, 
        { status: 404 }
      );
    }
    
    // Return note
    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    // Log error
    logger.error('Error retrieving note', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve note',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}
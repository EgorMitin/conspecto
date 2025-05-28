import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/services/DatabaseService/DatabaseService';
import { logger } from '@/utils/logger';


/**
 * GET /api/notes/load/:id
 * Loads a note by ID from the database
 */
export async function GET({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' }, 
        { status: 400 }
      );
    }
    
    logger.info(`Loading note with ID: ${id}`);
    
    // Get note from database
    const note = await databaseService.getNoteById(id);
    
    // Return 404 if note not found
    if (!note) {
      logger.info(`Note with ID ${id} not found`);
      
      // Return empty note template with the requested ID
      // This allows creating a new note with the specified ID
      return NextResponse.json({ 
        success: true,
        note: {
          id,
          title: 'Untitled Note',
          content: '',
          userId: 'anonymous',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }, { status: 200 });
    }
    
    logger.info(`Successfully loaded note with ID: ${id}`);
    
    // Return note
    return NextResponse.json({ 
      success: true,
      note 
    }, { status: 200 });
    
  } catch (error) {
    // Log error
    logger.error(`Error loading note: ${(error as Error).message}`, error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to load note',
        error: (error as Error).message
      }, 
      { status: 500 }
    );
  }
}
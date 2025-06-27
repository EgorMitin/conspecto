import { NextRequest, NextResponse } from 'next/server';
import DatabaseService from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import { createUserSession } from '@/services/SessionService/SessionService';
import EmailService from '@/services/EmailService/EmailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
    }

    const userId = await DatabaseService.verifyUser(token);

    if (!userId) {
      return NextResponse.redirect(new URL('/login?error=expired-token', request.url));
    }

    DatabaseService.getUserById(userId).then(user => {
      if (!user) return
      EmailService.sendWelcomeEmail(user.email)
    })

    await createUserSession(userId);

    return NextResponse.redirect(new URL('/dashboard?verified=true', request.url));
  } catch (error) {
    logger.error('Error verifying email:', error);
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
}
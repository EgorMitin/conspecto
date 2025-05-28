import { cookies } from "next/headers";
import crypto from "crypto";
import { logger } from "@/utils/logger";
import databaseService from "@/services/DatabaseService/DatabaseService";
import { COOKIE_SESSION_KEY, SESSION_EXPIRATION_SECONDS } from "@/config/sessions";


export async function createUserSession(userId: string) {
  const sessionId = crypto.randomBytes(127).toString("hex").normalize();

  try {
    const session = await databaseService.createSession({
      sessionId,
      userId,
      expiresAt: new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000),
      }
    );
    logger.debug("Session created successfully", session);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_SESSION_KEY, sessionId, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000),
    });
  } catch (error) {
    logger.error("Error creating user session", error);
  }
}

export async function getSessionIdFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_SESSION_KEY)?.value || null;
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSION_KEY)
}
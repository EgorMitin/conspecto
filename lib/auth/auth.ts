import { cache } from "react";

import DatabaseService from "@/services/DatabaseService";
import { getSessionIdFromCookies } from "@/services/SessionService/SessionService";
import { logger } from "@/utils/logger";


export const getCurrentUser = cache(async () => {
  const sessionId = await getSessionIdFromCookies()

  if (!sessionId) {
    logger.debug("Session ID not found in cookies");
    return null
  }

  try {
    const result = await DatabaseService.getSessionById(sessionId);
    if (!result) return null;

    const userId = result.userId;
    const user = await DatabaseService.getUserById(userId);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    logger.error("Error retrieving session from database", error);
    return null;
  }
})
import type { ActionFunction } from "@remix-run/node";
import { destroySession } from "~/services/session.server";
import { auth } from "~/lib/firebase/client";

export const action: ActionFunction = async ({ request }) => {
  try {
    await auth.signOut();
    return destroySession(request);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

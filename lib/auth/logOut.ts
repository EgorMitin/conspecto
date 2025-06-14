"use server";

import DatabaseService from "@/services/DatabaseService";
import { getSessionIdFromCookies } from "@/services/SessionService/SessionService";
import { redirect } from "next/navigation";

export async function logOut() {
  const sessionId = await getSessionIdFromCookies();
  if (!sessionId) {
    redirect("/login");
  }
  await DatabaseService.deleteSession(sessionId);
  redirect("/");
}
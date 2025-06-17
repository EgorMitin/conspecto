"use server";

import { OAuthProvider } from "@/types/Auth";
import { redirect } from "next/navigation";
import { OAuthClient } from "./oauth/base";

export async function oAuthLogin(provider: OAuthProvider) {
  const client = new OAuthClient();
  const url = await client.createAuthUrl(provider);

  redirect(url)
}
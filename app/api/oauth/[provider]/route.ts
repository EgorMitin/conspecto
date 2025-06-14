"use server";

import { OAuthClient } from "@/lib/auth/oauth/base";
import DatabaseService from "@/services/DatabaseService";
import { createUserSession } from "@/services/SessionService/SessionService";
import { User } from "@/types/User";
import { logger } from "@/utils/logger";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;

  if (!provider) {
    logger.error("Provider is required but not provided in the request");
    return NextResponse.redirect(new URL(`/login?oauthError=${encodeURIComponent(
      "Failed to initiate OAuth login. Please try again.")}`, request.url));
  }

  try {
    const url = new URL(request.url);
    const state = url.searchParams.get("state") || null;
    const code = url.searchParams.get("code") || null;
    if (!state || !code) {
      logger.error("Missing state or code in request parameters");
      return NextResponse.redirect(new URL(`/login?oauthError=${encodeURIComponent(
        "Failed to initiate OAuth login. Please try again.")}`, request.url));
    }
    const client = new OAuthClient();
    const data = client.getOAuthData(provider, state, code);

    if (!data) {
      logger.error("Failed to retrieve OAuth data");
      return NextResponse.redirect(new URL(`/login?oauthError=${encodeURIComponent(
        "Internal Server Error. Plese try again.")}`, request.url));
    }

    try {
      const oAuthUser = client.convertToUser(data);
      console.log("OAuth user data:", oAuthUser);
      const user = await connectUserToAccount(oAuthUser, provider);
      await createUserSession(user.id);
    } catch (error) {
      logger.error("Error converting OAuth data to user:", error);
      return NextResponse.redirect(new URL(`/login?oauthError=${encodeURIComponent(
        "Failed to convert OAuth data to user. Plese try again.")}`, request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));

  } catch (error) {
    logger.error("Error during OAuth login:", error);
    return NextResponse.redirect(new URL(`/login?oauthError=${encodeURIComponent(
      "Internal Server Error. Plese try again.")}`, request.url));
  }
}

async function connectUserToAccount(oAuthUser: User, provider: string): Promise<User> {
  let user = await DatabaseService.getUserByEmail(oAuthUser.email) as User;
  if (!user) {
    user = await DatabaseService.createUser({
      email: oAuthUser.email,
      username: oAuthUser.username,
      profilePhotoUrl: oAuthUser.profilePhotoUrl,
      isVerified: true,
    });
  } else if (!user.profilePhotoUrl) {
    const updatedUser = await DatabaseService.updateUser(user.id, {profilePhotoUrl: oAuthUser.profilePhotoUrl});
    if (!updatedUser) {
      logger.error("Failed to update user in database");
      throw new Error("Failed to update user in database");
    }
    user = updatedUser;
  }
  if (!user) {
    logger.error("Failed to create or retrieve user from database");
    throw new Error("Failed to create or retrieve user from database");
  }
  await DatabaseService.createUserOAuthAccount(user.id, provider, oAuthUser.id);

  return user;
}
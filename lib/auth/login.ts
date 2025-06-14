"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { FormLoginSchema } from "@/types/Auth";
import DatabaseService from "@/services/DatabaseService";
import { logger } from "@/utils/logger";
import { createUserSession } from "@/services/SessionService/SessionService";
import { verifyPassword } from "./passowrdHasher";


export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof FormLoginSchema>) {
  const user = await DatabaseService.getUserByEmail(email);

  if (!user) {
    logger.error("User not found", email);
    return new Error("Invalid email or password");
  }

  if (!user.isVerified) {
    console.log(user)
    logger.error("User not verified", email);
    return new Error("Please verify your email before logging in");
  }

  const isPasswordValid = await verifyPassword({
    hashedPassword: user.hashedPassword,
    password,
    salt: user.salt,
  });

  if (!isPasswordValid) {
    logger.error("Invalid password for user", email);
    return new Error("Invalid email or password");
  }

  await createUserSession(user.id);

  redirect("/");
}
"use server";

import { z } from "zod";

import { FormSchema } from "@/types/Auth";
import databaseService from "@/services/DatabaseService";
import { generateSalt, hashPassword, generateTokenAndExpirationDate } from "./passowrdHasher";
import { logger } from "@/utils/logger";
import EmailService from "@/services/EmailService/EmailService";


export async function actionSignUpUser({
  email,
  name,
  password,
}: z.infer<typeof FormSchema>) {
  const existingUser = await databaseService.getUserByEmail(email);

  if (existingUser != null) {
    logger.error("User with this email already exists", email);
    return new Error("Account already exists with this email");
  }

  try {
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    const user = await databaseService.createUser({email, username: name, hashedPassword, salt, isVerified: false, subscriptionPlan: null});

    if (user == null) {
      logger.error("Failed to return a user. User is a null", email);
      return new Error("Failed to create user");
    }
    
    const {token, expiresAt} = generateTokenAndExpirationDate();
    await databaseService.createVerificationToken(user.id, token, expiresAt);
    const emailSent = await EmailService.sendVerificationEmail(email, token);

    if (!emailSent) {
      logger.error("Failed to send verification email", email);
      return new Error("User created, but failed to send verification email");
    }

  } catch (error) {
    logger.error("Error creating user", error);
    return new Error("Error creating user");
  }
}
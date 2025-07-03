'use server';

import DatabaseService from "@/services/DatabaseService";
import { User } from "@/types/User";


export async function updateUser(userId: string, updates: Partial<User>) {
  try {
    await DatabaseService.updateUser(userId, updates);
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Failed to update user" };
  }
}

export async function getAppStateByUserId(userId: string) {
  try {
    const appState = await DatabaseService.getAppStateByUserId(userId);
    return appState;
  } catch (error) {
    console.error("Error fetching app state:", error);
    return [];
  }
}

export async function updateUserPaymentData(
  userId: string,
  newPaymentMethod: Record<string, any>,
  newBillingAddress: Record<string, any>
) {
  try {
    const result = await DatabaseService.updateUserPaymentData(userId, newPaymentMethod, newBillingAddress);
    if (result) {
      return { success: true, message: "Payment data updated successfully" };
    } else {
      return { success: false, message: "Failed to update payment data - user not found" };
    }
  } catch (error) {
    console.error("Error updating user payment data:", error);
    return { success: false, message: "Failed to update payment data" };
  }
}
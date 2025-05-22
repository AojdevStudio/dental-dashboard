"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Initiates the password reset process for a user account.
 * Sends a password reset email to the specified address with a secure token.
 * The user will be redirected to the confirmation page after clicking the link in the email.
 *
 * @param {string} email - The email address associated with the user account
 * @returns {Promise<{success?: boolean, message?: string, error?: string}>}
 *   Object containing success status, message, or error if the operation fails
 */
export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password/confirm`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password reset link sent to your email" };
}

/**
 * Updates the password for the currently authenticated user.
 * This function is typically called after a user has clicked on a password reset link
 * and entered a new password on the confirmation page.
 *
 * @param {string} password - The new password to set for the user account
 * @returns {Promise<{success?: boolean, message?: string, error?: string}>}
 *   Object containing success status, message, or error if the operation fails
 */
export async function updatePassword(password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password updated successfully" };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Type definition for user registration data.
 * Contains the required fields for creating a new user account.
 *
 * @typedef {Object} SignupData
 * @property {string} email - The email address for the new user account
 * @property {string} password - The password for the new user account
 */
export type SignupData = {
  email: string;
  password: string;
};

/**
 * Registers a new user with email and password using Supabase Auth.
 * This function initiates the signup process and sends a confirmation email to the user.
 * The user must verify their email address by clicking the link in the confirmation email.
 *
 * @param {SignupData} userData - The user registration data
 * @param {string} userData.email - The email address for the new user account
 * @param {string} userData.password - The password for the new user account
 * @returns {Promise<{success?: boolean, message?: string, error?: string}>}
 *   Object containing success status, message, or error if registration fails
 */
export async function signUp({ email, password }: SignupData) {
  const supabase = await createClient();

  // Use the API callback route for better security and handling
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Check your email for the confirmation link" };
}

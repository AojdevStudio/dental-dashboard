"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Type definition for login credentials.
 * Contains the required fields for authenticating a user with email and password.
 *
 * @typedef {Object} LoginData
 * @property {string} email - The user's email address for authentication
 * @property {string} password - The user's password for authentication
 */
export type LoginData = {
  email: string;
  password: string;
};

/**
 * Authenticates a user with their email and password using Supabase Auth.
 * On successful authentication, redirects the user to the dashboard.
 * On failure, returns an error message that can be displayed to the user.
 *
 * @param {LoginData} credentials - The user's login credentials
 * @param {string} credentials.email - The user's email address
 * @param {string} credentials.password - The user's password
 * @returns {Promise<{error?: string}>} Object containing error message if authentication fails
 * @throws {Redirect} Redirects to /dashboard on successful authentication
 */
export async function login({ email, password }: LoginData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

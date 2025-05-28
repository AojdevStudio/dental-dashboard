/**
 * @file Server actions for user authentication (sign-in, sign-out).
 * These actions interact with Supabase to manage user sessions.
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // Assuming createClient is the server client factory

/**
 * Handles user sign-in with email and password.
 *
 * @param {FormData} formData - The form data containing email and password.
 * @returns {Promise<{ error: string | null }>} An object containing an error message if sign-in fails, or null on success (before redirect).
 */
export async function signIn(
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!email || !password) {
    return { error: "Email and password are required.", success: false };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log the error for server-side debugging if needed
    // console.error('Sign-in error:', error.message);
    return { error: error.message || "Could not authenticate user.", success: false };
  }

  revalidatePath("/", "layout"); // Revalidate all paths to update user session state across the app
  redirect("/dashboard"); // Redirect to dashboard on successful sign-in
  // Note: redirect() throws an error, so this line below is effectively unreachable if redirect occurs.
  // return { error: null, success: true };
}

/**
 * Handles user sign-out.
 *
 * @returns {Promise<void>} A promise that resolves when sign-out is complete (before redirect).
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    // Log the error for server-side debugging
    // console.error('Sign-out error:', error.message);
    // Optionally, you could return an error object here if you want to display it on the client,
    // but typically sign-out errors are less critical to show directly to the user.
    // For now, we'll just proceed to redirect.
  }

  revalidatePath("/", "layout"); // Revalidate all paths
  redirect("/login"); // Redirect to login page on successful sign-out
}

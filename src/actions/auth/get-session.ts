"use server";

import { createClient } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * Retrieves the current user session from Supabase Auth.
 * Used to determine if a user is authenticated and access their session data.
 *
 * @returns {Promise<{session: Session | null}>} Object containing the current session or null if not authenticated
 */
export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  return { session: data.session };
}

/**
 * Retrieves the currently authenticated user from Supabase Auth.
 * This is useful for accessing user properties like id, email, etc.
 *
 * @returns {Promise<{user: User | null}>} Object containing the current user or null if not authenticated
 */
export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return { user: data.user };
}

/**
 * Middleware function to ensure a user is authenticated before accessing protected routes.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * @returns {Promise<User>} The authenticated user object
 * @throws {Redirect} Redirects to /login if not authenticated
 */
export async function requireAuth() {
  const { user } = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Signs out the current user and redirects them to the login page.
 * This invalidates the user's session with Supabase Auth.
 *
 * @returns {Promise<void>}
 * @throws {Redirect} Always redirects to /login after sign out
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

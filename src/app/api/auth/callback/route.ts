/**
 * Authentication Callback API Route
 *
 * This API route handles OAuth and email confirmation callbacks from Supabase Auth.
 * It processes the authentication code received from Supabase and exchanges it for a session.
 * This route is particularly important for handling authentication flows in non-browser environments
 * or when the client-side callback handling is not sufficient.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Handles GET requests to the auth callback endpoint.
 * Processes the authentication code from Supabase and exchanges it for a session.
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response indicating success or failure
 *   - 200: Authentication successful with {success: true}
 *   - 400: Bad request with {error: string} if code is missing or invalid
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Return error JSON or redirect to error page
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If successful, redirect to dashboard or return success
    return NextResponse.json({ success: true });
  }

  // If no code is provided, return error
  return NextResponse.json({ error: "No code provided" }, { status: 400 });
}

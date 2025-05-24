/**
 * Google OAuth Callback API Route
 *
 * This API route handles the OAuth 2.0 callback from Google after a user has authorized
 * the application to access their Google account. It processes the authorization code,
 * exchanges it for access and refresh tokens, and updates the data source in the database
 * with the new credentials.
 *
 * Note: This route does NOT use withAuth middleware because it's called by Google's OAuth service,
 * not by our authenticated users. The state parameter contains the dataSourceId which we validate.
 */

import { NextRequest, NextResponse } from "next/server"
import { handleAuthCallback } from "@/services/google/auth"
import * as googleSheetsQueries from '@/lib/database/queries/google-sheets'
import { getAuthContextByAuthId } from '@/lib/database/auth-context'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles the OAuth 2.0 callback from Google after user authorization.
 * Processes the authorization code, exchanges it for tokens, and updates the data source.
 *
 * The function follows this workflow:
 * 1. Extracts code and state parameters from the callback URL
 * 2. Exchanges the code for access and refresh tokens
 * 3. Updates the data source in the database with the new credentials
 * 4. Redirects the user back to the dashboard with success or error status
 *
 * @param {NextRequest} request - The incoming request from Google OAuth callback
 *   - request.searchParams.code: Authorization code from Google
 *   - request.searchParams.state: State parameter containing the dataSourceId
 *   - request.searchParams.error: Error message if authorization failed
 * @returns {Promise<NextResponse>} Redirect response to the dashboard
 *   - Redirects to /dashboard/settings with success or error parameters
 * @throws {Error} If token exchange fails or database update fails
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state") // This should be the dataSourceId
  const error = searchParams.get("error")

  // Redirect base URL - can be adjusted to a more specific success/error page
  const redirectBaseUrl = new URL("/dashboard/settings", request.nextUrl.origin)

  if (error) {
    console.error("Google OAuth error:", error)
    redirectBaseUrl.searchParams.set("googleAuthError", error)
    return NextResponse.redirect(redirectBaseUrl)
  }

  if (!code || !state) {
    console.error("Missing code or state in Google OAuth callback")
    redirectBaseUrl.searchParams.set("googleAuthError", "Callback parameters missing")
    return NextResponse.redirect(redirectBaseUrl)
  }

  const dataSourceId = state

  try {
    // Get the current user's auth context
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("User not authenticated during Google callback")
      redirectBaseUrl.searchParams.set("googleAuthError", "User not authenticated")
      return NextResponse.redirect(redirectBaseUrl)
    }

    const authContext = await getAuthContextByAuthId(user.id)
    if (!authContext) {
      console.error("Failed to get auth context for user:", user.id)
      redirectBaseUrl.searchParams.set("googleAuthError", "Failed to get user context")
      return NextResponse.redirect(redirectBaseUrl)
    }

    // Verify the data source exists and user has access
    const dataSource = await googleSheetsQueries.getDataSourceById(
      authContext,
      dataSourceId
    )

    if (!dataSource) {
      console.error("Data source not found or access denied:", dataSourceId)
      redirectBaseUrl.searchParams.set("googleAuthError", "Data source not found")
      return NextResponse.redirect(redirectBaseUrl)
    }

    // Exchange the code for tokens
    const tokenData = await handleAuthCallback(code)

    if (!tokenData.accessToken) {
      console.error("Access token not found in token data:", tokenData)
      throw new Error("Access token not found in token data")
    }

    // Update the data source with the new tokens
    await googleSheetsQueries.updateDataSourceTokens(
      authContext,
      dataSourceId,
      {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiryDate: new Date(tokenData.expiryDate),
      }
    )

    redirectBaseUrl.searchParams.set("googleAuthSuccess", "true")
    redirectBaseUrl.searchParams.set("dataSourceId", dataSourceId)
    return NextResponse.redirect(redirectBaseUrl)
  } catch (err) {
    console.error("Failed to exchange Google code for tokens or update data source:", err)
    const errorMessage = err instanceof Error ? err.message : "Token exchange failed"
    redirectBaseUrl.searchParams.set("googleAuthError", errorMessage)
    return NextResponse.redirect(redirectBaseUrl)
  }
}
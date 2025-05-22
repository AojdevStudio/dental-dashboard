/**
 * Google OAuth Callback API Route
 *
 * This API route handles the OAuth 2.0 callback from Google after a user has authorized
 * the application to access their Google account. It processes the authorization code,
 * exchanges it for access and refresh tokens, and updates the data source in the database
 * with the new credentials.
 *
 * The route is designed to be called by Google's OAuth service and redirects the user
 * back to the dashboard with success or error information.
 */

import { prisma } from "@/lib/prisma"; // Use named import
import { exchangeCodeForTokens } from "@/services/google/auth"; // Adjust path
import { type NextRequest, NextResponse } from "next/server";

/**
 * Interface representing the token response from Google OAuth 2.0.
 * Contains the access and refresh tokens along with expiration information.
 *
 * @typedef {Object} GoogleTokenResponse
 * @property {string} access_token - The token used to access Google APIs
 * @property {string} [refresh_token] - Token used to refresh the access token when it expires
 * @property {number} expires_in - Time in seconds until the access token expires
 * @property {string} [id_token] - JWT token containing user information (for OpenID Connect)
 * @property {string} [scope] - Space-delimited list of scopes granted
 * @property {string} [token_type] - Type of token, usually "Bearer"
 */
interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
}

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
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This should be the dataSourceId
  const error = searchParams.get("error");

  // Redirect base URL - can be adjusted to a more specific success/error page
  const redirectBaseUrl = new URL("/dashboard/settings", request.nextUrl.origin);

  if (error) {
    console.error("Google OAuth error:", error);
    redirectBaseUrl.searchParams.set("googleAuthError", error);
    return NextResponse.redirect(redirectBaseUrl);
  }

  if (!code || !state) {
    console.error("Missing code or state in Google OAuth callback");
    redirectBaseUrl.searchParams.set("googleAuthError", "Callback parameters missing");
    return NextResponse.redirect(redirectBaseUrl);
  }

  const dataSourceId = state;

  try {
    const tokenResponse = (await exchangeCodeForTokens(code)) as GoogleTokenResponse;

    if (!tokenResponse.access_token) {
      // This case should ideally be caught by exchangeCodeForTokens if it throws on bad response
      console.error("Access token not found in Google response object:", tokenResponse);
      throw new Error("Access token not found in Google response");
    }

    const accessToken = tokenResponse.access_token;
    const refreshToken = tokenResponse.refresh_token;
    const expiresIn = tokenResponse.expires_in; // In seconds

    const expiryDate = new Date(Date.now() + expiresIn * 1000);

    /**
     * Interface for the data to update in the data source record.
     * Defines the structure of the credentials and status information.
     *
     * @typedef {Object} DataSourceUpdateData
     * @property {string} googleAccessToken - The Google API access token
     * @property {string} [googleRefreshToken] - The Google API refresh token (if provided)
     * @property {Date} googleExpiryDate - When the access token expires
     * @property {string} connectionStatus - Current connection status (e.g., "CONNECTED")
     * @property {string} [lastSyncStatus] - Status of the last synchronization
     * @property {Date} updatedAt - When the record was last updated
     */
    interface DataSourceUpdateData {
      googleAccessToken: string;
      googleRefreshToken?: string;
      googleExpiryDate: Date;
      connectionStatus: string; // Consider using an enum if you have defined states
      lastSyncStatus?: string; // Consider an enum
      updatedAt: Date;
    }

    const updateData: DataSourceUpdateData = {
      googleAccessToken: accessToken,
      googleExpiryDate: expiryDate,
      connectionStatus: "CONNECTED",
      lastSyncStatus: "PENDING",
      updatedAt: new Date(),
    };

    if (refreshToken) {
      updateData.googleRefreshToken = refreshToken;
    }

    await prisma.dataSource.update({
      where: { id: dataSourceId },
      data: updateData,
    });

    redirectBaseUrl.searchParams.set("googleAuthSuccess", "true");
    redirectBaseUrl.searchParams.set("dataSourceId", dataSourceId);
    return NextResponse.redirect(redirectBaseUrl);
  } catch (err) {
    console.error("Failed to exchange Google code for tokens or update data source:", err);
    const errorMessage = err instanceof Error ? err.message : "Token exchange failed";
    redirectBaseUrl.searchParams.set("googleAuthError", errorMessage);
    return NextResponse.redirect(redirectBaseUrl);
  }
}

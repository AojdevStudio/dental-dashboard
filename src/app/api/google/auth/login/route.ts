/**
 * Google Authentication Login API Route
 * 
 * This API route initiates the Google OAuth 2.0 authentication flow by redirecting
 * the user to Google's authorization page. It generates the authorization URL with
 * the necessary scopes for accessing Google Drive and Sheets APIs, and includes
 * the data source ID as state parameter for the callback.
 * 
 * The route requires a dataSourceId query parameter to associate the authentication
 * with a specific data source in the application.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/services/google/auth"; // Adjust path if necessary

/**
 * Handles GET requests to initiate Google OAuth authentication.
 * Generates an authorization URL and redirects the user to Google's consent page.
 * 
 * The function performs the following steps:
 * 1. Validates the dataSourceId parameter is present
 * 2. Checks for required environment configuration
 * 3. Defines the required API scopes for Google Drive and Sheets
 * 4. Generates the authorization URL with state parameter
 * 5. Redirects the user to Google's authorization page
 *
 * @param {NextRequest} request - The incoming request object
 *   - request.searchParams.dataSourceId: ID of the data source to associate with the auth
 * @returns {Promise<NextResponse>} Redirect to Google's authorization page or error response
 *   - 302: Redirect to Google authorization URL
 *   - 400: Bad request if dataSourceId is missing
 *   - 500: Server error if environment is misconfigured or URL generation fails
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");

  if (!dataSourceId) {
    return NextResponse.json({ error: "dataSourceId is required" }, { status: 400 });
  }

  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!googleRedirectUri) {
    console.error("GOOGLE_REDIRECT_URI is not set in environment variables.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // Define the OAuth scopes required for accessing Google Drive and Sheets
  const scopes = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    // Consider adding 'profile' and 'email' if you need user info during auth and don't get it elsewhere
    // 'https://www.googleapis.com/auth/userinfo.profile',
    // 'https://www.googleapis.com/auth/userinfo.email',
  ];
  const accessType = "offline"; // To get a refresh token

  try {
    const authorizationUrl = getAuthorizationUrl(scopes, dataSourceId, accessType);
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("Failed to generate Google authorization URL:", error);
    // Potentially redirect to an error page on the client or return JSON
    return NextResponse.json(
      { error: "Failed to initiate Google authentication" },
      { status: 500 }
    );
  }
}

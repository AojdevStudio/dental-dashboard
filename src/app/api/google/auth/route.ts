/**
 * Google Authentication API Route
 * 
 * This API route handles Google OAuth authentication flow for the application.
 * It provides endpoints for initiating the OAuth flow and processing the callback
 * with authorization code. The route stores the obtained credentials in the database
 * for future API calls to Google services like Google Sheets.
 */

import { type NextRequest, NextResponse } from "next/server";
import { generateAuthUrl, handleAuthCallback } from "../../../../services/google/auth";
import { prisma } from "../../../../lib/db";

/**
 * Generates and returns a Google OAuth authorization URL.
 * This URL is used to redirect users to Google's authentication page.
 *
 * @returns {Promise<NextResponse>} JSON response containing the authorization URL
 *   - 200: Success with {authUrl: string}
 */
export async function GET() {
  const authUrl = generateAuthUrl();
  return NextResponse.json({ authUrl }, { status: 200 });
}

/**
 * Processes the authorization code received from Google OAuth callback.
 * Exchanges the code for access and refresh tokens, then stores the credentials
 * in the database as a new data source for future API calls.
 *
 * @param {NextRequest} request - The incoming request object
 *   - request.body.code: The authorization code from Google OAuth
 * @returns {Promise<NextResponse>} JSON response indicating success or failure
 *   - 200: Authentication successful with {success: true, message: string}
 *   - 400: Bad request with {success: false, message: string} if code is missing
 *   - 500: Server error with {success: false, message: string} if token exchange fails
 * @throws {Error} If there's an issue with the database operation or token exchange
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Authorization code is required" },
        { status: 400 }
      );
    }

    const tokenData = await handleAuthCallback(code);

    // Store token data in database
    await prisma.dataSource.create({
      data: {
        type: "GOOGLE_SHEETS",
        credentials: {
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          expiryDate: tokenData.expiryDate,
        },
        // Add other required fields as needed
      },
    });

    return NextResponse.json(
      { success: true, message: "Authentication successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Google auth callback error:", error);
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 });
  }
}

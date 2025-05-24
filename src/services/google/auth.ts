/**
 * Google OAuth Authentication Service
 *
 * Provides methods for Google OAuth 2.0 authentication flow, including
 * generating authorization URLs, handling callback responses, and refreshing tokens.
 * This service uses the Google APIs Node.js client library.
 */
import { google } from "googleapis";

/**
 * OAuth2 client configured with credentials from environment variables
 *
 * @requires GOOGLE_CLIENT_ID - Environment variable for the Google API client ID
 * @requires GOOGLE_CLIENT_SECRET - Environment variable for the Google API client secret
 * @requires GOOGLE_REDIRECT_URI - Environment variable for the OAuth callback URL
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Token data returned after successful authentication
 *
 * @interface TokenData
 */
interface TokenData {
  /** JWT access token for API requests */
  accessToken: string;

  /** Long-lived token for obtaining new access tokens */
  refreshToken: string;

  /** Token expiration timestamp in milliseconds since the Unix epoch */
  expiryDate: number;
}

/**
 * Generates a Google OAuth authorization URL
 *
 * Creates a URL for redirecting users to Google's OAuth consent screen
 * with specific scopes. Uses offline access type to obtain a refresh token
 * and forces consent prompt to ensure a refresh token is issued.
 *
 * @param {string} dataSourceId - Optional data source ID to include in state parameter
 * @returns {string} Authorization URL for redirecting to Google's consent screen
 *
 * @example
 * // Redirect user to Google's consent screen
 * const authUrl = generateAuthUrl(dataSourceId);
 * res.redirect(authUrl);
 */
export function generateAuthUrl(dataSourceId?: string): string {
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: dataSourceId,
  });
}

/**
 * Processes OAuth callback and exchanges authorization code for tokens
 *
 * Exchanges the authorization code from Google's OAuth callback for
 * access and refresh tokens. Returns a standardized token data object.
 *
 * @param {string} code - Authorization code received from Google's OAuth callback
 * @returns {Promise<TokenData>} Promise resolving to token data
 * @throws {Error} If token exchange fails
 *
 * @example
 * // Handle OAuth callback
 * router.get('/auth/callback', async (req, res) => {
 *   try {
 *     const code = req.query.code as string;
 *     const tokenData = await handleAuthCallback(code);
 *     // Store tokens in database...
 *     res.redirect('/dashboard');
 *   } catch (error) {
 *     res.status(500).send('Authentication failed');
 *   }
 * });
 */
export async function handleAuthCallback(code: string): Promise<TokenData> {
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token as string,
    refreshToken: tokens.refresh_token as string,
    expiryDate: tokens.expiry_date as number,
  };
}

/**
 * Refreshes an expired access token using a refresh token
 *
 * Uses the provided refresh token to obtain a new access token
 * from Google's OAuth service when the previous one has expired.
 *
 * @param {string} refreshToken - The refresh token obtained during initial authorization
 * @returns {Promise<{accessToken: string, expiryDate: number}>} New access token and its expiry date
 * @throws {Error} If token refresh fails or response is missing required fields
 *
 * @example
 * // Refresh an expired token
 * try {
 *   const { accessToken, expiryDate } = await refreshAccessToken(storedRefreshToken);
 *   // Update stored access token and expiry date...
 * } catch (error) {
 *   console.error('Failed to refresh token:', error);
 *   // Handle authentication failure...
 * }
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiryDate: number;
}> {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  await oauth2Client.getAccessToken();

  if (!oauth2Client.credentials.access_token || !oauth2Client.credentials.expiry_date) {
    throw new Error("Failed to refresh access token or get expiry date.");
  }

  return {
    accessToken: oauth2Client.credentials.access_token,
    expiryDate: oauth2Client.credentials.expiry_date,
  };
}

/**
 * Google OAuth Authentication Utility
 *
 * This module provides utility functions for Google OAuth authentication.
 * It loads credentials from environment variables and provides methods for
 * OAuth flow management.
 */

// Load environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

/**
 * Generates a Google OAuth authorization URL with the specified scopes
 * @param {string[]} scopes - Array of OAuth scopes to request
 * @param {string} [state] - Optional state parameter for security validation
 * @param {string} [accessType='online'] - Whether to request offline access (e.g., 'offline' for refresh tokens, or 'online')
 * @returns {string} The authorization URL
 */
export function getAuthorizationUrl(
  scopes = ["profile", "email"],
  state = "",
  accessType = "online"
) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth credentials are not properly configured");
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", scopes.join(" "));
  url.searchParams.append("access_type", accessType);

  if (state) {
    url.searchParams.append("state", state);
  }

  return url.toString();
}

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param {string} code - The authorization code received from Google
 * @returns {Promise<Object>} The token response object
 */
export async function exchangeCodeForTokens(code) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error("Google OAuth credentials are not properly configured");
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams();

  params.append("client_id", GOOGLE_CLIENT_ID);
  params.append("client_secret", GOOGLE_CLIENT_SECRET);
  params.append("code", code);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", GOOGLE_REDIRECT_URI);

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Token exchange failed: ${errorData.error_description || errorData.error || "Unknown error"}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

/**
 * Refreshes an access token using a refresh token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<Object>} The new token response object
 */
export async function refreshAccessToken(refreshToken) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not properly configured");
  }

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams();

  params.append("client_id", GOOGLE_CLIENT_ID);
  params.append("client_secret", GOOGLE_CLIENT_SECRET);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Token refresh failed: ${errorData.error_description || errorData.error || "Unknown error"}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

/**
 * Fetches the user's Google profile information using an access token
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The user's profile information
 */
export async function getUserProfile(accessToken) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch user profile: ${errorData.error_description || errorData.error || "Unknown error"}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Revokes an access token
 * @param {string} token - The token to revoke
 * @returns {Promise<boolean>} Whether the revocation was successful
 */
export async function revokeToken(token) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error revoking token:", error);
    return false;
  }
}

/**
 * Validates the Google OAuth configuration
 * @returns {boolean} Whether the configuration is valid
 */
export function validateConfig() {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI);
}

// Export credentials for use in other modules if needed
export const credentials = {
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
};

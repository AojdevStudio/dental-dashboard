import { google } from "googleapis";

// Configure OAuth client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

export function generateAuthUrl(): string {
  const scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

export async function handleAuthCallback(code: string): Promise<TokenData> {
  const { tokens } = await oauth2Client.getToken(code);

  return {
    accessToken: tokens.access_token as string,
    refreshToken: tokens.refresh_token as string,
    expiryDate: tokens.expiry_date as number,
  };
}

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

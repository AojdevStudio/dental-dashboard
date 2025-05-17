import { type NextRequest, NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/services/google/auth"; // Adjust path if necessary

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

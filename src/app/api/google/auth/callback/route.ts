import { type NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/services/google/auth"; // Adjust path
import { prisma } from "@/lib/prisma"; // Use named import

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
}

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

    // Define the type for Prisma update data based on your schema
    // This is a partial type, ensure it matches your Prisma.DataSourceUpdateInput
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

import { type NextRequest, NextResponse } from "next/server";
import { generateAuthUrl, handleAuthCallback } from "../../../../services/google/auth";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const authUrl = generateAuthUrl();
  return NextResponse.json({ authUrl }, { status: 200 });
}

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

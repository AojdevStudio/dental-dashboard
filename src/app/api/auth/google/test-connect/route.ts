import { generateAuthUrl } from "@/services/google/auth";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataSourceId = searchParams.get("dataSourceId");

  if (!dataSourceId) {
    return NextResponse.json({ error: "dataSourceId is required" }, { status: 400 });
  }

  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the data source exists
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    });

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 });
    }

    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!googleRedirectUri) {
      console.error("GOOGLE_REDIRECT_URI is not set in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Generate auth URL with dataSourceId in state
    const authorizationUrl = generateAuthUrl(dataSourceId);
    return NextResponse.redirect(authorizationUrl);
  } catch (error) {
    console.error("Failed to generate Google authorization URL:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate Google authentication",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

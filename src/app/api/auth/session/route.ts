import { cachedJson } from "@/lib/api/cache-headers";
import { prisma } from "@/lib/database/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Get current user session with database role information
 * Used by client-side components to determine user permissions
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // Don't cache failed auth responses
      return cachedJson(
        {
          authenticated: false,
          error: error?.message || "No user session found",
        },
        "NO_CACHE"
      );
    }

    // Get user details from database
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clinicId: true,
      },
    });

    if (!dbUser) {
      return cachedJson(
        {
          authenticated: false,
          error: "User not found in database",
        },
        "NO_CACHE"
      );
    }

    // Cache successful auth responses for a short time
    return cachedJson(
      {
        authenticated: true,
        user: {
          authId: user.id,
          email: user.email,
          dbUser: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            clinicId: dbUser.clinicId,
            isSystemAdmin: dbUser.role === "system_admin",
          },
        },
      },
      "PRIVATE"
    );
  } catch (error) {
    console.error("Error getting session:", error);
    return cachedJson(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "NO_CACHE"
    );
  }
}

export async function POST(request: Request) {
  // TODO: Implement session creation/update logic
  return Response.json({ message: "Session POST placeholder" });
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/database/prisma";

/**
 * Enhanced sign-in that verifies both auth and database user
 */
export async function signInWithVerification(
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!email || !password) {
    return { error: "Email and password are required.", success: false };
  }

  // Step 1: Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "Authentication failed.", success: false };
  }

  // Step 2: Verify user exists in database with proper setup
  try {
    // First try to find by authId
    let dbUser = await prisma.user.findUnique({
      where: { authId: authData.user.id },
      include: {
        clinic: true,
      },
    });

    // If not found by authId, try by email (for existing users before UUID migration)
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: authData.user.email! },
        include: {
          clinic: true,
        },
      });

      // If found by email but authId doesn't match, update it
      if (dbUser && dbUser.authId !== authData.user.id) {
        console.log("Updating authId for user:", dbUser.email);
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            authId: authData.user.id,
            uuidId: authData.user.id, // Also set UUID for future migration
          },
          include: {
            clinic: true,
          },
        });
      }
    }

    // Check for user clinic roles separately
    const userRoles = await prisma.userClinicRole.findMany({
      where: { userId: dbUser?.id || "" },
    });

    if (!dbUser) {
      // User exists in auth but not in database - this is the "granting user" error
      console.error("User authenticated but not found in database:", authData.user.id);

      // Sign them out to prevent partial access
      await supabase.auth.signOut();

      return {
        error: "Your account setup is incomplete. Please contact support or register again.",
        success: false,
      };
    }

    // Verify user has a clinic assignment (skip for system admins)
    if (dbUser.role !== "system_admin" && (!dbUser.clinicId || !dbUser.clinic)) {
      console.error("User has no clinic assignment:", dbUser.id);

      await supabase.auth.signOut();

      return {
        error: "Your account is not associated with a clinic. Please contact your administrator.",
        success: false,
      };
    }

    // Verify user has role assignments (skip for system admins)
    if (dbUser.role !== "system_admin" && (!userRoles || userRoles.length === 0)) {
      console.error("User has no clinic roles:", dbUser.id);

      // Try to create a default role
      try {
        await prisma.userClinicRole.create({
          data: {
            userId: dbUser.id,
            clinicId: dbUser.clinicId,
            role: "staff",
            isActive: true,
          },
        });
      } catch (roleError) {
        console.error("Failed to create default role:", roleError);
      }
    }

    // Everything is good - proceed with login
    console.log("Login successful for user:", dbUser.email);
    
    revalidatePath("/", "layout");
    
    // Return success without redirect - let client handle navigation
    return { error: null, success: true };
  } catch (dbError) {
    console.error("Database error during sign-in:", dbError);
    console.error("Error details:", {
      message: dbError instanceof Error ? dbError.message : 'Unknown error',
      stack: dbError instanceof Error ? dbError.stack : undefined
    });

    // Sign them out to prevent partial access
    await supabase.auth.signOut();

    return {
      error: "Database error while granting user access. Please try again or contact support.",
      success: false,
    };
  }
}

/**
 * Enhanced sign-out that ensures complete session cleanup
 */
export async function signOutWithCleanup() {
  const supabase = await createClient();

  try {
    // Get current user before signing out for logging purposes
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      console.log("Signing out user:", user.id);
    }

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out error:", error);
      // Continue with cleanup even if sign out partially fails
    }

    // Clear any client-side storage (this will be handled by middleware)
    // Revalidate all cached paths to ensure fresh data
    revalidatePath("/", "layout");

    // Always redirect to login, even if there was an error
    redirect("/login");
  } catch (error) {
    console.error("Error during sign out:", error);
    // Force redirect to login even on error
    redirect("/login");
  }
}

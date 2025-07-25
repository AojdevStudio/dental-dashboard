'use server';

import { prisma } from '@/lib/database/client';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Enhanced sign-in that verifies both auth and database user
 */
export async function signInWithVerification(
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  if (!(email && password)) {
    return { error: 'Email and password are required.', success: false };
  }

  // Step 1: Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Authentication failed.', success: false };
  }

  // Step 2: Verify user exists in database with proper setup
  try {
    let dbUser = await prisma.user.findUnique({
      where: { authId: authData.user.id },
    });

    // If not found by authId, try by email (for existing users before UUID migration)
    if (!dbUser && authData.user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: authData.user.email },
      });

      // If found by email but authId doesn't match, update it
      if (dbUser && dbUser.authId !== authData.user.id) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            authId: authData.user.id,
            uuidId: authData.user.id, // Also set UUID for future migration
          },
        });
      }
    }

    // Check for user clinic roles separately
    const userRoles = await prisma.userClinicRole.findMany({
      where: { userId: dbUser?.id || '' },
    });

    if (!dbUser) {
      // Sign them out to prevent partial access
      await supabase.auth.signOut();

      return {
        error: 'Your account setup is incomplete. Please contact support or register again.',
        success: false,
      };
    }

    // Verify user has a clinic assignment (skip for system admins)
    if (dbUser.role !== 'system_admin' && !dbUser.clinicId) {
      await supabase.auth.signOut();

      return {
        error: 'Your account is not associated with a clinic. Please contact your administrator.',
        success: false,
      };
    }

    // Verify user has role assignments (skip for system admins)
    if (dbUser.role !== 'system_admin' && (!userRoles || userRoles.length === 0)) {
      // Try to create a default role
      try {
        if (dbUser.clinicId) {
          await prisma.userClinicRole.create({
            data: {
              userId: dbUser.id,
              clinicId: dbUser.clinicId,
              role: 'staff',
              isActive: true,
            },
          });
        }
      } catch (_roleError) {}
    }

    revalidatePath('/', 'layout');

    // Return success without redirect - let client handle navigation
    return { error: null, success: true };
  } catch (dbError) {
    console.error('🚨 Database error caught in signInWithVerification:', dbError);
    console.error('🚨 Error name:', (dbError as Error)?.name);
    console.error('🚨 Error message:', (dbError as Error)?.message);
    console.error('🚨 Error stack:', (dbError as Error)?.stack);

    // Sign them out to prevent partial access
    await supabase.auth.signOut();

    return {
      error: 'Database error while granting user access. Please try again or contact support.',
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
    }

    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Continue with cleanup even if sign out partially fails
    }

    // Clear any client-side storage (this will be handled by middleware)
    // Revalidate all cached paths to ensure fresh data
    revalidatePath('/', 'layout');

    // Always redirect to login, even if there was an error
    redirect('/login');
  } catch (_error) {
    // Force redirect to login even on error
    redirect('/login');
  }
}

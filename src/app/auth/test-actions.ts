'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Test-only authentication that bypasses Prisma connection issues
 * Uses Supabase client directly for database queries
 */
export async function signInWithSupabaseOnly(
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

  // Step 2: Verify user exists in database using service client with admin privileges
  try {
    // Create service client with admin privileges to bypass RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!(supabaseUrl && serviceKey)) {
      throw new Error('Missing Supabase configuration for test environment');
    }

    const serviceClient = createAdminClient(supabaseUrl, serviceKey);

    // Check if user exists in database via service client
    const { data: dbUser, error: userError } = await serviceClient
      .from('users')
      .select('id, email, name, role, clinic_id, auth_id')
      .eq('auth_id', authData.user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 is "not found"
      console.error('Database query error:', userError);
      return { error: 'Database error while verifying user.', success: false };
    }

    if (!dbUser) {
      // Try finding by email as fallback
      const { data: dbUserByEmail, error: emailError } = await serviceClient
        .from('users')
        .select('id, email, name, role, clinic_id, auth_id')
        .eq('email', authData.user.email)
        .single();

      if (emailError && emailError.code !== 'PGRST116') {
        console.error('Database query error (email lookup):', emailError);
        return { error: 'Database error while verifying user.', success: false };
      }

      if (!dbUserByEmail) {
        await supabase.auth.signOut();
        return {
          error: 'Your account setup is incomplete. Please contact support or register again.',
          success: false,
        };
      }

      // Update auth_id if found by email
      if (dbUserByEmail.auth_id !== authData.user.id) {
        const { error: updateError } = await serviceClient
          .from('users')
          .update({ auth_id: authData.user.id })
          .eq('id', dbUserByEmail.id);

        if (updateError) {
          console.error('Error updating auth_id:', updateError);
        }
      }
    }

    revalidatePath('/', 'layout');
    return { error: null, success: true };
  } catch (error) {
    console.error('🚨 Test auth error:', error);
    await supabase.auth.signOut();
    return {
      error: 'Database error while granting user access. Please try again or contact support.',
      success: false,
    };
  }
}

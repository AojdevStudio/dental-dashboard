'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Client-side authentication that works in browser environments
 * This bypasses the server-side cookies dependency for client-side usage
 */
export async function signInWithClientAuth(
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!(email && password)) {
    return { error: 'Email and password are required.', success: false };
  }

  try {
    // Authenticate with Supabase using browser client
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { error: authError?.message || 'Authentication failed.', success: false };
    }

    // Authentication successful - the browser client will handle session management
    return { error: null, success: true };
  } catch (error) {
    console.error('🚨 Client auth error:', error);
    return {
      error: 'Authentication failed. Please try again.',
      success: false,
    };
  }
}

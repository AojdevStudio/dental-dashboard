'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Singleton Supabase client instance
let client: ReturnType<typeof createBrowserClient> | undefined;

function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing required Supabase environment variables');
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}

/**
 * Hook for accessing current user state
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setError(error);
        } else {
          setUser(user);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      setUser(session?.user || null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}

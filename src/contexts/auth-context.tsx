'use client';

import { createClient } from '@/lib/supabase/client';
import clientLogger from '@/lib/utils/client-logger';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * Database user information from the session API
 */
interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
  isSystemAdmin: boolean;
}

/**
 * Interface for authentication state and methods
 */
export interface AuthState {
  /** Current authenticated user or null if not authenticated */
  user: User | null;

  /** Current session data or null if no active session */
  session: Session | null;

  /** Database user information */
  dbUser: DatabaseUser | null;

  /** Whether auth state is still loading */
  isLoading: boolean;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Whether user is a system admin */
  isSystemAdmin: boolean;

  /**
   * Signs out the current user and redirects to login page
   */
  signOut: () => Promise<void>;
}

// Create the context with undefined default
const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * AuthProvider component that manages global authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize Supabase client using the SSR-compatible browser client
  const supabase = useRef(createClient()).current;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch database user information from the session API
   */
  const fetchDbUser = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setDbUser(null);
      return;
    }

    try {
      const response = await fetch('/api/auth/session');

      if (!response.ok) {
        throw new Error(`API responded with ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.authenticated && data.user?.dbUser) {
        setDbUser(data.user.dbUser);
      } else {
        setDbUser(null);
      }
    } catch (error) {
      clientLogger.error('Failed to fetch database user from API', {
        error: error instanceof Error ? error.message : String(error),
        userId: authUser.id,
        stack: error instanceof Error ? error.stack : undefined,
      });
      setDbUser(null);
    }
  }, []);

  /**
   * Handles session refresh fallback when no active session is found
   */
  const handleSessionRefreshFallback = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.authenticated && data.user) {
        // Try to refresh the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData.session) {
          setSession(refreshData.session);
          setUser(refreshData.session.user);
          setDbUser(data.user.dbUser);
        }
      }
    } catch (sessionError) {
      clientLogger.error('AuthProvider session API check failed', {
        error: sessionError instanceof Error ? sessionError.message : String(sessionError),
        stack: sessionError instanceof Error ? sessionError.stack : undefined,
      });
    }
  }, [supabase]);

  /**
   * Gets the initial session and sets up authentication state
   */
  const getInitialSession = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        setUser(session.user);
        await fetchDbUser(session.user);
      } else {
        // Check if we can get user info from the session API directly
        await handleSessionRefreshFallback();
      }
    } catch (error) {
      clientLogger.error('Error getting initial session in AuthProvider', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchDbUser, handleSessionRefreshFallback]);

  /**
   * Handles authentication state changes
   */
  const handleAuthStateChange = useCallback(
    async (_event: AuthChangeEvent, currentSession: Session | null) => {
      try {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        // Fetch database user information when auth state changes
        await fetchDbUser(currentUser);
      } catch (error) {
        clientLogger.error('Error during auth state change', {
          error: error instanceof Error ? error.message : String(error),
          event: _event,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
      // Note: Don't set loading false here since initial session already did
    },
    [fetchDbUser]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: supabase client is memoized with useRef and won't change
  useEffect(() => {
    // First, get the initial session explicitly
    getInitialSession();

    // Then set up the listener for future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [getInitialSession, handleAuthStateChange]);

  /**
   * Signs out the current user and redirects to login page
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setDbUser(null);

      // Redirect to login page after sign out
      router.push('/login');
    } catch (error) {
      clientLogger.error('Error during sign out process', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  const value: AuthState = {
    user,
    session,
    dbUser,
    isLoading,
    isAuthenticated: !!user,
    isSystemAdmin: !!dbUser?.isSystemAdmin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for accessing authentication state
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

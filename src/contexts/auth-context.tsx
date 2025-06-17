'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  const supabase = createClient();
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
      console.error('Failed to fetch database user:', error);
      setDbUser(null);
    }
  }, []);

  useEffect(() => {
    // First, get the initial session explicitly
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchDbUser(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Then set up the listener for future changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => {
        try {
          setSession(currentSession);
          const currentUser = currentSession?.user ?? null;
          setUser(currentUser);

          // Fetch database user information when auth state changes
          await fetchDbUser(currentUser);
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
        // Note: Don't set loading false here since initial session already did
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchDbUser]);

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
      console.error('Error during sign out:', error);
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

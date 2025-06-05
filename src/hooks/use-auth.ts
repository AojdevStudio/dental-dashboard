import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
/**
 * Authentication hook for managing user authentication state
 *
 * Provides a centralized way to access authentication state and methods throughout the application.
 * This hook wraps around Supabase Auth and provides a simpler API for common authentication operations.
 */
import { useCallback, useEffect, useState } from "react";

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
 *
 * @interface AuthState
 */
interface AuthState {
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
   *
   * @returns {Promise<void>}
   */
  signOut: () => Promise<void>;
}

/**
 * Custom hook for managing authentication state
 *
 * This hook:
 * - Tracks the current user and session state
 * - Fetches database user information including role
 * - Provides a method to sign out
 * - Handles authentication state changes
 * - Exposes whether auth is still loading
 *
 * @returns {AuthState} Authentication state and methods
 *
 * @example
 * // In a component that needs auth state:
 * import { useAuth } from '@/hooks/use-auth'; // MODIFIED
 *
 * function Profile() {
 *   const { user, dbUser, isLoading, signOut, isSystemAdmin } = useAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   if (!user) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.email}</h1>
 *       {isSystemAdmin && <p>System Administrator</p>}
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 */
export function useAuth(): AuthState {
  // Initialize Supabase client using the SSR-compatible browser client
  const supabase = createClient();

  const router = useRouter();
  const pathname = usePathname();

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
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (data.authenticated && data.user?.dbUser) {
        setDbUser(data.user.dbUser);
      } else {
        setDbUser(null);
      }
    } catch (error) {
      console.error("Error fetching database user:", error);
      setDbUser(null);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch database user information
        await fetchDbUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Fetch database user information when auth state changes
        await fetchDbUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchDbUser]);

  /**
   * Signs out the current user and redirects to login page
   *
   * @returns {Promise<void>}
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setDbUser(null);

      // Redirect to login page after sign out
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    session,
    dbUser,
    isLoading,
    isAuthenticated: !!user,
    isSystemAdmin: dbUser?.isSystemAdmin || false,
    signOut,
  };
}

export default useAuth;

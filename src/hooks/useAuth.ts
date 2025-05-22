import {
  type AuthChangeEvent,
  type Session,
  SupabaseClient,
  type User,
  createClient,
} from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
/**
 * Authentication hook for managing user authentication state
 *
 * Provides a centralized way to access authentication state and methods throughout the application.
 * This hook wraps around Supabase Auth and provides a simpler API for common authentication operations.
 */
import { useEffect, useState } from "react";

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

  /** Whether auth state is still loading */
  isLoading: boolean;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

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
 * - Provides a method to sign out
 * - Handles authentication state changes
 * - Exposes whether auth is still loading
 *
 * @returns {AuthState} Authentication state and methods
 *
 * @example
 * // In a component that needs auth state:
 * import { useAuth } from '@/hooks/useAuth';
 *
 * function Profile() {
 *   const { user, isLoading, signOut } = useAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   if (!user) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.email}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 */
export function useAuth(): AuthState {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  /**
   * Signs out the current user and redirects to login page
   *
   * @returns {Promise<void>}
   */
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();

      // Redirect to login page after sign out
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
}

export default useAuth;

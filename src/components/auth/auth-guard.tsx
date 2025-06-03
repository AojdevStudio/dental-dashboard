"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
  requireDatabaseUser?: boolean;
}

/**
 * Client-side authentication guard component
 *
 * This component provides an additional layer of security by checking
 * authentication state on the client side. It should be used in conjunction
 * with server-side middleware protection, not as a replacement.
 *
 * @param children - The content to render if authenticated
 * @param fallbackUrl - URL to redirect to if not authenticated (default: "/login")
 * @param requireDatabaseUser - Whether to require a database user record (not just auth)
 */
export function AuthGuard({
  children,
  fallbackUrl = "/login",
  requireDatabaseUser = true,
}: AuthGuardProps) {
  const { user, dbUser, isAuthenticated, isLoading, isSystemAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.warn("AuthGuard: User not authenticated, redirecting to", fallbackUrl);
      router.push(fallbackUrl);
    }
  }, [isLoading, isAuthenticated, router, fallbackUrl]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // If we require database user verification, check for database user or valid metadata
  if (requireDatabaseUser && user) {
    // System admins bypass metadata requirements since they're validated server-side
    if (isSystemAdmin && dbUser) {
      console.log("AuthGuard: System admin authenticated with database user");
      return <>{children}</>;
    }

    // For regular users, check if they have database user info OR user metadata role
    const hasDbUser = !!dbUser;
    const hasMetadataRole = !!user.user_metadata?.role;

    if (!hasDbUser && !hasMetadataRole) {
      console.warn("AuthGuard: User authenticated but missing database user and metadata");
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <h2 className="text-lg font-semibold text-destructive">Account Setup Incomplete</h2>
            <p className="text-sm text-muted-foreground">
              Your account setup is incomplete. Please contact your administrator or try logging in
              again.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-primary hover:underline"
            >
              Return to Login
            </button>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has proper setup, render children
  return <>{children}</>;
}

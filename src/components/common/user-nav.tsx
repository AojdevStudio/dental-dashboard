'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User as UserIcon } from 'lucide-react';

import { signOutWithCleanup } from '@/app/auth/actions';

/**
 * UserNav Component
 *
 * Displays the current user's email and provides a dropdown menu with a sign-out button.
 * Uses the useAuth hook for session state and improved signOut logic for complete cleanup.
 *
 * @returns {React.ReactElement | null} The rendered user navigation dropdown, or null if not authenticated.
 */
export function UserNav() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // If still loading auth state, show nothing
  if (isLoading) {
    return null;
  }
  if (!(isAuthenticated && user)) {
    return null;
  }

  /**
   * Handles the sign-out action with complete session cleanup
   */
  const handleSignOut = async () => {
    try {
      // Use server action for proper cleanup
      await signOutWithCleanup();
    } catch (_error) {
      // Even on error, try to redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" class="flex items-center gap-2 px-3 py-2">
          <UserIcon class="h-5 w-5 text-blue-600" />
          <span class="font-medium text-gray-900 text-sm max-w-[120px] truncate">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut} class="text-red-600 focus:bg-red-50">
          <LogOut class="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

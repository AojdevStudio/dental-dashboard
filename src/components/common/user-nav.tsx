"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";

/**
 * UserNav Component
 *
 * Displays the current user's email and provides a dropdown menu with a sign-out button.
 * Uses the useAuth hook for session state and signOut logic.
 *
 * @returns {React.ReactElement | null} The rendered user navigation dropdown, or null if not authenticated.
 */
export function UserNav() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  // If still loading auth state, show nothing
  if (isLoading) return null;
  if (!isAuthenticated || !user) return null;

  /**
   * Handles the sign-out action
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 py-2">
          <UserIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900 text-sm max-w-[120px] truncate">
            {user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50">
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

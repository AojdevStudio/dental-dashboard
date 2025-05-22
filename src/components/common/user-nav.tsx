/**
 * @fileoverview User Navigation Component
 *
 * This file implements the user navigation dropdown component that appears in the
 * application header. It provides user account management options such as profile
 * settings and sign out functionality.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import * as React from "react";

/**
 * User Navigation Component
 *
 * A dropdown menu component for user account management, displayed in the header.
 * Features include:
 * - User avatar and name display
 * - Links to account settings and profile management
 * - Sign out functionality
 *
 * In a production application, this would be connected to an authentication
 * system to display the current user's information and handle sign out.
 *
 * @returns {JSX.Element} The rendered user navigation component
 */
export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="User avatar" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Dr. Smith</p>
            <p className="text-xs leading-none text-muted-foreground">dr.smith@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/clinic">Clinic Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/auth/logout">Sign out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

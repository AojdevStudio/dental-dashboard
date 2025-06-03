"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type UserDropdownProps } from "@/lib/types/layout";
import { cn } from "@/lib/utils";

export function UserDropdown({ user, className }: UserDropdownProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
      });
      
      if (response.ok) {
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return "?";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("relative h-10 w-10 rounded-full", className)}
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {user?.name && (
              <p className="text-sm font-medium leading-none">{user.name}</p>
            )}
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
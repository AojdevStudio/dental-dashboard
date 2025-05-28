"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Inlined Label component definition
const LocalLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    {...props}
  />
));
LocalLabel.displayName = "LocalLabel";

/**
 * Register Form Component
 *
 * A simple registration form for new users to create an account.
 * This component provides basic form fields for user registration.
 *
 * @returns {JSX.Element} The rendered register form
 */
export function RegisterForm() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Enter your information to create a new account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <LocalLabel htmlFor="name">Full Name</LocalLabel>
            <Input id="name" type="text" placeholder="Enter your full name" />
          </div>
          <div className="space-y-2">
            <LocalLabel htmlFor="email">Email</LocalLabel>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <LocalLabel htmlFor="password">Password</LocalLabel>
            <Input id="password" type="password" placeholder="Enter your password" />
          </div>
          <div className="space-y-2">
            <LocalLabel htmlFor="confirmPassword">Confirm Password</LocalLabel>
            <Input id="confirmPassword" type="password" placeholder="Confirm your password" />
          </div>
          <Button className="w-full">Create Account</Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

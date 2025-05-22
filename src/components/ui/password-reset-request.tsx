/**
 * @fileoverview Password Reset Request Component
 * 
 * This file implements the password reset request form component used in the authentication flow.
 * It allows users to request a password reset email by providing their email address.
 * The component handles email validation, form submission to Supabase Auth, and user feedback.
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "./button";
import { Input } from "./input";

/**
 * Password Reset Request Component
 * 
 * A form component that allows users to request a password reset email.
 * Features include:
 * - Email validation
 * - Integration with Supabase Auth for password reset
 * - Loading state during submission
 * - Error and success message display
 * - Link back to sign-in page
 * 
 * The component uses the same visual styling as other authentication components
 * to maintain design consistency across the authentication flow.
 * 
 * @returns {JSX.Element} The rendered password reset request form
 */
export function PasswordResetRequest() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Validates email format using regex
   * 
   * Checks if the provided string matches a basic email format pattern.
   * 
   * @param {string} email - The email address to validate
   * @returns {boolean} True if the email format is valid, false otherwise
   */
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Handles password reset request submission
   * 
   * Validates the email, then sends a password reset request to Supabase Auth.
   * On success, displays a success message. On failure, displays an error message.
   * 
   * @returns {Promise<void>} A promise that resolves when the reset request process completes
   */
  const handleResetRequest = async () => {
    // Clear any previous error or success messages
    setError("");
    setSuccess("");

    // Validate that email is provided
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Set loading state to show UI feedback
    setIsLoading(true);

    try {
      // Get Supabase credentials from environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Validate environment variables are present
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
      }

      // Initialize Supabase client
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

      // Request password reset email from Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Specify where to redirect after clicking the reset link in the email
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
      });

      // Handle any errors from the reset request
      if (resetError) {
        throw resetError;
      }

      // Show success message and clear the email field
      setSuccess("Password reset instructions have been sent to your email.");
      setEmail("");
    } catch (err) {
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to send password reset email");
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  /**
   * Render the password reset request UI with glass-morphism design
   * 
   * The UI consists of:
   * - A main container with dark background
   * - A centered glass card with gradient background
   * - Logo and title section
   * - Email input field with validation
   * - Error and success message display areas
   * - Submit button with loading state
   * - Link back to sign-in page
   * 
   * The design matches other authentication components to maintain
   * visual consistency throughout the authentication flow.
   */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      {/* Centered glass card with gradient background and blur effect */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo in circular container */}
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-6 shadow-lg">
          <img
            src="/logo.svg"
            alt="Unified Dental Dashboard Logo"
            width="64"
            height="64"
            className="w-16 h-16"
          />
        </div>
        {/* Page title */}
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Reset Your Password</h2>
        {/* Reset request form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* Email input field */}
            <Input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {/* Error and success message display areas */}
            {error && <div className="text-sm text-red-400 text-left">{error}</div>}
            {success && <div className="text-sm text-green-400 text-left">{success}</div>}
          </div>
          <hr className="opacity-10" />
          <div>
            {/* Submit button with loading indicator */}
            <Button
              type="button"
              onClick={handleResetRequest}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
            {/* Link back to sign-in page */}
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">
                Remember your password?{" "}
                <a href="/auth/login" className="underline text-white/80 hover:text-white">
                  Sign in
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

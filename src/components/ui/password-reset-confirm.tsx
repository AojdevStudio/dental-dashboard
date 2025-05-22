/**
 * @fileoverview Password Reset Confirmation Component
 *
 * This file implements the password reset confirmation component used in the authentication flow.
 * It allows users to set a new password after clicking a reset link from their email.
 * The component handles token validation, password validation, and the password update process.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";

/**
 * Password Reset Confirmation Component
 *
 * A form component that allows users to set a new password after requesting a reset.
 * Features include:
 * - Token validation from URL query parameters
 * - Password and confirmation validation
 * - Integration with Supabase Auth for password update
 * - Multiple UI states (loading, error, form)
 * - Success feedback and automatic redirect
 *
 * The component handles three main states:
 * 1. Validating - When checking if the reset token is valid
 * 2. Error - When the token is invalid or expired
 * 3. Form - When the token is valid and user can set a new password
 *
 * @returns {JSX.Element} The rendered password reset confirmation form
 */
export function PasswordResetConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [tokenValid, setTokenValid] = React.useState(false);
  const [validating, setValidating] = React.useState(true);

  /**
   * Validate token on component mount
   *
   * This effect runs once when the component mounts to verify that the reset token
   * in the URL is valid by checking the Supabase session. If valid, the form is shown.
   * If invalid, an error message is displayed with an option to request a new link.
   */
  React.useEffect(() => {
    /**
     * Validates the reset token from the URL
     *
     * This function checks if the reset token is valid by:
     * 1. Verifying the token is present in the URL
     * 2. Creating a Supabase client
     * 3. Checking if there's a valid session associated with the token
     * 4. Setting the tokenValid state based on the result
     *
     * If the token is valid, the password reset form will be displayed.
     * If invalid, an error message will be shown with an option to request a new link.
     *
     * @returns {Promise<void>} A promise that resolves when token validation completes
     */
    const validateToken = async () => {
      // If no token is present in the URL, show the error state
      if (!token) {
        setValidating(false);
        return;
      }

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

        // Verify the token is valid by checking the session
        const { data, error } = await supabase.auth.getSession();

        // If no session or error, the token is invalid
        if (error || !data.session) {
          throw new Error("Invalid or expired reset token");
        }

        // Token is valid, show the password reset form
        setTokenValid(true);
      } catch (err) {
        // Display user-friendly error message
        setError(err instanceof Error ? err.message : "Invalid reset token");
      } finally {
        // End the validating state regardless of outcome
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  /**
   * Handles password reset submission
   *
   * This function processes the password reset form by:
   * 1. Validating the token is still valid
   * 2. Validating the password fields (presence, length, match)
   * 3. Updating the user's password via Supabase Auth
   * 4. Showing success message and redirecting to login
   *
   * Validation checks include:
   * - Token validity
   * - Required fields
   * - Password minimum length (8 characters)
   * - Password and confirmation match
   *
   * On success, the user is automatically redirected to the login page after a brief delay.
   *
   * @returns {Promise<void>} A promise that resolves when the password reset process completes
   */
  const handleResetPassword = async () => {
    // Clear any previous error or success messages
    setError("");
    setSuccess("");

    // Verify token is still valid
    if (!token || !tokenValid) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    // Validate required fields
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
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

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      // Handle any errors from the update
      if (updateError) {
        throw updateError;
      }

      // Show success message and clear form fields
      setSuccess("Password has been reset successfully.");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  /**
   * Render loading state while validating token
   *
   * This UI is shown while the component is validating the reset token.
   * It displays a loading spinner and a message indicating that validation
   * is in progress. This prevents users from attempting to reset their
   * password before we know if their token is valid.
   *
   * @returns {JSX.Element} Loading state UI
   */
  if (validating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
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
          {/* Loading state title */}
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Validating Reset Link
          </h2>
          {/* Loading spinner */}
          <div className="flex justify-center items-center p-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state if token is invalid or missing
   *
   * This UI is shown when the reset token is invalid, expired, or missing.
   * It displays an error message explaining the issue and provides a button
   * to request a new password reset link, directing the user back to the
   * password reset request page.
   *
   * This state helps users understand what went wrong and provides a clear
   * path to resolve the issue without requiring technical knowledge.
   *
   * @returns {JSX.Element} Error state UI
   */
  if (!validating && (!token || !tokenValid)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
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
          {/* Error state title */}
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Invalid Reset Link</h2>
          {/* Error message and instructions */}
          <div className="text-center mb-6">
            <p className="text-red-400 mb-4">
              {error || "Your password reset link is invalid or has expired."}
            </p>
            <p className="text-gray-300">Please request a new password reset link.</p>
          </div>
          {/* Button to request new reset link */}
          <Button
            type="button"
            onClick={() => router.push("/auth/reset-password")}
            className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Render password reset form if token is valid
   *
   * This is the main UI of the component, shown when the reset token is valid.
   * It displays a form allowing the user to enter and confirm a new password.
   * The form includes:
   * - Password input field
   * - Password confirmation field
   * - Error message display
   * - Success message display
   * - Submit button with loading state
   *
   * After successful password reset, a success message is shown and the user
   * is automatically redirected to the login page after a brief delay.
   *
   * @returns {JSX.Element} Password reset form UI
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
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Create New Password</h2>
        {/* Password reset form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* New password input field */}
            <Input
              placeholder="New Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {/* Confirm password input field */}
            <Input
              placeholder="Confirm New Password"
              type="password"
              value={confirmPassword}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              onClick={handleResetPassword}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @fileoverview Modern Stunning Sign Up Component
 *
 * This file implements a visually enhanced sign-up component with a modern UI design.
 * It provides email/password registration and Google OAuth sign-up options using Supabase Auth.
 * The component includes client-side form validation, terms acceptance, loading states, and error handling.
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import * as React from "react";

/**
 * Modern Stunning Sign Up Component
 *
 * A visually enhanced registration component that provides:
 * - Email/password account creation
 * - Google OAuth sign-up
 * - Password confirmation validation
 * - Terms and conditions acceptance
 * - Client-side form validation
 * - Loading states during registration
 * - Error handling and user feedback
 *
 * The component uses a dark theme with glass-morphism effects and gradient backgrounds
 * to create a modern, visually appealing registration experience.
 *
 * @returns {JSX.Element} The rendered sign-up component
 */
const ModernStunningSignUp = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [error, setError] = React.useState("");
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
   * Handles email/password sign-up
   *
   * Validates form inputs, then attempts to register the user with Supabase Auth.
   * Validation includes:
   * - All fields are filled
   * - Email format is valid
   * - Password meets minimum length requirement
   * - Passwords match
   * - Terms and conditions are accepted
   *
   * On success, redirects to the login page with a success message.
   * On failure, displays an error message.
   *
   * @returns {Promise<void>} A promise that resolves when the registration process completes
   */
  const handleSignUp = async () => {
    setError("");
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }
    setIsLoading(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
      }
      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        throw signUpError;
      }
      router.refresh();
      router.push("/auth/login?signupSuccess=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign-up
   *
   * Initiates the OAuth flow with Google as the provider using Supabase Auth.
   * On success, the user will be redirected to the callback URL and then to the dashboard.
   * On failure, displays an error message.
   *
   * This method doesn't require email/password validation or terms acceptance as
   * these are handled within the Google OAuth flow.
   *
   * @returns {Promise<void>} A promise that resolves when the OAuth process initiates
   */
  const handleGoogleSignUp = async () => {
    // Clear any previous errors
    setError("");
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

      // Initiate OAuth sign-up with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
      // Note: No redirect here as OAuth flow handles the redirect automatically
    } catch (err) {
      // Display user-friendly error message
      setError(err instanceof Error ? err.message : "Failed to sign up with Google");
    }
  };

  /**
   * Render the sign-up UI with glass-morphism design
   *
   * The UI consists of:
   * - A main container with dark background
   * - A centered glass card with gradient background
   * - Logo and title section
   * - Form inputs for email, password, and password confirmation
   * - Terms and conditions checkbox
   * - Sign-up button with loading state
   * - Google OAuth sign-up button
   * - Link to sign in page
   * - User testimonial section with avatars
   *
   * The design uses modern UI principles including:
   * - Glass-morphism effects (transparency and blur)
   * - Gradient backgrounds
   * - Rounded corners and subtle shadows
   * - Loading animations
   * - Hover effects for interactive elements
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
        {/* Application title */}
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Create Your Account</h2>
        {/* Registration form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* Email input field */}
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {/* Password input field */}
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {/* Password confirmation field */}
            <input
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {/* Terms and conditions acceptance checkbox */}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded bg-white/10 text-blue-500 focus:ring-gray-400"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-xs text-gray-300">
                I accept the{" "}
                <a href="/terms" className="text-white hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-white hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {/* Error message display */}
            {error && <div className="text-sm text-red-400 text-left">{error}</div>}
          </div>
          <hr className="opacity-10" />
          <div>
            {/* Email/Password sign-up button with loading indicator */}
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
            {/* Google OAuth sign-up button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#232526] to-[#2d2e30] rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition mb-2 text-sm"
              disabled={isLoading}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            {/* Sign in link for existing users */}
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">
                Already have an account?{" "}
                <a href="/auth/login" className="underline text-white/80 hover:text-white">
                  Sign in
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* User testimonial section with avatars */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm mb-2">
          Join <span className="font-medium text-white">thousands</span> of dental practices already
          using our dashboard.
        </p>
        {/* User avatars to create social proof */}
        <div className="flex">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Dr. John Smith"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Dr. Emily Brown"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/men/54.jpg"
            alt="Dr. Michael Chen"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
          <img
            src="https://randomuser.me/api/portraits/women/68.jpg"
            alt="Dr. Sarah Wilson"
            className="w-8 h-8 rounded-full border-2 border-[#181824] object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export { ModernStunningSignUp };

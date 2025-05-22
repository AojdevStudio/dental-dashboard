/**
 * @fileoverview Modern Stunning Sign In Component
 * 
 * This file implements a visually enhanced sign-in component with a modern UI design.
 * It provides email/password authentication and Google OAuth sign-in options using Supabase Auth.
 * The component includes client-side form validation, loading states, and error handling.
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Modern Stunning Sign In Component
 * 
 * A visually enhanced authentication component that provides:
 * - Email/password authentication
 * - Google OAuth sign-in
 * - Client-side form validation
 * - Loading states during authentication
 * - Error handling and user feedback
 * - Links to sign up and password reset
 * 
 * The component uses a dark theme with glass-morphism effects and gradient backgrounds
 * to create a modern, visually appealing authentication experience.
 * 
 * @returns {JSX.Element} The rendered sign-in component
 */
const SignIn1 = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
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
   * Handles email/password sign-in
   * 
   * Validates form inputs, then attempts to authenticate the user with Supabase Auth.
   * On success, redirects to the dashboard. On failure, displays an error message.
   * 
   * @returns {Promise<void>} A promise that resolves when the authentication process completes
   */
  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase environment variables");
      }

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign-in
   * 
   * Initiates the OAuth flow with Google as the provider using Supabase Auth.
   * On success, the user will be redirected to the callback URL and then to the dashboard.
   * On failure, displays an error message.
   * 
   * @returns {Promise<void>} A promise that resolves when the OAuth process initiates
   */
  const handleGoogleSignIn = async () => {
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

      // Initiate OAuth sign-in with Google
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
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
    }
  };

  /**
   * Render the sign-in UI with glass-morphism design
   * 
   * The UI consists of:
   * - A main container with dark background
   * - A centered glass card with gradient background
   * - Logo and title section
   * - Form inputs for email and password
   * - Sign-in button with loading state
   * - Google OAuth sign-in button
   * - Links to sign up and password reset
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
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm  shadow-2xl p-8 flex flex-col items-center">
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
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Unified Dental Dashboard
        </h2>
        {/* Authentication form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {/* Email input field */}
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl  bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {/* Password input field */}
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl  bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {/* Error message display */}
            {error && <div className="text-sm text-red-400 text-left">{error}</div>}
          </div>
          <hr className="opacity-10" />
          <div>
            {/* Email/Password sign-in button with loading indicator */}
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full bg-white/10 text-white font-medium px-5 py-3 rounded-full shadow hover:bg-white/20 transition mb-3 text-sm relative"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                "Sign in"
              )}
            </button>
            {/* Google OAuth sign-in button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
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
            {/* Sign up and password reset links */}
            <div className="w-full text-center mt-2">
              <span className="text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <a href="/auth/signup" className="underline text-white/80 hover:text-white">
                  Sign up, it&apos;s free!
                </a>
              </span>
              <div className="mt-2">
                <a href="/auth/reset-password" className="text-xs text-gray-400 hover:text-white">
                  Forgot your password?
                </a>
              </div>
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

export { SignIn1 };

/**
 * Login Page
 *
 * This page serves as the main authentication entry point for users to sign in to the application.
 * It uses a pre-built SignIn component that provides a modern, visually appealing login interface
 * with support for email/password authentication.
 *
 * The page is server-rendered and includes metadata for SEO and browser tab information.
 * It works in conjunction with other authentication-related pages and components to
 * provide a complete authentication flow.
 */

import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";
import type { Metadata } from "next";

/**
 * Metadata for the login page
 * Defines the page title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

/**
 * Login Page Component
 *
 * Renders the main authentication page using a pre-built SignIn component
 * that handles the login form, validation, and submission process.
 *
 * @returns {JSX.Element} The rendered login page with the SignIn component
 */
export default function LoginPage() {
  return <SignIn1 />;
}

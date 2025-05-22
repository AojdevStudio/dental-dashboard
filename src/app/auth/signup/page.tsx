/**
 * Sign Up Page
 * 
 * This page serves as the registration entry point for new users to create an account.
 * It uses a pre-built ModernStunningSignUp component that provides a visually appealing
 * and user-friendly registration interface with form validation and submission handling.
 * 
 * The page is server-rendered and includes metadata for SEO and browser tab information.
 * It works in conjunction with other authentication-related pages and components to
 * provide a complete user registration flow, including email verification.
 */

import type { Metadata } from "next";
import { ModernStunningSignUp } from "@/components/ui/modern-stunning-sign-up";

/**
 * Metadata for the sign up page
 * Defines the page title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

/**
 * Sign Up Page Component
 * 
 * Renders the registration page using a pre-built ModernStunningSignUp component
 * that handles the registration form, validation, and submission process.
 * 
 * The component manages:
 * - Form input validation
 * - Password strength requirements
 * - Email verification process initiation
 * - Error handling and user feedback
 * 
 * @returns {JSX.Element} The rendered sign up page with the ModernStunningSignUp component
 */
export default function SignUpPage() {
  return <ModernStunningSignUp />;
}

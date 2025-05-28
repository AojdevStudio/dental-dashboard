/**
 * Reset Password Confirmation Page
 *
 * This page is the second step in the password reset flow, allowing users to set a new password
 * after clicking on the reset link sent to their email. It validates the reset token from the URL
 * and provides a form for the user to create and confirm a new password.
 *
 * The page is accessed via a unique URL that includes a secure token, typically in the format:
 * /auth/reset-password/confirm?token=[reset_token]
 *
 * This page completes the password reset flow that begins with the reset-password request page.
 */

import { PasswordResetConfirm } from "@/components/auth/password-reset-confirm";
import type { Metadata } from "next";

/**
 * Metadata for the reset password confirmation page
 * Defines the page title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: "Reset Password Confirmation | Unified Dental Dashboard",
  description: "Create a new password for your Unified Dental Dashboard account",
};

/**
 * Reset Password Confirmation Page Component
 *
 * Renders the form for setting a new password using a pre-built component
 * that handles token validation, password requirements, and form submission.
 *
 * The component manages:
 * - Validating the reset token from the URL
 * - Password strength and confirmation validation
 * - Submitting the new password to the API
 * - Success/error state handling and user feedback
 * - Redirection after successful password reset
 *
 * @returns {JSX.Element} The rendered password reset confirmation page
 */
export default function ResetPasswordConfirmPage() {
  return <PasswordResetConfirm />;
}

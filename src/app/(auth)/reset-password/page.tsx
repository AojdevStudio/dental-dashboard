/**
 * Reset Password Page
 *
 * This page provides the interface for users to request a password reset.
 * It's part of the authentication flow that allows users who have forgotten
 * their passwords to regain access to their accounts through a secure reset process.
 *
 * The page uses a pre-built PasswordResetRequest component that handles:
 * - Email input validation
 * - Submission to the reset password API
 * - Success/error state management
 * - User feedback during the process
 */

import { PasswordResetRequest } from '@/components/auth/password-reset-request';
import type { Metadata } from 'next';
import type React from 'react';

/**
 * Metadata for the reset password page
 * Defines the page title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: 'Reset Password | Unified Dental Dashboard',
  description: 'Reset your password for the Unified Dental Dashboard',
};

/**
 * Reset Password Page Component
 *
 * Renders the password reset request form using a pre-built component
 * that handles the form submission and validation process.
 *
 * When a user submits their email, the system will send a password reset link
 * to that email if it's associated with a valid account.
 *
 * @returns {React.ReactElement} The rendered password reset request page
 */
export default function ResetPasswordPage(): React.ReactElement {
  return <PasswordResetRequest />;
}

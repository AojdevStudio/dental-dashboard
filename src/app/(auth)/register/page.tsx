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

import { RegisterFormComprehensive } from '@/components/auth/register-form-comprehensive';
import type { Metadata } from 'next';

/**
 * Metadata for the sign up page
 * Defines the page title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: 'Sign Up - Dental Analytics Dashboard',
  description: 'Create your account and set up your dental practice',
};

/**
 * Sign Up Page Component
 *
 * Renders the comprehensive registration page that collects:
 * - User account information
 * - Role selection
 * - Clinic association (join existing or create new)
 * - Provider-specific information for dentists
 * - Terms and privacy acceptance
 *
 * The multi-step form ensures proper data collection for multi-tenant
 * setup and role-based access control.
 *
 * @returns {JSX.Element} The rendered sign up page with comprehensive registration
 */
export default function SignUpPage() {
  return <RegisterFormComprehensive />;
}

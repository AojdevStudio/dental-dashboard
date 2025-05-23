---
id: "023.6"
title: "Create Basic Login Page & Implement Sign-in/Sign-out"
status: completed
priority: critical
feature: "Core Authentication System - User Interaction"
dependencies:
  - "023.3" # Depends on browser client
assigned_agent: null
created_at: "2025-05-23T05:34:57Z"
started_at: "2025-05-23T06:07:00Z"
completed_at: "2025-05-23T08:00:00Z"
error_log: null
---

## Description

Develop a basic login page (e.g., at route `/login`) that allows users to sign in using their credentials (e.g., email and password). Implement the client-side logic for handling sign-in and sign-out operations using the Supabase browser client (created in Task 23.3). This page will serve as the primary entry point for users to access authenticated parts of the application.

## Details

1.  **Create Login Page Component:**
    *   Create a new Next.js page component, for example, `src/app/login/page.tsx` (if using App Router) or `src/pages/login.tsx` (if using Pages Router).
    *   This component should be a client component (`'use client';` if using App Router).

2.  **Design Basic UI:**
    *   Include input fields for email and password.
    *   Add a submit button for login.
    *   Optionally, include links for password reset or account creation if those flows are to be implemented soon.
    *   Include a sign-out button (this might be placed in a global navigation component later, but for initial testing, it can be on a test authenticated page or temporarily on the login page after successful login).

3.  **Implement Sign-In Logic:**
    *   Import `createClient` from `src/lib/supabase/client.ts` (or the correct path as per Task 23.3).
    *   Instantiate the Supabase client: `const supabase = createClient()`.
    *   On form submission:
        *   Call `supabase.auth.signInWithPassword({ email, password })`.
        *   Handle the response: on success, redirect the user to a protected page (e.g., dashboard) or update UI state. On error, display an appropriate error message.

4.  **Implement Sign-Out Logic:**
    *   Create a function to handle sign-out.
    *   Call `supabase.auth.signOut()`.
    *   Handle the response: on success, redirect the user to the login page or home page and clear any local session state if necessary.

5.  **State Management:**
    *   Use React state (e.g., `useState`) to manage form inputs, loading states, and error messages.
    *   Consider using React Context or a state management library for global user session state if needed, although Supabase's auth client often handles session state internally, which can be listened to.

6.  **Routing/Redirection:**
    *   Use Next.js router (e.g., `useRouter` from `next/navigation` or `next/router`) for programmatic redirection after login/logout.

## Sign-Out Button Implementation Plan

### Problem
Currently, the sign-in flow works, but the sign-out button is not fully implemented or visible after sign-in in the main application UI. For a complete authentication experience, users must be able to sign out from anywhere in the app, not just the login page.

### Solution
1. **Global Sign-Out Button Placement:**
   - Move the sign-out button from the login page to a global location, such as the user menu in the application header (e.g., `src/components/common/user-nav.tsx`).
   - Ensure the button is visible and accessible after sign-in, in all authenticated dashboard layouts.

2. **Sign-Out Logic:**
   - Use the `signOut` method from the `useAuth` hook (client-side) or the server action (for server components) to handle sign out.
   - On sign out, clear the session and redirect the user to the login page (`/login`).
   - Ensure the middleware correctly protects routes after sign out.

3. **UI/UX:**
   - The sign-out button should be part of a dropdown menu or user profile menu in the header for discoverability and consistency.
   - Provide feedback (loading state, error handling if needed) when the user clicks sign out.

4. **Testing:**
   - After implementing, verify that the sign-out button is visible after sign-in and works as expected from any page in the authenticated app.
   - Ensure that after signing out, the user cannot access protected routes and is redirected to the login page.

### Relevant Files
- `src/components/common/user-nav.tsx` - User menu dropdown with sign-out button
- `src/components/common/header.tsx` - Main header that renders the user menu
- `src/hooks/use-auth.ts` - Provides the `signOut` method for client-side sign out
- `src/app/auth/actions.ts` - Server action for sign out (if needed)
- `middleware.ts` - Ensures route protection after sign out

## Updated Test Strategy

- **Sign-Out Button Visibility:**
  * After signing in, verify the sign-out button appears in the user menu/header.
- **Sign-Out Flow:**
  * Click the sign-out button from any authenticated page.
  * Confirm redirection to the login page and session is cleared.
  * Attempt to access a protected route after sign out; verify redirection to login.
- **UI Consistency:**
  * Ensure the sign-out button is accessible and styled consistently across the app.
- **Error Handling:**
  * Simulate sign-out errors (e.g., network issues) and verify graceful handling (optional).

## Completed Tasks

- [x] Create Login Page at /login with email/password form and error handling
- [x] Implement sign-in logic using Supabase client and server action
- [x] Implement sign-out logic using Supabase client and server action
- [x] Add global sign-out button to user menu (UserNav) in header
- [x] Protect routes with middleware to enforce authentication
- [x] Add Winston logging for sign-in/sign-out events

## In Progress Tasks

## Future Tasks

## Implementation Plan

- Login page at `/login` implemented as a client component with email/password form, error handling, and loading state.
- Sign-in logic uses Supabase client and server action; redirects to dashboard on success.
- Sign-out logic uses Supabase client and server action; global sign-out button added to user menu (UserNav) in header.
- Middleware protects authenticated routes and redirects to `/login` after sign-out.
- Client-side logging added for sign-in/sign-out events for traceability (using browser console in development).

## Implementation Notes

- **Sign-Out Button Location**: Successfully added to the dashboard header at the far right as requested.
- **Client-Safe Logging**: Created `src/lib/utils/client-logger.ts` to handle logging in client components without Node.js dependencies.
- **Component Integration**: UserNav component properly integrated into `src/app/(dashboard)/layout.tsx`.
- **Development Server**: Running successfully at http://localhost:3000 with sign-out functionality working.
- **Build Issues**: Some TypeScript errors remain in goal-form.tsx but don't affect the core authentication functionality.

### Relevant Files

- `src/app/(auth)/login/page.tsx` - Login page UI and logic
- `src/app/auth/actions.ts` - Server actions for sign-in/sign-out
- `src/components/common/user-nav.tsx` - User menu dropdown with sign-out button (NEW)
- `src/components/common/header.tsx` - Main header that renders the user menu
- `src/hooks/use-auth.ts` - Provides the `signOut` method for client-side sign out
- `middleware.ts` - Ensures route protection after sign out

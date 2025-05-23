---
id: "023.2"
title: "Configure Supabase Environment Variables"
status: pending
priority: critical
feature: "Core Authentication System - Setup"
dependencies:
  - "023"
assigned_agent: null
created_at: "2025-05-23T05:34:57Z"
started_at: null
completed_at: null
error_log: null
---

## Description

Set up and verify the necessary Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) required for the Supabase client to connect to your Supabase project. These variables must be accessible to both client-side and server-side code in the Next.js application.

## Details

1.  **Locate Supabase Project Details:**
    *   Navigate to your Supabase project dashboard (app.supabase.com).
    *   Go to Project Settings > API.
    *   Find your Project URL (`NEXT_PUBLIC_SUPABASE_URL`).
    *   Find your Project API Key (anon public) (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

2.  **Create/Update `.env.local`:**
    *   In the root of your Next.js project, create a file named `.env.local` if it doesn't already exist.
    *   Add the Supabase URL and Anon Key to this file:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with the actual values from your Supabase project.

3.  **Ensure `.env.local` is in `.gitignore`:**
    *   Verify that `.env.local` is listed in your project's `.gitignore` file to prevent committing sensitive credentials to version control.

4.  **Accessing Variables in Code:**
    *   These variables will be automatically loaded by Next.js and accessible via `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   Remember that `NEXT_PUBLIC_` prefix makes them available in the browser. For server-side only variables (not the case here for these two), you would omit the prefix.

## Test Strategy

-   **Restart Development Server:** After adding/updating `.env.local`, restart your Next.js development server (`pnpm dev`) for the changes to take effect.
-   **Verify Client Initialization (Conceptual):** In a subsequent task where the Supabase client is initialized (e.g., Task 23.3), ensure that the client initializes successfully using these environment variables. Errors during client initialization often point to incorrect or missing environment variables.
-   **Console Log (Development Only & Securely):** As a temporary debugging step *during development only*, you could briefly log `process.env.NEXT_PUBLIC_SUPABASE_URL` in a server-side component or `getStaticProps/getServerSideProps` to ensure it's loaded. Remove such logs before committing.
-   **Check Application Behavior:** The ultimate test is the successful operation of Supabase client functions (authentication, data fetching) in later tasks.

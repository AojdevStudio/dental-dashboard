---
id: "023.3"
title: "Implement Supabase Browser Client Utility"
status: done
priority: critical
feature: "Core Authentication System - Client Setup"
dependencies:
  - "023.1"
  - "023.2"
assigned_agent: null
created_at: "2025-05-23T05:34:57Z"
started_at: "2025-05-23T06:01:00Z"
completed_at: "2025-05-23T06:02:00Z"
updated_at: "2025-05-23T06:02:00Z"
error_log: null
---

## Description

Create or update the Supabase browser client utility function. This function will use `createBrowserClient` from the `@supabase/ssr` package to instantiate a Supabase client suitable for use in browser environments (client components, client-side scripts). The implementation must strictly adhere to the pattern specified in the project's Supabase authentication guidelines ([supabase-auth-setup.md](mdc:.windsurf/rules/.stack/supabase-auth-setup.md)).

## Details

1.  **Determine File Location:**
    *   The client utility should likely reside in a path like `src/lib/supabase/client.ts` or `src/lib/auth/client.ts`. If an existing file like `src/lib/auth/config.ts` is intended for this, it will be refactored/updated.
    *   For this task, let's assume we will create/use `src/lib/supabase/client.ts`.

2.  **Implement `createClient()` function:**
    *   The file `src/lib/supabase/client.ts` should contain the following code, as per `supabase-auth-setup.md`:
        ```typescript
        import { createBrowserClient } from '@supabase/ssr'

        export function createClient() {
          return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
        }
        ```

3.  **Ensure Environment Variables are Used:**
    *   The implementation must use `process.env.NEXT_PUBLIC_SUPABASE_URL!` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` for the Supabase URL and anon key, respectively. The `!` (non-null assertion operator) is used because these variables are expected to be defined.

4.  **Export the function:** The `createClient` function must be exported so it can be imported and used in client components throughout the application.

## Test Strategy

-   **File Creation & Code Correctness:** Verify that `src/lib/supabase/client.ts` is created with the exact code specified.
-   **Type Checking:** Ensure the TypeScript code compiles without errors (`pnpm typecheck`).
-   **Import Test:** In a client component (e.g., a login page component developed in a later task), import `createClient` from `src/lib/supabase/client.ts` and attempt to instantiate it. `const supabase = createClient()`.
-   **Successful Initialization:** The client should initialize without throwing errors (assuming environment variables from Task 23.2 are correctly set up and the dev server has been restarted).
-   **Basic Client Interaction (Later Tasks):** Full verification will occur in subsequent tasks when this client is used for actual Supabase operations (e.g., `supabase.auth.signInWithPassword()`). For this task, successful instantiation is the primary check.

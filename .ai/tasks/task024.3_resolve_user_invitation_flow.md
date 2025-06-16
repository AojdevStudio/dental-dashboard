---
id: '024.3'
title: Resolve User Invitation Flow with Supabase Auth
status: pending
created_at: '2025-05-31T14:33:53-05:00'
updated_at: '2025-05-31T14:33:53-05:00'
parent_task: '024'
priority: high
description: Clarify, design, or implement the Supabase Auth user invitation flow.
---

## Description

The current `POST /api/users` endpoint only creates user records in the application database and does not trigger Supabase Auth email invitations. This task is to fully address the user invitation lifecycle.

## Details

1.  **Investigate:** Determine the intended or current manual process for Supabase Auth user creation and invitation.
2.  **Clarify Requirements:** Define how user invitations should ideally work (e.g., triggered by clinic admin via UI, automatic upon local user record creation).
3.  **Design/Implement (if necessary):** 
    *   Propose a solution, which might involve a new API endpoint (e.g., `/api/users/invite`), a server action, or modifications to the existing user creation flow.
    *   The solution should use Supabase Admin SDK's `inviteUserByEmail()` function.
    *   Ensure proper authentication and authorization for triggering invitations.
4.  **Document:** Update `PROJECT_OVERVIEW.md` and any relevant JSDoc comments with the finalized user invitation process.

## Test Strategy

-   If implemented, test the invitation flow end-to-end.
-   Verify that invited users can successfully sign up and access the application with appropriate roles.
-   Ensure documentation accurately reflects the implemented flow.

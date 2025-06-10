# Supabase Sync Permission Issue Resolution (Dentist & Hygiene)

## 1. Initial Problem Symptoms

- Google Apps Script sync for `dentist_production` table was processing 0 rows.
- Google Apps Script sync for `hygiene_production` table was also failing to sync (presumed similar cause).

## 2. Investigation & Error Discovery

- Initial debugging of the Apps Script column mapping (`mapping.gs`) did not immediately solve the "0 rows processed" for the dentist sync.
- The Supabase upsert logic in the dentist sync script (`sync.gs`) was identified as overly complex, potentially masking underlying errors. It involved multiple fallbacks:
    - Attempt to use a `DASHBOARD_API_URL`.
    - If failed, direct Supabase batch upsert with multiple `Prefer` header strategies.
    - If batch failed with specific errors, attempt individual record upserts.
- The upsert logic in `sync.gs` was simplified to use a direct batch `POST` request to the Supabase table endpoint with the `Prefer: resolution=merge-duplicates` header. This change was made to clarify the direct interaction with Supabase.
- After this simplification, a clear error message emerged from the Apps Script logs:
    `Supabase upsert failed. Code: 403. Response: {"code":"42501","details":null,"hint":null,"message":"permission denied for schema public"}`

## 3. Root Cause Analysis

- The error code `42501` and message "permission denied for schema public" indicated that the database role used by the Apps Script (intended to be `service_role` via the provided API key) lacked necessary privileges on the `public` schema or the target tables (`dentist_production`, `hygiene_production`) within it.
- Using Supabase diagnostic tools, the grants on the `dentist_production` table were inspected:
    ```sql
    SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public' AND table_name = 'dentist_production';
    ```
- **Key Finding**: Only the `postgres` role had explicit `SELECT, INSERT, UPDATE, DELETE` grants on `public.dentist_production`. The `service_role` had no direct grants listed for this table.
- This meant that even if the Apps Script used the `service_role` key, Supabase's PostgREST API layer (which handles REST API calls) was denying the operation due to insufficient explicit permissions for `service_role` on the table/schema.

### Why the permission issue might have occurred:

- **Altered Default Privileges**: Default privileges for the `public` schema or for new tables might have been changed from Supabase defaults.
- **ORM Migrations (Prisma)**: Migrations managed by Prisma (the project's ORM) could have set up table permissions without automatically including `service_role` with all necessary operational rights.
- **Inconsistent Application of Least Privilege**: Previous attempts to secure the database might have overly restricted `service_role`.

### Why the error appeared after simplifying upsert logic:

The previous complex upsert logic likely masked the 403 permission error:
- Failures in earlier stages (e.g., Dashboard API call) might have prevented the script from reaching the direct Supabase call that would trigger the permission error.
- Different batch strategies or error handling within the complex logic might not have clearly reported the specific 42501 error, leading to a more generic "0 rows processed" symptom.
- The simplified logic created a direct path to the database permission check, unmasking the core issue.

## 4. The Fix: Granting Explicit Permissions

To resolve the permission denial, the following SQL commands were executed for both tables, granting the necessary privileges to the `service_role`:

**For `dentist_production` table:**
```sql
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dentist_production TO service_role;
```

**For `hygiene_production` table:**
```sql
GRANT USAGE ON SCHEMA public TO service_role; -- This might be redundant if already applied for dentist_production, but is safe to re-apply.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hygiene_production TO service_role;
```

These commands ensure that the `service_role` (when used via the API key in Google Apps Script) has:
- The right to *use* the `public` schema.
- The rights to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` data from the specified tables.

## 5. Outcome

- After applying these grants, the Google Apps Script sync for the `dentist_production` table successfully processed rows.
- The same fix was proactively applied to the `hygiene_production` table to address its similar syncing issues.

## 6. Key Takeaways

- Explicit permissions are crucial, even for powerful roles like `service_role`, when interacting with Supabase via its PostgREST API, especially if default privileges might have been modified.
- Overly complex error handling or operational logic can sometimes mask underlying root causes. Simplifying the process can be a key debugging step.
- When encountering "permission denied" errors with Supabase, directly inspect `information_schema.role_table_grants` and `information_schema.schema_privileges` for the relevant roles, tables, and schemas. 
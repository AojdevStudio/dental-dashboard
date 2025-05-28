---
id: 15
title: "Document Supabase schema files"
status: done
priority: high
feature: Documentation
created_at: 2025-05-21T21:15:10Z
updated_at: 2025-05-22T02:08:02Z
---

## Description

Add proper documentation to all Supabase schema SQL files. These files define the database structure, row-level security policies, and storage configuration for the application.

## Files to Document

- `/supabase/schema/auth.sql`
- `/supabase/schema/rls.sql`
- `/supabase/schema/storage.sql`

## Documentation Requirements

Each SQL file should follow a consistent documentation format:

1. For schema files:
   - File-level documentation explaining the overall purpose and structure
   - Section-level comments explaining groups of related tables or functions
   - Table-level comments explaining the purpose and relationships of each table
   - Column-level comments explaining data types, constraints, and business rules

2. For RLS policy files:
   - Document each policy's purpose and security implications
   - Document the conditions under which operations are allowed
   - Document any complex expressions or functions used in policies

3. For functions and triggers:
   - Document parameters and return values
   - Document side effects and state changes
   - Document any transaction requirements

## Example

```sql
-- Authentication Schema
-- 
-- This file defines tables and functions related to user authentication,
-- including custom user profiles, additional auth metadata, and
-- authorization roles.

-- User Profiles Table
-- Stores extended user information beyond the auth.users defaults
-- Linked to auth.users via one-to-one relationship
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- User's displayed full name
    full_name text,
    -- User's preferred contact email (may differ from auth email)
    contact_email text UNIQUE,
    -- User's role in the system (admin, provider, staff, etc.)
    role text NOT NULL DEFAULT 'user',
    -- When the profile was created
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    -- When the profile was last updated
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Row Level Security for Profiles
-- Ensures users can only read/write their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own profile
-- Admin users can read all profiles (via separate policy)
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
```

## Dependencies

None

## Related Tasks

None

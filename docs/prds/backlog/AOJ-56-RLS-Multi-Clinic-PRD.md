# PRD: Implement Row Level Security (RLS) Policies for Multi-Clinic Access

## Summary

This document outlines the requirements for implementing clinic-based data isolation using Row Level Security (RLS) policies in the Dental Dashboard application. The primary goal is to ensure that users can only access data relevant to their assigned clinic(s) and defined roles, enhancing data security and supporting a multi-clinic architecture. This addresses issue AOJ-56, which highlights the current lack of RLS policies despite business requirements for data segregation between KamDental Baytown (clinic_id: `cmbk373hc0000i2uk8pel5elu`) and KamDental Humble (clinic_id: `cmbk373qi0001i2ukewr01bvz`).

## Priority & Timeline Assessment

*   **Priority**: **High**
    *   *Justification*: This is a core security feature critical for data integrity, compliance, and enabling the multi-clinic operational model. It directly impacts user trust and the system's ability to scale to multiple independent clinic entities.
*   **Estimated Timeline**: **1-2 Weeks**
    *   *Justification*: Based on the complexity of defining multiple roles, implementing RLS policies across numerous tables, thorough testing, and documentation, this is a significant undertaking. While the "High" priority suggests a quick turnaround (2-3 days per XML fast-shipping standards), the inherent complexity of RLS implementation necessitates a more conservative estimate.

## User Stories

*   **As an Office Manager, I want to access all data (patient records, appointments, financials, provider performance) for my assigned clinic(s) only, so that I can manage clinic operations effectively without seeing data from other clinics.**
*   **As a Dentist, I want to access and manage my own patient data, appointments, and treatment plans, and view limited operational data (e.g., schedules) for other providers within my assigned clinic(s) only, so that I can perform my duties while respecting data boundaries.**
*   **As a Hygienist, I want to access and manage my own patient data, appointments, and treatment notes, and view limited operational data for other providers within my assigned clinic(s) only, so that I can perform my duties efficiently and securely.**
*   **As a Front Desk staff member, I want to access basic provider information and schedules for my assigned clinic(s) only, so that I can manage appointments and patient flow without accessing sensitive clinical or financial data.**
*   **As a System Administrator (implicit), I want RLS policies to be robust and auditable, so that I can ensure data security and compliance across the platform.**

## Functional Expectations

1.  **User Role Definition**:
    *   The system must support the following user roles with distinct permission sets:
        *   `office_manager`: Full CRUD access to all data pertaining to their assigned clinic(s).
        *   `dentist`: CRUD access to their own data (patients they are primary for, their appointments). Read access to other providers' schedules within their clinic. Limited view of overall clinic performance metrics.
        *   `hygienist`: Similar to `dentist`, focused on their patients and appointments.
        *   `front_desk`: Read access to provider schedules and appointment booking functionalities for their clinic. No access to detailed patient clinical or financial data beyond what's necessary for scheduling.
2.  **Clinic-Based Data Isolation**:
    *   RLS policies must enforce strict data separation based on `clinic_id`.
    *   Users must only be able to view, create, edit, or delete data associated with the clinic(s) they are explicitly assigned to via the `user_clinic_roles` table.
3.  **Provider-Specific Data Access**:
    *   For roles like `dentist` and `hygienist`, RLS policies must further restrict access to data they "own" or are directly involved with (e.g., their own patients, their scheduled appointments).
4.  **`user_clinic_roles` Table Integration**:
    *   The existing `user_clinic_roles` table must be utilized to map users to their roles and assigned clinics. This table will be central to RLS policy logic.
    *   Ensure mechanisms are in place to manage entries in this table (e.g., when a user is added or their role/clinic changes).
5.  **RLS Policy Implementation**:
    *   RLS policies must be created for all relevant tables containing clinic-specific or provider-specific data. This includes, but is not limited to: `patients`, `appointments`, `treatments`, `financial_records`, `provider_schedules`, etc.
    *   Policies should leverage Supabase's `auth.uid()`, `auth.jwt() -> 'user_metadata' -> 'roles'`, and potentially custom claims or helper functions to determine access rights.
6.  **Testing**:
    *   Comprehensive testing must be conducted with users assigned to different roles and clinics (covering the 5 existing providers across 2 clinics as a baseline).
    *   Test cases should cover all CRUD operations and edge cases to ensure policies are working as expected and there are no data leaks.
7.  **Documentation**:
    *   The business logic documentation must be updated to reflect the defined user roles and their permissions.
    *   Technical documentation for the RLS policies (SQL definitions, logic explanation) must be created.

## Affected Files & Components

*   **Database Schema (`schema.prisma` or equivalent)**:
    *   Potentially minor adjustments to `user_clinic_roles` if needed.
    *   No major schema changes anticipated by AOJ-56, but RLS implementation itself is a database-level change.
*   **Supabase Migrations (`supabase/migrations/`)**:
    *   New SQL migration files will be created to define and apply all RLS policies and any helper functions.
*   **Supabase Database Functions (`supabase/functions/`)**:
    *   May require helper SQL functions to be called within RLS policies for complex logic (e.g., checking a user's role from `user_clinic_roles`).
*   **Backend API (e.g., `src/app/api/`)**:
    *   Existing data fetching logic might need review to ensure it correctly handles scenarios where RLS restricts data (e.g., gracefully handling empty result sets vs. errors). No direct changes to API logic for RLS itself, as policies are database-enforced.
*   **Documentation**:
    *   Business Logic Document.
    *   New RLS Technical Documentation.

## Implementation Strategy

1.  **Phase 1: Role and Policy Definition (1-2 days)**
    *   Finalize the exact permissions matrix for each user role (`office_manager`, `dentist`, `hygienist`, `front_desk`) against key data tables.
    *   Design the SQL logic for RLS policies for each critical table, considering `USING` (for SELECT, UPDATE, DELETE) and `WITH CHECK` (for INSERT, UPDATE) clauses.
    *   Define any necessary SQL helper functions (e.g., `get_user_clinics(user_id UUID)`, `user_has_role(user_id UUID, role_name TEXT)`).
2.  **Phase 2: `user_clinic_roles` Setup & Initial Policy Implementation (2-3 days)**
    *   Ensure the `user_clinic_roles` table is populated correctly for existing users and test users.
    *   Implement RLS policies for a core set of tables (e.g., `patients`, `appointments`).
    *   Develop initial test scripts or manual test cases for these core tables.
3.  **Phase 3: Full RLS Policy Implementation & Unit Testing (3-5 days)**
    *   Roll out RLS policies to all remaining relevant tables.
    *   Write specific unit tests for each RLS policy using a testing framework or SQL-based tests, simulating different user roles and clinic assignments.
4.  **Phase 4: Integration Testing & Refinement (2-3 days)**
    *   Conduct end-to-end testing by interacting with the application using test accounts for each role.
    *   Verify data visibility and access restrictions across all features.
    *   Profile query performance and optimize RLS policies if necessary.
5.  **Phase 5: Documentation & Review (1-2 days)**
    *   Update the business logic document with detailed role definitions and permissions.
    *   Create comprehensive technical documentation for the RLS implementation.
    *   Conduct a final review of policies, tests, and documentation.

## AI Guardrails Implementation Strategy

Given the complexity and critical nature of this feature, the following AI Guardrails strategy will be employed:

*   **File-Level Constraints**:
    *   RLS policies will be written in SQL and managed via Supabase migration files.
    *   Any helper functions will also be in SQL.
    *   Focus AI assistance on generating correct and performant SQL for policies and migrations.
*   **Change Type Isolation**:
    *   Changes are primarily DDL (Data Definition Language) for creating/altering RLS policies and functions.
    *   Minimize changes to application code; RLS should be transparent to most of the application layer.
*   **Incremental Validation Protocol**:
    *   Implement and test RLS policies on a per-table or per-role basis.
    *   Use specific test users with defined roles and clinic assignments for validation at each step.
    *   AI should be prompted to generate test queries for specific scenarios (e.g., "Show me the query to test if a `dentist` from clinic A can see patients from clinic B").
*   **Safety Prompts for AI Sessions**:
    *   "Ensure this RLS policy correctly uses `auth.uid()` and considers the `user_clinic_roles` table."
    *   "Verify that this policy prevents unauthorized data modification (check `WITH CHECK` clause)."
    *   "Analyze this policy for potential performance bottlenecks."
    *   "Does this policy cover all relevant operations (SELECT, INSERT, UPDATE, DELETE) for the specified role?"

## Risk Assessment & Mitigation

*   **Risk 1: Incorrect Policy Logic Leading to Data Leaks or Denied Access.**
    *   *Mitigation*: Thorough unit and integration testing for each policy and role. Peer review of SQL policy code. Incremental rollout.
*   **Risk 2: Performance Degradation due to Complex RLS Queries.**
    *   *Mitigation*: Design policies for efficiency. Use database indexing appropriately. Performance test critical queries under RLS.
*   **Risk 3: Complexity in Managing User Roles and Clinic Assignments.**
    *   *Mitigation*: Clear processes for managing `user_clinic_roles` table. Consider admin UI for role/clinic assignments in the future (out of scope for AOJ-56).
*   **Risk 4: Breaking Existing Functionality.**
    *   *Mitigation*: Comprehensive regression testing. Ensure application handles restricted data views gracefully.

## Additional Considerations

*   **Super Admin/System Role**: Consider if a super admin role is needed that bypasses RLS for maintenance (currently out of scope for AOJ-56 but important for future).
*   **Auditing**: Implement audit trails for RLS policy changes and potentially for access patterns (out of scope for AOJ-56).
*   **RLS on Views**: If views are used extensively, ensure RLS is also applied or considered for them.

## Linear Integration Preparation

*   **Suggested Issue Title**: Implement Row Level Security Policies for Multi-Clinic Access (AOJ-56)
*   **Priority Level**: High
*   **Due Date Recommendation**: (Calculated based on 1-2 week timeline from start date)
*   **Labels Suggestions**: `security`, `database`, `auth`, `feature`
*   **Assignee Recommendations**: Developer(s) with strong SQL and Supabase experience.

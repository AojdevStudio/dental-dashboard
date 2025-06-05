---
trigger: model_decision
description: Utilizing Prisma Tools
globs: 
---
# Utilizing Prisma Tools

When the user mentions "Prisma MCP" or requests actions related to Prisma database management, migrations, or data inspection, you should consider using the available Prisma tools. These tools provide direct ways to interact with the Prisma setup of the project.

## Available Prisma Tools

Here's a list of the Prisma tools at your disposal and their typical use cases:

-   **`mcp_Prisma_Prisma-Studio(projectCWD: str)`**
    -   **Purpose:** Opens Prisma Studio, a visual UI for browsing and managing data in the database.
    -   **When to use:**
        -   When the user wants to visually inspect data in tables (e.g., to verify seeding, check results of operations).
        -   For manual data exploration or light modifications during development.
        -   Useful for debugging data-related issues.
    -   **Example:** After a seeding operation, if the user questions whether data was correctly added, you can offer to open Prisma Studio for them to check.

-   **`mcp_Prisma_migrate-status(projectCWD: str)`**
    -   **Purpose:** Checks the status of database migrations. Shows which migrations have been applied, which are pending, and if there's any drift between the migration history and the database schema.
    -   **When to use:**
        -   Before running new migrations to understand the current state.
        -   When troubleshooting migration-related errors.
        -   If the user asks about the migration status.

-   **`mcp_Prisma_migrate-dev(name: str, projectCWD: str)`**
    -   **Purpose:** Creates a new migration based on changes in `schema.prisma` and applies it to the development database. Also runs pending migrations.
    -   **When to use:**
        -   After you or the user has modified `schema.prisma` and new database schema changes need to be persisted and applied.
        -   Always provide a descriptive `name` for the migration (e.g., "add_user_email_verification_token").

-   **`mcp_Prisma_migrate-reset(projectCWD: str)`**
    -   **Purpose:** Resets the development database, dropping all data and reapplying all migrations. Useful for getting a clean state.
    -   **When to use:**
        -   **Caution:** This is a destructive operation for development databases.
        -   When the database is in an inconsistent state and needs a fresh start.
        -   If migration history drift is detected and cannot be easily resolved.
        -   Always confirm with the user before using, explaining it will wipe development data.

-   **`mcp_Prisma_Prisma-Login(projectCWD: str)`**
    -   **Purpose:** Allows the user to log in to their Prisma account or create one. This is often a prerequisite for using Prisma Platform features like Prisma Accelerate or Pulse.
    -   **When to use:**
        -   If operations requiring Prisma Platform authentication fail.
        -   If the user needs to connect to Prisma's online services.

-   **`mcp_Prisma_Prisma-Postgres-account-status(projectCWD: str)`**
    -   **Purpose:** Shows the status of the Prisma Postgres account, indicating if the user is logged in.
    -   **When to use:**
        -   To check if login is required before attempting to use Prisma Platform features.

-   **`mcp_Prisma_Create-Prisma-Postgres-Database(name: str, projectCWD: str, region: str)`**
    -   **Purpose:** Creates a new online Prisma Postgres database via the Prisma Platform.
    -   **When to use:**
        -   If the user wants to set up a new cloud-hosted Postgres database managed by Prisma.
        -   Requires the user to be logged into Prisma Platform.
        -   Specify a sensible `name` and `region` (default to `us-east-1` if unsure).

## General Guidelines

-   Always provide the `projectCWD` (current working directory, typically the workspace root) when calling these tools.
-   Explain to the user *why* you are using a specific Prisma tool and what it's expected to do.
-   Interpret the results or any error messages from the tools to the user.
-   If a tool is destructive (like `migrate-reset`), ensure user confirmation.

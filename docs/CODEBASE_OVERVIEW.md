    # Codebase Overview: dental-dashboard

This document provides a high-level overview of the `dental-dashboard` codebase structure and key technologies.

## Core Application & UI (Next.js with TypeScript)

*   **`src/`**: The main directory for application source code.
    *   **`app/`**: Contains Next.js App Router routes, pages, and API handlers. This is the heart of the application's navigation and server-side logic for page rendering.
    *   **`components/`**: Houses reusable React components.
        *   Likely uses Shadcn UI (indicated by `components.json` at the project root).
        *   Organized into `ui/` for primitive components and feature-specific component directories.
    *   **`lib/`**: Contains utility functions, helper modules, third-party library configurations (e.g., Supabase client, date utilities, logging), and constants.
    *   **`hooks/`**: Custom React hooks for reusable stateful logic.
    *   **`types/`**: Custom TypeScript type definitions and interfaces.
    *   **`styles/`**: Global stylesheets or base styles, complementing Tailwind CSS.
    *   **`generated/`**: Likely holds auto-generated code, such as the Prisma client or types derived from the database schema.
    *   **`actions/`**: In Next.js, this typically holds Server Actions for server-side data mutations callable from components.
    *   **`services/`**: May contain modules encapsulating business logic or interactions with external APIs.
        *   *Note: The project structure guidelines initially indicated these directories might not be used, suggesting a potential evolution in the architecture.*
*   **`public/`**: Stores static assets (images, fonts, etc.) served directly by the web server.
*   **`middleware.ts`**: Next.js middleware for processing requests globally.

## Data Layer

*   **`prisma/`**: Contains Prisma ORM configurations.
    *   `schema.prisma`: Defines database models and relations.
    *   Likely includes the generated Prisma client.
*   **`supabase/`**: Dedicated to Supabase backend configurations and code.
    *   `functions/`: Serverless Edge Functions (e.g., for audit logging, Google Sheets sync).
    *   `migrations/`: SQL files for database schema migrations.
    *   `config.toml`: Supabase project-specific configuration.

## Project Management & AI Tooling

*   **`.ai/`**: Implements the "Task Magic" file-based project management system.
    *   `tasks/`: Markdown files for active development tasks.
    *   `memory/`: Archives of completed or failed tasks.
    *   `TASKS.md`: A master checklist providing an overview of all tasks.
*   **`.cursor/` & `.windsurf/`**: Directories for AI assistant (Cascade) rules, operational guidelines, and configuration.
*   **`memory-bank/`**: Stores project context documents and high-level requirements for the AI assistant.

## Development, Tooling & Configuration

*   **Root Configuration Files**:
    *   `next.config.ts`: Next.js specific configurations.
    *   `tsconfig.json`: TypeScript compiler options.
    *   `postcss.config.mjs`: PostCSS configuration (used by Tailwind CSS).
    *   `biome.json`: Biome linter/formatter configuration.
    *   `components.json`: Shadcn UI configuration.
*   **Package Management**:
    *   `package.json`: Defines project metadata, scripts, and dependencies.
    *   `pnpm-lock.yaml` & `pnpm-workspace.yaml`: Indicate `pnpm` is the package manager.
*   **`node_modules/`**: Stores all installed project dependencies.
*   **`scripts/`**: Contains utility scripts for development, build, or deployment processes.
*   **`docs/`**: General project documentation.
*   **Testing**:
    *   `vitest.config.ts` & `vitest.integration.config.ts`: Configuration for the Vitest testing framework.
    *   `src/tests/`: Location for test files.
    *   `src/vitest-setup.ts` & `src/vitest-setup.integration.ts`: Setup files for Vitest.

## Key Technologies & Patterns Summary

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Shadcn UI
*   **Backend/DB**: Supabase (Authentication, Database, Edge Functions)
*   **ORM**: Prisma
*   **Package Manager**: pnpm
*   **Linting/Formatting**: Biome
*   **Testing**: Vitest
*   **Project Management**: Custom "Task Magic" system (file-based).
*   **AI-Assisted Development**: Windsurf/Cursor rules and memory system.

This overview reflects the codebase structure based on directory listings and project conventions.

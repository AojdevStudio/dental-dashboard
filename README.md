# Dental Practice Insights Dashboard (Project In Progress)

🚧 **Status: In Progress** 🚧

This project is currently under development. Features and documentation may be incomplete or subject to change.

## Overview

This repository contains the **Dental Practice Insights Dashboard**, a Next.js application designed to provide comprehensive data visualization and KPI tracking for dental clinics. The development of this dashboard is managed and assisted by a sophisticated **Task Master CLI**, which leverages AI (primarily Anthropic Claude) to streamline the development workflow.

The core application aims to offer an intuitive and data-rich platform for dental practices to monitor performance, manage goals, and gain actionable insights from various data sources.

## Core Components

1.  **Dental Practice Insights Dashboard (The Application):**
    *   Built with [Next.js](https://nextjs.org/) (App Router) and [TypeScript](https://www.typescriptlang.org/).
    *   Utilizes [Supabase](https://supabase.io/) for backend services, including PostgreSQL database and user authentication.
    *   Employs [Prisma](https://www.prisma.io/) as the ORM for type-safe database interactions.
    *   Features a modern UI styled with [Tailwind CSS](https://tailwindcss.com/) and composed of [Shadcn UI](https://ui.shadcn.com/) components.
    *   Includes functionalities for managing clinics, users, providers, metrics, data sources, goals, and customizable dashboards with widgets.
    *   Adheres to specific development guidelines outlined in `.windsurf/rules/`.

2.  **Task Master CLI (located in `scripts/`):**
    *   A Node.js-based command-line interface to manage the AI-driven development process for this dashboard (and potentially other projects).
    *   Parses Product Requirements Documents (PRDs) to generate an initial task list (`tasks.json`).
    *   Supports comprehensive task management: listing, updating, status changes, subtask generation (optionally AI-assisted with Claude/Perplexity), dependency management, and complexity analysis.
    *   Designed for seamless integration with AI coding assistants like [Cursor](https://www.cursor.so/).

## Tech Stack

**Application (Dental Practice Insights Dashboard):**
*   Framework: Next.js (App Router)
*   Language: TypeScript
*   Backend: Supabase (PostgreSQL, Auth)
*   ORM: Prisma
*   Styling: Tailwind CSS
*   UI Components: Shadcn UI
*   State Management: Primarily server-driven with Next.js Server Components; React Context for client-side UI state.

**Task Master & AI Workflow:**
*   Runtime: Node.js
*   AI APIs: Anthropic Claude (Primary), Perplexity AI (Optional for research-backed subtasks)
*   Package Management: pnpm

## Project Structure

*   `src/`: Main Next.js application source code.
    *   `app/`: Next.js App Router (pages, API routes, layouts for the dashboard).
    *   `components/`: Reusable UI components (Shadcn UI, custom dashboard elements).
    *   `lib/`: Core libraries, Supabase/Prisma clients, utility functions.
    *   `generated/`: Auto-generated code (e.g., Prisma client, types).
    *   `middleware.ts`: Supabase authentication middleware.
*   `scripts/`: Contains the "Task Master" CLI (`dev.js`) and related utilities.
    *   `README.md`: Detailed documentation for the Task Master CLI.
*   `prisma/`: Prisma schema, migrations, and generated client for the dental dashboard database.
*   `.windsurf/rules/`: Development guidelines, conventions, and Cursor rules tailored for this project.
*   `docs/`: Supplementary project documentation (auth flows, UX rubrics, development learnings, etc.).
*   `README-task-master.md`: In-depth guide for the Task Master system.

## Getting Started

### 1. Setting up the Dental Practice Insights Dashboard

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AojdevStudio/dental-dashboard.git  
    cd dental-dashboard
    ```
2.  **Install dependencies:**
    This project uses `pnpm` for package management.
    ```bash
    pnpm install
    ```
3.  **Set up environment variables:**
    Copy `.env.example` (if it exists, otherwise create `.env`) and populate it with your Supabase URL and Anon Key. Also include API keys for Task Master.
    ```env
    # For the Next.js Application
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

    # For Task Master CLI
    ANTHROPIC_API_KEY=your-claude-api-key
    # PERPLEXITY_API_KEY=your-perplexity-api-key (optional for --research flag)
    ```
4.  **Run database migrations:**
    Ensure your Supabase database is set up. Then, apply migrations:
    ```bash
    pnpm prisma migrate dev --name init # Or an appropriate migration name
    pnpm prisma generate # To generate Prisma Client
    ```
5.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.


## Development Guidelines

This project adheres to a set of development guidelines and conventions stored in the `.windsurf/rules/` and in the `.cursor/rules/` directory. These cover aspects such as:
*   AI-assisted development workflow with Cursor and Claude.
*   Data flow architecture (server-side logic, client-side UI).
*   Database function and RLS policy best practices for Supabase/Postgres.
*   API route design in Next.js.
*   Naming conventions and project structure.
*   Prisma ORM usage.
*   Next.js Server Components and Supabase integration.
*   Shadcn UI component usage and tracking.
*   Testing strategies with Vitest.

Reviewing these rules is crucial for maintaining code quality and consistency.

## Learn More (Next.js)

To learn more about Next.js, take a look at the following resources:
*   [Next.js Documentation](https://nextjs.org/docs)
*   [Learn Next.js](https://nextjs.org/learn)

## Contributing

[Details TBD - Contribution guidelines will be outlined as the project matures.]

## License

[Details TBD - A license (e.g., MIT, Apache 2.0, or proprietary) will be specified later.]
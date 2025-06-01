# Project Overview: Dental Dashboard

🚧 **Status: In Progress** 🚧

*This document provides a comprehensive overview of the Dental Dashboard project, compiled from architectural, developer, and product management perspectives. It is intended to be a living document, updated as the project evolves.*

## 1. Introduction

-   **Purpose of this document:** To serve as a central knowledge base for understanding the Dental Dashboard's architecture, development practices, product goals, and overall structure. It aims to onboard new team members, align existing ones, and guide development efforts.
-   **Brief overview of the Dental Dashboard application:** The Dental Practice Insights Dashboard is a Next.js application designed to provide comprehensive data visualization and Key Performance Indicator (KPI) tracking for dental clinics. It aims to offer an intuitive and data-rich platform for dental practices to monitor performance, manage goals, and gain actionable insights from various data sources. The development is notably assisted by an AI-driven "Task Master CLI".

## 2. Product Manager Perspective

-   **2.1. Vision & Mission:** 
    -   **Vision:** To empower dental practices with accessible, actionable data insights, enabling them to optimize operations, improve patient care, and achieve business growth.
    -   **Mission:** To deliver a user-friendly, comprehensive dashboard that seamlessly integrates various data sources, visualizes key performance indicators, and facilitates goal tracking for dental clinics.
-   **2.2. Target Audience:** Dental clinic owners, practice managers, and administrative staff who are responsible for monitoring clinic performance, making data-driven decisions, and managing operational goals.
-   **2.3. Core Features & Functionality (based on `project-structure.md` and `README.md`):
    *   **Dashboard:** Customizable widgets displaying key metrics (financial, patient, appointments, providers, calls).
    *   **Integrations:** Google Sheets for data input, with potential for other data sources.
    *   **Goal Management:** Creating, tracking, and visualizing progress towards practice-specific goals.
    *   **Reporting:** Generating and exporting reports (PDF, CSV).
    *   **Settings:** Management of clinic details, users, and providers.
    *   **Authentication:** Secure user login and registration.
-   **2.4. Value Proposition:** Provides dental practices with a centralized, easy-to-understand view of their performance, replacing manual data compilation and analysis. It helps identify trends, track progress against goals, and make informed decisions to improve efficiency and profitability.
-   **2.5. User Stories (Examples - *to be expanded*):
    *   As a Practice Manager, I want to see a daily overview of key financial metrics (e.g., production, collection) so that I can quickly assess the clinic's financial health.
    *   As a Clinic Owner, I want to set monthly patient acquisition goals and track progress so that I can measure the effectiveness of marketing campaigns.
    *   As an Administrator, I want to connect our Google Sheet containing appointment data so that it automatically syncs with the dashboard, reducing manual data entry.

## 3. Software Architect Perspective

-   **3.1. System Architecture Overview:**
    -   **High-level Diagram:**
        ```mermaid
        graph TD
            User[End User] -->|Browser| Frontend[Next.js Frontend]
            Frontend -->|API Calls| Backend[Next.js API Routes]
            Frontend -->|Static Assets, SSR/SSG| NextJSServer[Next.js Server]
            Backend -->|ORM| Prisma[Prisma ORM]
            Backend -->|Direct Calls/SDK| Supabase[Supabase BaaS]
            Prisma --> Database["(Supabase PostgreSQL)"]
            Supabase --> Database
            Supabase --> Auth[Supabase Auth]
            Supabase --> Storage[Supabase Storage]
            Supabase --> EdgeFunctions[Supabase Edge Functions]
            Backend -->|External API| GoogleSheets[Google Sheets API]

            subgraph "Client-Side (Browser)"
                Frontend
            end

            subgraph "Cloud Services"
                Supabase
                GoogleSheets
            end

            subgraph "Server-Side (Vercel/Host)"
                NextJSServer
                Backend
                Prisma
            end
        ```
    -   **Frontend:** Next.js (App Router) application running in the browser, responsible for UI rendering and user interaction. Uses Server Components for data fetching and client components for interactivity.
    -   **Backend:** Next.js API Routes handle business logic, data processing, and communication with external services. Supabase provides backend-as-a-service functionalities including database, authentication, and potentially edge functions.
    -   **Database:** PostgreSQL managed by Supabase, accessed via Prisma ORM for type-safe queries.
    -   **External Services:** Google Sheets API for data integration, Anthropic/OpenAI for AI-assisted development workflows (Task Master CLI) and potentially in-app AI features.

-   **3.2. Technology Stack (Primary):
    *   **Framework:** Next.js 15.3.2 (App Router, Turbopack for dev)
    *   **Language:** TypeScript (version 5.8.3)
    *   **Backend as a Service (BaaS):** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
    *   **ORM:** Prisma 6.8.2
    *   **UI Libraries:** React 19.1.0, Shadcn UI, Radix UI Primitives
    *   **Styling:** Tailwind CSS 4.1.8, PostCSS
    *   **State Management:** Next.js Server Components, React Context (client-side UI), Zustand, TanStack React Query / SWR
    *   **Forms:** React Hook Form 7.56.4, Zod 3.25.36 (validation)
    *   **Charting:** Recharts 2.15.3
    *   **Icons:** Lucide React 0.510.0
    *   **Animations:** Framer Motion 12.15.0
    *   **API SDKs:** `@googleapis/drive`, `@googleapis/sheets`, `@anthropic-ai/sdk`, `openai`
    *   **Testing:** Vitest 3.1.4
    *   **Linting/Formatting:** Biome 1.9.4
    *   **Package Management:** pnpm 10.10.0
    *   **Logging:** Winston 3.17.0

-   **3.3. Frontend Architecture:**
    *   **Next.js App Router:** Located in `src/app/`. Organizes the application by routes, with layouts, pages, loading states, and error boundaries.
        *   Route Groups: `(auth)` for authentication pages, `(dashboard)` for main application sections.
    *   **Component Structure:** Located in `src/components/`. 
        *   `ui/`: Reusable, generic UI elements (likely from Shadcn UI).
        *   `dashboard/`: Specific components related to dashboard features.
        *   `common/`: Shared components like navigation, sidebar, header.
    *   **State Management:** 
        *   Primarily server-driven using Next.js Server Components for data fetching.
        *   React Context for localized client-side UI state.
        *   Zustand for global client-side state if needed.
        *   TanStack React Query or SWR for managing server state, caching, and data synchronization on the client-side for dynamic interactions.
    *   **Styling:** Tailwind CSS for utility-first styling, with `tailwind-merge` and `clsx` for managing conditional classes. Radix UI provides unstyled, accessible primitives, and Shadcn UI builds upon these with pre-styled components.

-   **3.4. Backend Architecture:**
    *   **API Routes:** Next.js API routes located in `src/app/api/` handle client requests, business logic, and interactions with the database and external services.
    *   **API Route Structure (`src/app/api/`):** The API routes are organized by feature/resource, indicating a RESTful or resource-oriented approach:
        *   `auth/`: Handles authentication, including session management (`session/`) and Google OAuth (`google/connect/`, `google/callback/`).
        *   `clinics/`: Manages clinic data (e.g., CRUD operations, listing) and related provider information (`[clinicId]/providers/`).
        *   `export/`: Provides endpoints for data export (e.g., `pdf/`, `csv/`).
        *   `goals/`: CRUD operations for goals, potentially supporting `[goalId]` specific actions.
        *   `google/`: Seems to be a duplicate or broader category for Google integrations, needs clarification if different from `google-sheets` or `auth/google`.
        *   `google-sheets/`: Manages Google Sheets integration (discovery, synchronization, data mapping, validation).
        *   `hygiene-production/`: Likely specific calculations or data retrieval for hygiene-related metrics.
        *   `metrics/`: A central point for various metric types (financial, patients, appointments, providers, calls).
        *   `providers/`: Manages provider-specific data (potentially top-level provider actions if not nested under clinics).
        *   `users/`: Handles user management (CRUD, listing), including invitations (`invite/`) and `[userId]` specific actions.
        *   `test/`: Contains test-related API endpoints.
        *   `__tests__/`: Directory likely holding automated tests for the API routes.
    *   **Supabase:**
        *   **Database:** PostgreSQL instance for data persistence.
        *   **Authentication:** Supabase Auth for user management (signup, login, session management).
        *   **Storage:** Potentially for file uploads (e.g., report exports, clinic logos).
        *   **Edge Functions:** For serverless functions that can be invoked via HTTP requests (directory `supabase/functions/` exists).
    *   **Prisma:** ORM used for database access, providing type-safety and a fluent API for querying the Supabase PostgreSQL database. Schema located in `prisma/schema.prisma`.
    *   **Data Flow Diagram (Example: Google Sheets Sync - *Conceptual*):**
        ```mermaid
        sequenceDiagram
            participant User
            participant Frontend
            participant API_Route_Sync
            participant GoogleSheetsAPI
            participant SupabaseDB

            User->>Frontend: Initiates Google Sheets Sync
            Frontend->>API_Route_Sync: POST /api/google-sheets/sync (auth_token, sheet_id)
            API_Route_Sync->>GoogleSheetsAPI: Fetch sheet data (credentials)
            GoogleSheetsAPI-->>API_Route_Sync: Returns sheet data
            API_Route_Sync->>API_Route_Sync: Process and transform data
            API_Route_Sync->>SupabaseDB: Upsert transformed data (via Prisma)
            SupabaseDB-->>API_Route_Sync: Sync confirmation
            API_Route_Sync-->>Frontend: Sync status (success/failure)
            Frontend-->>User: Display sync status
        ```

-   **3.5. Database Design:**
    *   **Prisma Schema:** Defined in `prisma/schema.prisma`. Key models include:
        *   `Clinic`: Represents a dental clinic with basic information, users, providers, metrics, goals, and data sources.
        *   `User`: Represents application users, linked to a clinic and an optional Supabase `authId`. Roles include `office_manager`, `dentist`, `front_desk`, `admin`.
        *   `Provider`: Represents dental care providers (dentists, hygienists) within a clinic.
        *   `MetricDefinition`: Defines the types of metrics that can be tracked (e.g., financial, patient, appointment), including data type and calculation formula.
        *   `DataSource`: Primarily configured for Google Sheets, storing spreadsheet ID, sheet name, sync status, and OAuth tokens. Linked to a clinic and optionally a provider.
        *   `ColumnMapping`: Maps columns from a `DataSource` (e.g., Google Sheet column) to a `MetricDefinition`, allowing for data transformation.
        *   `MetricValue`: Stores the actual data points for a given `MetricDefinition`, linked to a date, clinic, provider, and data source.
        *   `Goal`: Tracks targets for specific `MetricDefinition`s over a time period, associated with a clinic or provider.
        *   `Dashboard`: Stores user-specific dashboard configurations, including name, layout, and associated widgets. Linked to a `User`.
        *   `Widget`: Represents individual components on a `Dashboard`, defining type (chart, counter, table), position, size, and configuration. Linked to a `Dashboard` and optionally a `MetricDefinition`.
        *   **Multi-Tenant & Advanced Metrics Models:** The schema includes additions for multi-tenancy and more granular metric tracking:
            *   `UserClinicRole`: Maps users to clinics with specific roles (e.g., `clinic_admin`, `provider`), facilitating multi-tenant access control.
            *   `GoalTemplate`: Allows for creating reusable goal configurations, either system-wide or clinic-specific.
            *   `FinancialMetric`: Tracks detailed financial transactions (production, collection, adjustments) with categorization.
            *   `AppointmentMetric`: Tracks analytics related to appointments (scheduled, completed, cancelled, no-shows, production).
            *   `CallMetric`: Tracks performance of calls (total, connected, voicemails, appointments scheduled from calls).
            *   `PatientMetric`: Tracks key patient-related analytics (active, new, retention rate, average value).
            *   `MetricAggregation`: Stores pre-computed metric aggregations (daily, weekly, monthly) for performance optimization.
            *   (Potentially `GoogleCredential` for managing Google API access - hinted at end of schema).
        *   *Note:* The schema shows fields like `uuidId` and `authId` being added, indicating an ongoing migration (e.g., from CUIDs to UUIDs, and tighter Supabase auth integration). The presence of "Phase 1/2/3" comments in the schema suggests a phased approach to these enhancements.
    *   **Supabase Database Features:** Leverages PostgreSQL. Row Level Security (RLS) is likely used in conjunction with Supabase Auth and the `UserClinicRole` model to secure data access per user/clinic, enforcing multi-tenancy.
    *   **Data Migration Strategy:** 
        *   Prisma Migrate (`pnpm prisma migrate dev`) is used for schema migrations.
        *   Custom data migration scripts are present in `scripts/data-migration/` (e.g., `migrate-to-uuid.ts`) for more complex data transformations not handled by schema migrations. Run using `tsx`.

-   **3.6. Integrations:**
    *   **Google Sheets API:** Core integration for data input/sync, using `@googleapis/drive` and `@googleapis/sheets`.
    *   **AI Services:** Anthropic and OpenAI SDKs are included, primarily for the Task Master CLI, but could be leveraged for in-app features.

-   **3.7. Authentication & Authorization:**
    *   **Supabase Auth:** Handles user registration, login, and session management.
    *   **Middleware (`middleware.ts`):** Located at the project root. It uses `@supabase/ssr` to create a Supabase client, manage user sessions by interacting with cookies, and protect routes. Unauthenticated users attempting to access protected paths are redirected to `/login`. Authenticated users attempting to access auth pages (e.g., `/login`, `/register`) are redirected to `/dashboard`. The middleware includes detailed logging for request processing, authentication status, and redirects. It matches all paths except for static assets (`_next/static`, `_next/image`, `favicon.ico`, and common image file extensions).
    *   **Row Level Security (RLS):** Supabase RLS, likely in conjunction with the `UserClinicRole` model, is expected to be implemented to enforce data access policies based on user roles and clinic affiliation, crucial for multi-tenancy.

-   **3.8. Scalability & Performance Considerations: (*To be detailed further*)
    *   Next.js features like Server Components, ISR (Incremental Static Regeneration), and Edge Functions can be leveraged.
    *   Supabase is designed for scalability.
    *   Database query optimization via Prisma.
    *   Code splitting and lazy loading inherent in Next.js.

-   **3.9. Security Considerations: (*To be detailed further*)
    *   Supabase RLS for data access control.
    *   Input validation (Zod).
    *   Environment variables for sensitive keys.
    *   Standard web security practices (e.g., Helmet, if applicable for custom server parts beyond Next.js defaults).

## 4. Software Developer Perspective

-   **4.1. Getting Started:**
    *   **Prerequisites:** Node.js, pnpm.
    *   **Installation:** 
        1.  Clone repository: `git clone https://github.com/AojdevStudio/dental-dashboard.git && cd dental-dashboard`
        2.  Install dependencies: `pnpm install`
    *   **Environment Variables:** Copy `.env.example` to `.env` and populate with Supabase URL/Anon Key, and Anthropic/Perplexity API keys for Task Master.
        ```env
        # For the Next.js Application
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

        # For Task Master CLI
        ANTHROPIC_API_KEY=your-claude-api-key
        # PERPLEXITY_API_KEY=your-perplexity-api-key (optional)
        ```
    *   **Database Setup:** Ensure Supabase project is set up. Run migrations: 
        `pnpm prisma migrate dev --name init` (or appropriate name)
        `pnpm prisma generate`
    *   **Running the development server:** `pnpm dev` (uses Turbopack). Access at `http://localhost:3000`.

-   **4.2. Project Structure Deep Dive (combining `project-structure.md` and observations):
    *   `src/`: Main application source code.
        *   `app/`: Next.js App Router. Contains route groups like `(auth)` and `(dashboard)`, API routes in `api/`, root `layout.tsx` and `page.tsx`.
        *   `components/`: Reusable React components. Current top-level structure based on `list_dir` output:
            *   `auth/` (directory)
            *   `common/` (directory)
            *   `dashboard/` (directory)
            *   `goals/` (directory)
            *   `google-sheets/` (directory)
            *   `ui/` (directory)
            *   *(Note: This reflects the current top-level directories. The target `project-structure.md` outlines a more granular structure including `users/`, `__tests__/`, and specific file examples within these, indicating an evolving component organization.)*
        *   `lib/`: Utility functions, Supabase/Prisma clients, helper modules, constants, date utilities, logger configuration (`logger.ts`).
        *   `hooks/`: Custom React hooks. Current files found based on `list_dir` output:
            *   `use-auth.ts`
            *   `use-filters.ts`
            *   `use-goals.ts`
            *   `use-google-sheets.ts`
            *   `use-metrics.ts`
            *   `use-users.ts`
            *   *(Note: This lists currently available hooks. The target `project-structure.md` suggests a more extensive set of hooks and a `__tests__/` directory, indicating ongoing development in this area.)*
        *   `types/`: Contains shared TypeScript type definitions and interfaces. Current files found based on `list_dir` output:
            *   `database.ts`
            *   `supabase.ts`
            *   *(Note: This lists currently available type files. The target `project-structure.md` details a more granular organization with numerous specific type files like `api.ts`, `auth.ts`, `domain.ts`, `index.ts`, etc. The file `database.ts` might correspond to the target `database.types.ts` and could contain Supabase-generated types. This area appears to be evolving towards the target structure.)*
        *   `actions/` & `services/`: These exist but `project-structure.md` suggests their logic might be moved to API routes or lib utilities. This needs clarification or represents an ongoing refactor.
        *   `generated/`: Auto-generated files, e.g., by Prisma.
        *   `styles/`: Global stylesheets (e.g., `globals.css`).
        *   `tests/`: Test files (Vitest).
    *   `prisma/`: Prisma schema (`schema.prisma`), migrations, and generated client.
    *   `supabase/`: Supabase specific configurations, edge functions (`functions/`), and migrations (`migrations/`).
    *   `.ai/`: Task Magic system for AI-assisted development.
        *   `tasks/`: Individual task markdown files.
        *   `TASKS.md`: Master task checklist.
        *   `memory/`: Archived tasks and logs.
        *   `plans/`: Product Requirement Documents (PRDs).
    *   `scripts/`: Node.js scripts, including the "Task Master" CLI (`dev.js`) for AI-driven development workflow management.
    *   `public/`: Static assets served by Next.js.
    *   `.windsurf/rules/` & `.cursor/rules/`: Project-specific development guidelines and AI agent rules.
    *   `docs/`: Supplementary project documentation.
    *   `memory-bank/`: Contextual information for AI agents.

-   **4.3. Coding Conventions & Standards:**
    *   **Biome:** Used for linting and formatting (`pnpm lint`, `pnpm format`). Configuration in `biome.json`.
    *   **TypeScript:** Strict typing enforced. Follow best practices.
    *   **Commenting:** Adhere to JSDoc3 standards as per `commenting-guidelines.md`.
    *   **Naming Conventions:** Follow guidelines in `naming-conventions.md`.
    *   **File Size:** Adhere to `file-size-guidelines.md`.
    *   **Logging:** Use Winston as per `winston-logging-guidelines.md`.
    *   Refer to `.windsurf/rules/` & `.cursor/rules/` for comprehensive guidelines.

-   **4.4. API Route Structure (`src/app/api/`):** The API routes are organized by feature/resource, indicating a RESTful or resource-oriented approach:
    *   `auth/`: Handles authentication, including session management (`session/`) and Google OAuth (`google/connect/`, `google/callback/`).
    *   `clinics/`: Manages clinic data (e.g., CRUD operations, listing) and related provider information (`[clinicId]/providers/`).
    *   `export/`: Provides endpoints for data export (e.g., `pdf/`, `csv/`).
    *   `goals/`: CRUD operations for goals, potentially supporting `[goalId]` specific actions.
    *   `google/`: Contains routes related to Google services, likely including OAuth and API interactions beyond just Sheets or Auth (e.g., `google/drive/`, `google/calendar/` if those were planned).
    *   `google-sheets/`: Manages Google Sheets integration (discovery, synchronization, data mapping, validation).
    *   `hygiene-production/`: Likely specific calculations or data retrieval for hygiene-related metrics.
    *   `metrics/`: A central point for various metric types (financial, patients, appointments, providers, calls).
    *   `providers/`: Manages provider-specific data (potentially top-level provider actions if not nested under clinics).
    *   `users/`: Handles user management (CRUD, listing), including invitations (`invite/`) and `[userId]` specific actions.
    *   `test/`: Contains test-related API endpoints for development or CI purposes.
    *   `__tests__/`: Directory likely holding automated tests (e.g., integration tests) for the API routes.

-   **4.5. Frontend Page Structure (`src/app/(dashboard)/`):** The dashboard section is organized into feature-specific pages using Next.js App Router conventions:
    *   `dashboard/`: The main landing page for the dashboard. Includes `page.tsx`, `loading.tsx` (for Suspense), and `error.tsx` (for error boundaries).
    *   `goals/`: Pages for creating (`create/page.tsx`), viewing (list at `page.tsx`), and managing individual goals (`[goalId]/page.tsx`).
    *   `integrations/`: Manages data integrations (`page.tsx`), with a focus on `google-sheets/` which has sub-pages for `page.tsx`, `connect/page.tsx` (initiating OAuth), and `mapping/page.tsx` (configuring column mappings).
    *   `reports/`: Pages for generating and viewing reports (`page.tsx`), possibly with export options (`export/page.tsx`).
    *   `settings/`: Contains various application and user settings (`page.tsx`), broken down into:
        *   `clinic/page.tsx` (managing clinic-specific settings)
        *   `users/page.tsx` (listing/managing users) and `users/[userId]/page.tsx` (editing a specific user)
        *   `providers/page.tsx` (listing/managing providers) and `providers/[providerId]/page.tsx` (editing a specific provider)
    *   `layout.tsx`: Defines the common layout (e.g., sidebar, header) for all pages within the `(dashboard)` route group.
    *   `providers.tsx`: Likely contains client-side context providers (e.g., TanStack Query, Zustand state management, Theme providers) wrapping the dashboard area.

-   **4.6. Core Libraries & Utilities (`src/lib/`):** This directory houses shared modules, client initializations, and helper functions. The current structure based on `list_dir` output is as follows:
    *   `api/`:
        *   `middleware.ts`: Likely utilities or configurations related to API middleware.
        *   `utils.ts`: API-specific utility functions.
    *   `auth/`:
        *   `config.ts`: Authentication configuration (e.g., Supabase URL, anon key for client-side, OAuth settings).
        *   `middleware.ts`: Authentication-related middleware helpers or configurations for use with Next.js middleware.
        *   `session.ts`: Utilities for managing user sessions on the client-side.
    *   `database/`:
        *   `__tests__/` (directory): Unit/integration tests for database logic.
        *   `auth-context.ts`: Potentially for row-level security (RLS) or user context in database queries.
        *   `client.ts`: This might be an alternative or older Prisma client initialization, or a generic database client.
        *   `prisma.ts`: Configures and exports a singleton Prisma client instance (`PrismaClient` from `@/generated/prisma`). It implements the recommended Next.js pattern to prevent connection pool exhaustion by caching the client on the global object during development (hot reloading) and creating a fresh instance in production.
        *   `queries/` (directory): Likely contains specific data retrieval functions or a data access layer (DAL).
        *   `schemas/` (directory): Zod schemas for data validation related to database operations or API payloads.
    *   `google-sheets/`:
        *   `auth.ts`, `client.ts`, `mapping.ts`, `sync.ts`, `validation.ts`: Client-side utilities for Google Sheets integration (authentication, API client, data mapping, synchronization logic, validation helpers).
    *   `metrics/`:
        *   `aggregations.ts`, `calculations.ts`, `definitions.ts`, `transformations.ts`, `types.ts`: Utilities for defining, calculating, aggregating, and transforming metrics, along with related type definitions.
    *   `supabase/`:
        *   `client.ts`: Exports a factory function `createClient()` that initializes a Supabase client instance for browser-side (client component) operations using `createBrowserClient` from `@supabase/ssr`. It uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
        *   `server.ts`: Exports an asynchronous factory function `createClient()` that initializes a Supabase client for server-side operations (Server Components, API Routes). It uses `createServerClient` from `@supabase/ssr`, `cookies` from `next/headers` for cookie management, and environment variables. Includes specific handling for cookie operations within different server contexts.
    *   `types/` (directory): This directory is currently **empty**. Project-wide shared types are primarily located in `src/types/`.
    *   `utils/` (directory):
        *   `client-logger.ts`: Specific logger configuration for client-side logging.
        *   `cn.ts`: Utility for conditionally joining class names (common with Tailwind CSS).
        *   `formatting.ts`: Data formatting utilities (e.g., dates, numbers, currency).
        *   `logger.ts`: Implements the main Winston-based application logging system. It configures environment-specific log levels (e.g., debug for development, warn for production), a custom human-readable log format (with special handling for error objects and stack traces), and color-coded console output. It's designed to support multiple transports (console, file-based) and handle uncaught exceptions/rejections.
    *   `utils.ts` (file at `src/lib/utils.ts`): General utility functions.
    *   *(Note: The structure of `src/lib/` is quite detailed. The target `project-structure.md` provides a high-level overview. The key difference observed is the emptiness of `src/lib/types/`, with main types residing in `src/types/`. The actual file contents provide a good insight into the specific roles of these utilities.)*

-   **4.7. Key Libraries & Their Usage (Examples):
    *   **Prisma Client:** Used in API routes and server-side logic for database interactions. Example: `import { prisma } from '@/lib/prisma'; await prisma.user.findMany();`
    *   **Supabase Client:** Used for authentication, storage, and invoking edge functions. Example: `import { supabase } from '@/lib/supabase'; const { data, error } = await supabase.auth.signInWithPassword(...)`
    *   **React Hook Form & Zod:** For building forms and validating data. Schemas defined with Zod, passed to `useForm` resolver.
    *   **Recharts:** For creating charts and visualizations in dashboard components.
    *   **AI SDKs:** Used within the Task Master CLI (`scripts/`) for interacting with Anthropic/OpenAI.

-   **4.8. API Development:**
    *   API routes are defined within `src/app/api/` using Next.js file-system routing.
    *   Standard HTTP methods (GET, POST, PUT, DELETE) are implemented as exported functions (e.g., `export async function GET(request: Request) {}`).
    *   Logic involves request handling, data validation (Zod), interaction with Prisma/Supabase, and returning JSON responses.

    -   **4.8.1. Example API Route: User Session (`/api/auth/session`):**
        *   **File:** `src/app/api/auth/session/route.ts`
        *   **Functionality (Current):** This route currently contains placeholder implementations for both `GET` and `POST` request handlers.
            *   `GET`: Returns `Response.json({ message: "Session GET placeholder" })`. Intended for session retrieval.
            *   `POST`: Returns `Response.json({ message: "Session POST placeholder" })`. Intended for session creation/update.
        *   **Status:** Marked with `// TODO:` comments, indicating that the actual session management logic (likely involving Supabase for session retrieval and updates) is pending implementation.
        *   **Purpose (Intended):** This endpoint is expected to manage user sessions, allowing the client-side to fetch current session details and potentially refresh or modify session state.

    -   **4.8.2. Example API Route: Google Sheets Discovery (`/api/google-sheets/discover`):**
        *   **File:** `src/app/api/google-sheets/discover/route.ts`
        *   **HTTP Method:** `POST`
        *   **Authentication:** Requires authentication and the user to be a `clinicAdmin`. This is enforced by the `withAuth` higher-order component/middleware with the option `{ requireClinicAdmin: true }`.
        *   **Request Body:** Expects a JSON object with a `spreadsheetId` (string, min 1 char), validated by `zod` schema (`discoverSchema`).
        *   **Functionality (Current):**
            *   Parses `spreadsheetId` from the request.
            *   Currently **does not** interact with the Google Sheets API. A `TODO` comment indicates: `// TODO: Implement actual Google Sheets API discovery`.
            *   Returns a **mock response** containing the provided `spreadsheetId`, a list of mock sheet names and IDs (e.g., `Sheet1`, `Production Data`), and a record of mock column names for each mock sheet.
        *   **Response (Mock):** `ApiResponse.success({ spreadsheetId, sheets: mockSheets, columns: mockColumns })` where `mockSheets` and `mockColumns` are hardcoded.
        *   **Status:** Placeholder/Mock implementation. The core logic for interacting with Google Sheets API to discover actual sheet names and columns is pending.
        *   **Purpose (Intended):** This endpoint is designed to take a Google Spreadsheet ID, connect to the Google Sheets API (using appropriate user credentials/OAuth tokens managed by the backend), and return a list of all sheets (tabs) within that spreadsheet, along with the column headers for each sheet. This information is crucial for the user to then map columns for data import.
        *   **Type Exports:** Exports `DiscoverRequest` and `DiscoverResponse` types for type-safe client-side interaction.

    -   **4.8.3. Example API Route: Google Sheets Sync (`/api/google-sheets/sync`):**
        *   **File:** `src/app/api/google-sheets/sync/route.ts`
        *   **HTTP Method:** `POST`
        *   **Authentication:** Requires authentication and the user to be a `clinicAdmin` (via `withAuth` middleware).
        *   **Request Body:** Expects JSON with `dataSourceId` (string, UUID) and `forceSync` (boolean, optional, default: `false`), validated by `syncSchema` (zod).
        *   **Functionality (Current - Mixed Implementation):**
            *   **Database Interactions (Implemented):**
                *   Retrieves the specified `DataSource` using `googleSheetsQueries.getDataSourceById`, ensuring the authenticated user has access and fetching the associated token.
                *   Checks if a sync is already in progress for the `DataSource` (if `forceSync` is false) and returns a 409 error if so.
                *   Updates the `DataSource`'s `lastSyncedAt` timestamp and `connectionStatus` to 'active' using `googleSheetsQueries.updateDataSource`.
                *   Fetches sync history for the `DataSource` using `googleSheetsQueries.getDataSourceSyncHistory`.
            *   **Google Sheets API Interaction (Placeholder):**
                *   The core logic for fetching data from Google Sheets, processing records based on mappings, and storing them is **not yet implemented**. A `TODO` comment states: `// TODO: Implement actual Google Sheets sync`.
        *   **Response (Partially Mock):** Returns `ApiResponse.success` with:
            *   The updated `dataSource` object (from DB).
            *   `syncHistory` (from DB).
            *   `syncedAt`: Current timestamp.
            *   `recordsProcessed: 0` (placeholder value).
            *   `errors: []` (placeholder value).
        *   **Status:** This route has implemented the database state management aspects of a sync operation (checking status, updating timestamps, fetching history) but the crucial Google Sheets data fetching and processing part is a placeholder.
        *   **Purpose (Intended):** To initiate a data synchronization process for a given `DataSource`. This involves fetching data from the linked Google Sheet, transforming it based on stored column mappings, and saving the processed metric values into the database. It should also log the outcome (success/failure, records processed, errors) to the sync history.
        *   **Type Exports:** Exports `SyncRequest` and `SyncResponse` types.

    -   **4.8.4. Example API Route: Google Sheets Column Mapping (`/api/google-sheets/mapping`):**
        *   **File:** `src/app/api/google-sheets/mapping/route.ts`
        *   **HTTP Methods Handled:** `GET`, `POST`, `PUT`, `DELETE` (Full CRUD for mappings).
        *   **Authentication:** All methods require `clinicAdmin` privileges (via `withAuth` middleware).
        *   **Key Functionality:** Manages the crucial step of defining how columns from a Google Sheet map to specific metric definitions within the application for a given data source.
        *   **Schemas (Zod):** Uses `createMappingSchema`, `updateMappingSchema`, and `bulkMappingSchema` for request validation.
        *   **`GET` Handler:**
            *   Requires `dataSourceId` query parameter.
            *   Retrieves and returns all column mappings for that data source using `googleSheetsQueries.getColumnMappings`.
        *   **`POST` Handler (Dual Mode):**
            *   **Bulk Mapping (Primary):** If `spreadsheetId` and `mappings` are in the body:
                *   Executes a Prisma transaction to:
                    1.  Create or update the `DataSource` (based on `clinicId` and `spreadsheetId`), setting/updating `sheetName`.
                    2.  Ensure all `MetricDefinition`s targeted by the mappings exist for the clinic, creating standard ones if missing (from `STANDARD_METRICS`).
                    3.  Delete all pre-existing `ColumnMapping`s for the `DataSource`.
                    4.  Create new `ColumnMapping`s based on the request.
                *   Returns `dataSourceId`, `mappingCount`, `createdMetrics`.
            *   **Single Mapping:** If the body matches `createMappingSchema`, creates one `ColumnMapping` via `googleSheetsQueries.createColumnMapping`.
        *   **`PUT` Handler:**
            *   Requires `mappingId` query parameter.
            *   Updates a specific `ColumnMapping` (identified by `mappingId`) using `googleSheetsQueries.updateColumnMapping` with data from the request body.
        *   **`DELETE` Handler:**
            *   Requires `mappingId` query parameter.
            *   Deletes a specific `ColumnMapping` using `googleSheetsQueries.deleteColumnMapping`.
        *   **Status:** This API route is substantially implemented, providing comprehensive CRUD operations for managing column mappings, including complex transactional logic for bulk updates. It relies heavily on database query functions in `googleSheetsQueries` and direct Prisma client usage for transactions.
        *   **Type Exports:** `CreateMappingInput`, `UpdateMappingInput`, `ColumnMapping`.

    -   **4.8.5. Example API Route: Google Sheets Validate (`/api/google-sheets/validate`):**
        *   **File:** `src/app/api/google-sheets/validate/route.ts`
        *   **HTTP Method:** `POST`
        *   **Authentication:** Requires `clinicAdmin` privileges (via `withAuth` middleware).
        *   **Request Body:** Expects JSON with `dataSourceId` (string, UUID) and `sampleSize` (number, optional, default: 10, min:1, max:100), validated by `validateSchema` (zod).
        *   **Functionality (Current - Mixed Implementation):**
            *   **Database Interactions (Implemented):**
                *   Retrieves the specified `DataSource` using `googleSheetsQueries.getDataSourceById`.
                *   Fetches existing `ColumnMapping`s for the `DataSource` using `googleSheetsQueries.getColumnMappings`.
            *   **Google Sheets API Interaction (Placeholder):**
                *   The core logic for fetching data from Google Sheets, performing data type checks, comparing against mappings, and generating actual validation statistics or sample data is **not yet implemented**. A `TODO` comment states: `// TODO: Implement actual validation with Google Sheets API`.
                *   Returns **mock validation results** including a hardcoded `isValid` status, mock errors/warnings, statistics, and sample data rows.
        *   **Response (Partially Mock):** Returns `ApiResponse.success` with a `ValidateResponse` object containing:
            *   `dataSource`: Basic info (`id`, `name`, `sheetName`).
            *   `validation`: The mock validation results, including `isValid` (boolean), `sampleSize` (number), `errors` (array), `warnings` (array), `statistics` (object with row/column counts), and `sampleData` (array of row objects).
            *   `mappings`: The existing column mappings for the data source, transformed to include `metricName`.
        *   **Status:** This route has implemented the database interactions to fetch necessary context (data source info, mappings) but the actual validation against live Google Sheets data is a placeholder. The response structure is well-defined for when the GSheets API interaction is implemented.
        *   **Purpose (Intended):** To allow users to validate their Google Sheet data against the configured column mappings before initiating a full data sync. This would involve fetching a sample of rows from the sheet, checking for data type mismatches, identifying unmapped columns, and providing a preview of how the data would be interpreted, thereby catching potential issues early.
        *   **Type Exports:** `ValidateRequest`, `ValidateResponse`.

    -   **4.8.6. Example API Route: Google OAuth Connect (`/api/google/connect`):**
        *   **File:** `src/app/api/google/connect/route.ts`
        *   **HTTP Method:** `GET`
        *   **Authentication:** Requires `clinicAdmin` privileges (via `withAuth` middleware).
        *   **Purpose:** Initiates the Google OAuth 2.0 authentication flow, redirecting the user to Google's authorization server to grant permissions for accessing their Google Sheets/Drive data.
        *   **Request Query Parameter:** `dataSourceId` (string, required) - Used to associate the Google authentication with a specific data source in the application. This ID is passed along in the OAuth `state` parameter.
        *   **Core Logic:**
            1.  Validates the presence of `dataSourceId`.
            2.  Verifies the `DataSource` exists and the admin has access using `googleSheetsQueries.getDataSourceById`.
            3.  Checks for the `GOOGLE_REDIRECT_URI` environment variable (critical for OAuth flow).
            4.  Calls `generateAuthUrl(dataSourceId)` (from ` '@/services/google/auth'`) to construct the Google OAuth authorization URL. This service function encapsulates the logic for setting client ID, scopes (likely for Google Drive and Sheets), redirect URI, and including `dataSourceId` as state.
            5.  Redirects the user (HTTP 302) to the generated Google authorization URL.
        *   **Error Handling:** Uses `ApiError` for issues like missing `dataSourceId` (400), data source not found (404), or server misconfiguration (e.g., `GOOGLE_REDIRECT_URI` not set - 500). Catches errors from `generateAuthUrl`.
        *   **Status:** This route appears to be fully implemented for initiating the Google OAuth flow.
        *   **Key Dependencies:** `generateAuthUrl` service, `withAuth` middleware, `googleSheetsQueries`, `GOOGLE_REDIRECT_URI` environment variable.

    -   **4.8.7. Example API Route: Google OAuth Callback (`/api/google/callback`):**
        *   **File:** `src/app/api/google/callback/route.ts`
        *   **HTTP Method:** `GET`
        *   **Authentication:** Does not use `withAuth` as it's a direct callback from Google. Performs its own user authentication check (via Supabase) after receiving the callback and before processing tokens.
        *   **Purpose:** Handles the redirect from Google after the user authorizes (or denies) application access. It exchanges the received authorization code for access and refresh tokens, then securely stores these tokens associated with the relevant `DataSource`.
        *   **Request Query Parameters (from Google):**
            *   `code`: Authorization code (if successful).
            *   `state`: The `dataSourceId` passed during the connect phase.
            *   `error`: Error identifier (if authorization failed).
        *   **Core Logic:**
            1.  Extracts `code`, `state` (as `dataSourceId`), and `error` from query parameters.
            2.  Handles initial errors (Google-reported error, missing code/state) by redirecting to a frontend page (`/integrations/google-sheets/test`) with error parameters.
            3.  Authenticates the current user via Supabase server client (`supabase.auth.getUser()`) and retrieves their `authContext`.
            4.  Validates that the `DataSource` (identified by `dataSourceId` from `state`) exists and the authenticated user has access.
            5.  Calls `handleAuthCallback(code)` (from ` '@/services/google/auth'`) to exchange the authorization code for Google API tokens (access token, refresh token, expiry date).
            6.  Calls `googleSheetsQueries.updateDataSourceTokens` to store these tokens in the database, linking them to the `dataSourceId`.
            7.  Redirects to the frontend page (`/integrations/google-sheets/test`) with success status and `dataSourceId`.
        *   **Error Handling:** Comprehensive error handling for OAuth errors, missing parameters, user authentication failures, data source validation issues, token exchange failures, and database update failures. All errors lead to a redirect to the frontend test page with specific error messages in query parameters.
        *   **Status:** This route appears to be fully implemented for handling the Google OAuth callback, token exchange, and storage.
        *   **Key Dependencies:** `handleAuthCallback` service, `googleSheetsQueries`, `getAuthContextByAuthId`, Supabase server client.

    -   **4.8.8. Example API Route: Financial Metrics (`/api/metrics/financial`):**
        *   **File:** `src/app/api/metrics/financial/route.ts`
        *   **HTTP Method:** `GET` (currently)
        *   **Authentication:** None explicitly applied in the placeholder.
        *   **Functionality (Current):** Returns a static JSON response: `Response.json({ message: "Financial Metrics" })`.
        *   **Status:** Placeholder. The actual logic for fetching, calculating, and returning financial metrics (likely involving database queries for `MetricValue` records, filtering by financial metric definitions, date ranges, and clinic context) is not yet implemented.
        *   **Purpose (Intended):** To provide an endpoint for retrieving various financial metrics for a clinic, such as production, collections, adjustments, etc., potentially aggregated over specified time periods.

    -   **4.8.9. Example API Route: Patient Metrics (`/api/metrics/patients`):**
        *   **File:** `src/app/api/metrics/patients/route.ts`
        *   **HTTP Method:** `GET` (currently)
        *   **Authentication:** None explicitly applied in the placeholder.
        *   **Functionality (Current):** Returns a static JSON response: `Response.json({ message: "Patient Metrics" })`.
        *   **Status:** Placeholder. The actual logic for fetching, calculating, and returning patient-related metrics (e.g., new patient counts, active patients, demographic distributions, appointment adherence) is not yet implemented.
        *   **Purpose (Intended):** To provide an endpoint for retrieving key metrics related to the patient population of a clinic, supporting analysis of patient growth, retention, and characteristics.

    -   **4.8.10. Example API Route: Appointment Metrics (`/api/metrics/appointments`):**
        *   **File:** `src/app/api/metrics/appointments/route.ts`
        *   **HTTP Method:** `GET` (currently)
        *   **Authentication:** None explicitly applied in the placeholder.
        *   **Functionality (Current):** Returns a static JSON response: `Response.json({ message: "Appointment Metrics" })`.
        *   **Status:** Placeholder. The actual logic for fetching, calculating, and returning appointment-related metrics (e.g., scheduled, completed, canceled, no-show rates, booking lead times) is not yet implemented.
        *   **Purpose (Intended):** To provide an endpoint for retrieving key metrics related to dental appointments, helping to analyze operational efficiency, provider utilization, and patient compliance.
        *   **Note on Metric Routes:** Based on the `financial`, `patients`, and `appointments` metric routes, it's observed that specific metric category API endpoints under `/api/metrics/` are currently placeholders. It is likely that `/api/metrics/providers/route.ts` and `/api/metrics/calls/route.ts` follow the same pattern.

    -   **4.8.11. Example API Route: Goals Collection (`/api/goals`):**
        *   **File:** `src/app/api/goals/route.ts`
        *   **HTTP Methods:** `GET`, `POST`
        *   **Authentication:** Both `GET` and `POST` handlers require authentication via `withAuth` middleware.
        *   **Purpose:** Manages the collection of goals, allowing for listing goals with filtering and pagination, and creating new goals either directly or from templates.
        *   **`GET` Handler (List Goals):**
            *   **Query Parameters:** Supports filtering by `clinicId`, `providerId`, `metricDefinitionId`, `active` (boolean string), `timePeriod`. Supports pagination via `limit` and `offset`. Optionally includes goal progress calculation via `includeProgress=true`.
            *   **Logic:** Calls `goalQueries.getGoals` with `authContext` and parsed filter/pagination options.
            *   **Response:** Returns a paginated JSON response (`ApiResponse.paginated`) containing the list of goals, total count, page, and limit.
        *   **`POST` Handler (Create Goal):**
            *   **Request Body Validation:** Uses Zod schemas (`createGoalSchema`, `createFromTemplateSchema`) for robust validation.
            *   **Functionality:** Supports two creation modes:
                1.  **From Template:** If `templateId` is provided in the body. Calls `goalQueries.createGoalFromTemplate`.
                2.  **Direct Creation:** If no `templateId`. Calls `goalQueries.createGoal`.
            *   **Input (Direct):** `metricDefinitionId`, `timePeriod`, `startDate`, `endDate`, `targetValue`, `clinicId`, `providerId` (optional).
            *   **Input (Template):** `templateId`, `clinicId`, `startDate`, `endDate`, `providerId` (optional), `targetValue` (optional - overrides template).
            *   **Response:** Returns `ApiResponse.created` with the newly created goal object.
        *   **Error Handling:** Uses `ApiError` for structured responses (e.g., bad request for Zod failures, forbidden/not found for query errors).
        *   **Status:** Appears to be fully implemented and provides comprehensive goal management features.
        *   **Key Dependencies:** `withAuth`, `goalQueries`, Zod, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GetGoalsResponse`, `CreateGoalResponse`.

    -   **4.8.12. Example API Route: Individual Goal (`/api/goals/[goalId]`):**
        *   **File:** `src/app/api/goals/[goalId]/route.ts`
        *   **HTTP Methods:** `GET`, `PUT`, `DELETE`
        *   **Authentication:** All handlers use `withAuth`. `PUT` and `DELETE` additionally specify `{ requireClinicAdmin: true }` (and `PUT` includes an explicit role check).
        *   **Purpose:** Manages individual goals identified by `goalId`.
        *   **`GET` Handler (Fetch Goal):**
            *   **Logic:** Calls `goalQueries.getGoalById`.
            *   **Response:** Returns goal data or a 404 `ApiError` if not found.
        *   **`PUT` Handler (Update Goal):**
            *   **Request Body Validation:** Uses Zod schema `updateGoalSchema`.
            *   **Logic:** Checks goal existence, verifies user permissions (admin/clinic_admin), then calls `goalQueries.updateGoal`.
            *   **Response:** Returns updated goal data or appropriate `ApiError` (404, 403).
        *   **`DELETE` Handler (Soft-Delete Goal):**
            *   **Logic:** Checks goal existence, then calls `goalQueries.updateGoal` to set status to "cancelled".
            *   **Response:** Returns success status or 404 `ApiError`.
        *   **Error Handling:** Consistent use of `ApiError` for specific error conditions.
        *   **Status:** Appears to be fully implemented for managing individual goals.
        *   **Key Dependencies:** `withAuth`, `goalQueries`, Zod, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GoalResponse`, `UpdateGoalInput`.

    -   **4.8.13. Example API Route: Users Collection (`/api/users`):**
        *   **File:** `src/app/api/users/route.ts`
        *   **HTTP Methods:** `GET`, `POST`.
        *   **Authentication:** Both handlers use `withAuth`.
        *   **Purpose:** Manages the collection of users, primarily for listing users and creating new users.
        *   **`GET` Handler (List Users):**
            *   **Query Parameters:** Supports filtering by `clinicId`, `role`. Supports pagination via `limit`, `offset`.
            *   **Logic:** Calls `userQueries.getUsers`.
            *   **Response:** Paginated JSON response (`ApiResponse.paginated`) with user list, total, page, limit.
        *   **`POST` Handler (Create User):**
            *   **Request Body Validation:** Uses Zod schema `createUserSchema` (requires `email`, `name`, `role` (enum: "office_manager", "dentist", "front_desk", "admin"), `clinicId`). An optional `authId` can be part of the input to `userQueries.createUser` (though not explicitly in the API's Zod schema for `POST /api/users` body, it's part of the `CreateUserInput` type in `userQueries`).
            *   **Logic:** Calls `userQueries.createUser(authContext, body)`. 
                *   This query function validates that the calling user is a clinic admin for the target clinic.
                *   It then creates records in the application's `User` and `UserClinicRole` tables within a database transaction.
                *   **Important Note on User Invitation:** `userQueries.createUser` (called by this endpoint) **only manages records in the application's own database** (`User` and `UserClinicRole` tables). It **does not** interact with Supabase Auth to send an email invitation or create a Supabase Auth user. As of the current review, there is **no dedicated API endpoint** (e.g., `/api/users/invite`) to trigger Supabase Auth email invitations. This part of the user lifecycle (initiating the Supabase Auth account and sending an invite) must be handled through other means (e.g., Supabase console, a yet-to-be-developed server action calling Supabase admin functions, or a new dedicated API route).
            *   **Response:** `ApiResponse.created` with the new application user data or `ApiError.forbidden` if permissions are insufficient.
        *   **Note on `PATCH`/`DELETE` in this file:** This file also contains `PATCH` and `DELETE` handlers that attempt to parse a `userId` from the path. These are architecturally unconventional for a collection route and are superseded by the handlers in `src/app/api/users/[userId]/route.ts`.
        *   **Status:** `GET` and `POST` handlers are conventional and appear fully implemented. The `PATCH` and `DELETE` handlers in this file should be considered deprecated or misplaced.
        *   **Key Dependencies:** `withAuth`, `userQueries`, Zod, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GetUsersResponse`, `CreateUserResponse`.

    -   **4.8.14. Example API Route: Individual User (`/api/users/[userId]`):**
        *   **File:** `src/app/api/users/[userId]/route.ts`
        *   **HTTP Methods:** `GET`, `PATCH`, `DELETE`.
        *   **Authentication:** All handlers use `withAuth`.
        *   **Purpose:** Manages individual users identified by `userId` from the path parameter.
        *   **`GET` Handler (Fetch User by ID):**
            *   **Logic:** Extracts `userId` from `params`. Calls `userQueries.getUserById`.
            *   **Response:** Returns user data or `ApiError` (404 for not found, 403 for access denied).
        *   **`PATCH` Handler (Update User):**
            *   **Request Body Validation:** Uses Zod schema `updateUserSchema` (optional `name`, `role`, `lastLogin`). Note: `role` is a string here, differing from the enum in `createUserSchema`.
            *   **Logic:** Extracts `userId` from `params`. Converts `lastLogin` to `Date`. Calls `userQueries.updateUser`.
            *   **Response:** Returns updated user data or `ApiError` (404 for not found, 403 for permission denied).
        *   **`DELETE` Handler (Delete User):**
            *   **Logic:** Extracts `userId` from `params`. Calls `userQueries.deleteUser`.
            *   **Response:** Returns success status or `ApiError` (404 for not found, 403 for permission denied by non-clinic-admin).
        *   **Error Handling:** Consistent use of `ApiError` for specific error conditions.
        *   **Status:** Appears to be fully implemented and correctly structured for managing individual user resources.
        *   **Key Dependencies:** `withAuth`, `userQueries`, Zod, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GetUserResponse`, `UpdateUserResponse`.

    -   **4.8.15. Example API Route: Clinics Collection (`/api/clinics`):**
        *   **File:** `src/app/api/clinics/route.ts`
        *   **HTTP Methods:** `GET`, `POST`.
        *   **Purpose:** Manages the collection of clinics, for listing accessible clinics and creating new clinics.
        *   **`GET` Handler (List Clinics):**
            *   **Authentication:** `withAuth` (any authenticated user).
            *   **Query Parameters:** Supports `includeInactive` (boolean) and pagination (`limit`, `offset`).
            *   **Logic:** Calls `clinicQueries.getClinics`, respecting user's clinic associations via `authContext`.
            *   **Response:** Paginated JSON (`ApiResponse.paginated`) with clinics list, total, page, limit.
        *   **`POST` Handler (Create Clinic):**
            *   **Authentication:** `withAuth` with `{ requireAdmin: true }` (global administrators only).
            *   **Request Body Validation:** Uses Zod schema `createClinicSchema` (requires `name`, `location`; optional `status`).
            *   **Logic:** Calls `clinicQueries.createClinic`.
            *   **Response:** `ApiResponse.created` with new clinic data or `ApiError.forbidden` if not admin.
        *   **Error Handling:** Consistent use of `ApiError`.
        *   **Status:** Appears fully implemented for listing and creation, with appropriate access controls.
        *   **Key Dependencies:** `withAuth`, `clinicQueries`, Zod, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GetClinicsResponse`, `GetClinicResponse`, `CreateClinicResponse`.

    -   **4.8.16. Example API Route: Individual Clinic (`/api/clinics/[clinicId]`):**
        *   **File:** `src/app/api/clinics/[clinicId]/route.ts`
        *   **HTTP Methods:** `GET`, `PATCH`.
        *   **Purpose:** Manages individual clinics identified by `clinicId`.
        *   **`GET` Handler (Fetch Clinic by ID):**
            *   **Authentication:** `withAuth` (user must have access to the clinic).
            *   **Query Parameters:** Supports `includeProviders`, `includeUsers`, `includeMetrics` (booleans) for conditional data inclusion.
            *   **Logic:** Extracts `clinicId` from `params`. Calls `clinicQueries.getClinicById`.
            *   **Response:** Returns clinic data or `ApiError` (404 for not found, 403 for access denied).
        *   **`PATCH` Handler (Update Clinic):**
            *   **Authentication:** `withAuth` (user must be clinic admin for this clinic, checked in `clinicQueries.updateClinic`).
            *   **Request Body Validation:** Uses Zod schema `updateClinicSchema` (optional `name`, `location`, `status`).
            *   **Logic:** Extracts `clinicId` from `params`. Calls `clinicQueries.updateClinic`.
            *   **Response:** Returns updated clinic data or `ApiError.forbidden`.
        *   **Note on `DELETE`:** No `DELETE` handler is present in this file. Clinic deletion might be handled differently or restricted.
        *   **Error Handling:** Consistent use of `ApiError`.
        *   **Status:** Appears fully implemented for fetching and updating specific clinics.
        *   **Key Dependencies:** `withAuth`, `clinicQueries`, Zod, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GetClinicResponse`, `UpdateClinicResponse`, `GetClinicStatsResponse`.

    -   **4.8.17. Example API Route: Clinic Statistics (`/api/clinics/[clinicId]/statistics`):**
        *   **File:** `src/app/api/clinics/[clinicId]/statistics/route.ts`
        *   **HTTP Methods:** `GET`.
        *   **Purpose:** Fetches aggregated statistics for a specific clinic.
        *   **Authentication:** `withAuth` (user must have access to the clinic, checked in `clinicQueries`).
        *   **Query Parameters:** Supports `startDate` and `endDate` for filtering statistics by a date range (processed by `getDateRangeParams`).
        *   **Logic:** Extracts `clinicId` from `params`. Calls `clinicQueries.getClinicStatistics` with date range.
        *   **Response:** Returns statistics data or `ApiError.forbidden` if access is denied.
        *   **Error Handling:** Standard `ApiError` usage.
        *   **Status:** Appears fully implemented.
        *   **Key Dependencies:** `withAuth`, `clinicQueries`, `getDateRangeParams`, `ApiResponse`, `ApiError`.
        *   **Type Exports:** `GetClinicStatisticsResponse`.

    -   **4.8.18. Example API Route: Providers Collection (`/api/providers`):**
        *   **File:** `src/app/api/providers/route.ts`
        *   **HTTP Methods:** `GET`, `POST`.
        *   **Purpose:** Manages the collection of providers (listing and creation).
        *   **Authentication & Authorization:** 
            *   **CRITICAL ISSUE: This route currently lacks `withAuth` middleware or any other form of authentication/authorization.** As a result, these endpoints are unprotected and accessible by any unauthenticated client.
        *   **`GET` Handler (List All Providers):**
            *   **Logic:** Fetches all providers directly using `prisma.provider.findMany()`. Includes basic clinic info. No filtering or pagination.
            *   **Response:** JSON array of all providers or a 500 error.
        *   **`POST` Handler (Create Provider):**
            *   **Request Body:** Expects `name`, `clinic_id`, and optional `first_name`, `last_name`, `email`, `provider_type`, `position`.
            *   **Validation:** Basic check for `name` and `clinic_id`. No Zod schema used.
            *   **Logic:** Creates a provider directly using `prisma.provider.create()`. Sets default `providerType` to 'other' and `status` to 'active'.
            *   **Response:** Created provider data with 201 status, or 400/409/500 errors for specific issues.
        *   **Individual Provider Operations:** Operations for fetching, updating, or deleting individual providers are not present in this file.
        *   **Status:** Provides basic list and create functionality but has significant security vulnerabilities due to lack of authentication. Lacks robust validation and a query abstraction layer.
        *   **Key Dependencies:** `prisma` (direct usage).
        *   **Type Exports:** None explicitly defined in this file for API responses.

    -   **4.8.19. Example API Route: CSV Export (`/api/export/csv`):**
        *   **File:** `src/app/api/export/csv/route.ts`
        *   **HTTP Methods:** `POST` (currently).
        *   **Purpose:** Intended for exporting data in CSV format.
        *   **Authentication:** None (as it's a placeholder).
        *   **Logic:** Currently returns a static JSON response: `{ message: "Export CSV" }`.
        *   **Status:** Placeholder, not implemented.

    -   **4.8.20. Example API Route: PDF Export (`/api/export/pdf`):**
        *   **File:** `src/app/api/export/pdf/route.ts`
        *   **HTTP Methods:** `POST` (currently).
        *   **Purpose:** Intended for exporting data in PDF format.
        *   **Authentication:** None (as it's a placeholder).
        *   **Logic:** Currently returns a static JSON response: `{ message: "Export PDF" }`.
        *   **Status:** Placeholder, not implemented.

    -   **4.8.21. Example API Route: Hygiene Production Sync (`/api/hygiene-production/sync`):**
        *   **File:** `src/app/api/hygiene-production/sync/route.ts`
        *   **HTTP Methods:** `POST`.
        *   **Purpose:** Handles bulk upserting of hygiene production records, designed to be called by an external system (e.g., Google Apps Script).
        *   **Authentication:** 
            *   Does not use `withAuth` middleware.
            *   Relies on a `supabase_key` field in the request body, compared against `process.env.SUPABASE_ANON_KEY`.
            *   **Security Warning:** Using the public Supabase anonymous key for server-to-server authentication is insecure and not recommended. A dedicated secret API key or a more robust mechanism (e.g., JWT) should be implemented.
        *   **Request Body Validation:** Uses Zod schema `hygieneProductionSyncSchema` for an array of `records` and the `supabase_key`.
            *   Each record includes fields like `date`, `month_tab`, `hours_worked`, `estimated_production`, `verified_production`, `clinic_id`, `provider_id`, etc.
        *   **Logic:**
            1.  Validates request body and authenticates using `supabase_key`.
            2.  Groups records by `clinic_id`.
            3.  For each clinic's records:
                *   Verifies clinic existence.
                *   Creates a minimal 'system' `authContext`.
                *   Transforms records to match the format for `upsertHygieneProduction` query.
                *   Calls `upsertHygieneProduction` to save data.
        *   **Response:** Returns `ApiResponse.success` with a summary object including `totalRecords`, `clinicsProcessed`, and arrays for `results` (per-clinic successes) and `errors` (per-clinic failures). Returns 401 for auth failure.
        *   **Error Handling:** Handles unauthorized access, non-existent clinics, and logs errors during per-clinic processing.
        *   **Status:** Functionally implemented for its purpose, but with a significant authentication security concern.
        *   **Key Dependencies:** Zod, `ApiResponse`, `ApiError`, `prisma` (direct clinic lookup), `upsertHygieneProduction` query.

    -   **4.8.22. Example API Route: Hygiene Production Test (`/api/hygiene-production/test`):**
        *   **File:** `src/app/api/hygiene-production/test/route.ts`
        *   **HTTP Methods:** `GET`.
        *   **Purpose:** Retrieves hygiene production records for a specified clinic and optional date, along with related clinic and provider information. Intended for testing data retrieval and integrity.
        *   **Authentication:** 
            *   Does not use `withAuth` middleware.
            *   Creates a hardcoded 'test' `authContext` with admin privileges for the `clinicId` passed in the query parameters.
            *   **Security Note:** This allows unauthenticated access to hygiene production data for any clinic if the endpoint is publicly accessible. Should be secured or restricted in production.
        *   **Request Query Parameters:** `clinicId` (required), `date` (optional).
        *   **Logic:**
            1.  Extracts `clinicId` and `date`.
            2.  Calls `getHygieneProduction` with the test `authContext` and a limit of 10 records.
            3.  Fetches related clinic and provider details using `prisma`.
        *   **Response:** `ApiResponse.success` with an object containing `clinic` info, `providers` list, `records` (hygiene production data), and a `summary`.
        *   **Error Handling:** Returns 400 for missing `clinicId`, 500 for other errors.
        *   **Status:** Functionally implemented for testing. Authentication method is a potential security risk if exposed.
        *   **Key Dependencies:** `ApiResponse`, `getHygieneProduction` query, `prisma`.

-   **4.9. State Management:**
    *   **Server Components:** Default for data fetching and rendering static or server-processed content.
    *   **Client Components (`'use client'`):** For interactive UI elements.
    *   **React Context:** For simple, localized client-side state sharing.
    *   **Zustand:** For more complex global client-side state management if needed.
    *   **TanStack Query / SWR:** For managing asynchronous server state on the client, including caching, refetching, and optimistic updates.

-   **4.10. Testing:**
    *   **Vitest:** Test runner for unit and integration tests.
    *   Test files are typically co-located with components or in `src/tests/`.
    *   Run tests: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`.
    *   Configuration in `vitest.config.ts` and `vitest.integration.config.ts`.

-   **4.11. Task Management (Task Magic System):
    *   Core of the AI-assisted development workflow, managed via the Task Master CLI (`scripts/dev.js`).
    *   Tasks defined in Markdown files in `.ai/tasks/`.
    *   Master checklist in `.ai/TASKS.md`.
    *   Completed tasks archived in `.ai/memory/tasks/` and logged in `.ai/memory/TASKS_LOG.md`.
    *   PRDs in `.ai/plans/` can be parsed to generate tasks.
    *   Refer to `README-task-master.md` and `.windsurf/rules/task-magic/` for details.

-   **4.12. Database Migrations:**
    *   **Prisma Migrate:** `pnpm prisma migrate dev` for schema changes. Migrations stored in `prisma/migrations/`.
    *   **Prisma Generate:** `pnpm prisma generate` to update Prisma Client after schema changes.
    *   **Custom Data Migrations:** Scripts in `scripts/data-migration/` (e.g., `migrate-to-uuid.ts`) for complex data transformations not handled by schema migrations. Run using `tsx`.

-   **4.13. Logging:**
    *   **Winston:** Configured in `src/lib/logger.ts` (assumption, based on guidelines).
    *   Follow `winston-logging-guidelines.md` for structured and contextual logging.

-   **4.14. Environment Variables:**
    *   Managed in `.env` (local, gitignored) and `.env.example` (template).
    *   Next.js automatically loads variables prefixed with `NEXT_PUBLIC_` into the browser bundle.

-   **4.15. Deployment: (*To be detailed further - likely Vercel for Next.js*)

## 5. Future Considerations & Roadmap Ideas
   - (*To be populated as project understanding deepens or based on PRDs/Task Lists*)
   - Potential enhancements based on target audience needs.
   - Areas for refactoring (e.g., clarifying `actions/` and `services/` role).
   - Expanding AI-driven features within the dashboard itself.


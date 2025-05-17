# System Patterns: Dental Practice Analytics Dashboard
*Version: 1.0*
*Created: 2025-05-17*
*Last Updated: 2025-05-18*

## Architecture Overview
The Dental Practice Analytics Dashboard will adopt a layered architecture focusing on a clear separation of concerns. It leverages Next.js for both frontend (App Router) and backend (API Routes, Server Actions) capabilities, with Supabase (PostgreSQL) as the database and Prisma as the ORM. The system is designed to be modular, allowing for independent development and testing of its various layers: Data Layer, Business Logic Layer, API Layer, and Presentation Layer. State management will be handled by React Query for server state and Zustand for UI state.

## Key Components

### 1. Data Layer
- **Responsibilities:** Database schema management (Prisma), data access and manipulation (Repositories), Google Sheets API integration (successfully implemented for discovery and data extraction), data transformation and normalization, caching.
- **Key Sub-Components:**
    - `Prisma Models & Migrations`: Defines and evolves the database schema.
    - `Repositories`: Abstracts data access logic (e.g., `ClinicRepository`, `MetricRepository`).
    - `Google Sheets Connector Services`: Handles authentication, discovery, and data extraction from Google Sheets. (Successfully implemented as per Task 4).
    - `Data Transformation Services`: Cleans, standardizes, and prepares raw data for storage and use.
    - `Caching Mechanisms`: (To be implemented, e.g., at service or query level).

### 2. Business Logic Layer (Services)
- **Responsibilities:** Implementing business rules and calculations, authorization and permission checks, metric computation and aggregation, goal tracking and comparison logic, data validation.
- **Key Sub-Components:**
    - `Service Modules`: Grouped by domain (e.g., `src/services/financial`, `src/services/appointments`, `src/services/google/sheets.ts`, `src/services/KPIs`). Each service encapsulates specific business operations.
    - `Validation Libraries/Utilities`: (e.g., Zod schemas) for validating input data and business rules.
    - `Authorization Logic`: Integrated within services or via middleware to ensure users access appropriate data based on their roles.
    - `Calculation Engines`: For complex metrics and KPI computations.

### 3. API Layer
- **Responsibilities:** Exposing consistent RESTful endpoints (via Next.js API Routes) and Server Actions for data mutation, request validation, response formatting, error handling, and security.
- **Key Sub-Components:**
    - `Next.js API Routes` (e.g., `src/app/api/[domain]/route.ts`): For data fetching operations initiated by the client.
    - `Next.js Server Actions` (e.g., `src/actions/[domain]/actions.ts`): For data mutation operations, providing a direct RPC-like mechanism from client to server.
    - `Middleware`: For common concerns like authentication (Supabase Auth), logging, and error handling.
    - `API Documentation`: (Future consideration, e.g., OpenAPI/Swagger if external API exposure is needed).

### 4. Presentation Layer (UI)
- **Responsibilities:** User interface rendering (Next.js React Server Components and Client Components), data visualization (Recharts), user interaction handling, layout, and responsive design (Tailwind CSS, shadcn/ui).
- **Key Sub-Components:**
    - `Next.js Pages/Views`: Located in `src/app/`, structured using the App Router conventions.
    - `Reusable UI Components`: Located in `src/components/`, built with shadcn/ui and Tailwind CSS.
    - `Chart Components`: Specific Recharts implementations in `src/components/charts/`.
    - `Layout Components`: In `src/components/layout/` for consistent page structure.
    - `Forms`: (Future Phase) For data entry, in `src/components/forms/`.
    - `Navigation Structure`: The dashboard employs a sidebar navigation pattern (`src/components/ui/sidebar.tsx`) that organizes access to key areas:
        - **Dashboard Section**:
            - Overview - Main dashboard with KPI summary
            - Clinics - Clinic-specific metrics and comparisons
            - Providers - Provider performance analytics
        - **Metrics Section**:
            - Financial - Production, collections, and payment metrics
            - Patients - Patient statistics (active, new, recare)
            - Appointments - Appointment analytics and scheduling metrics
            - Treatment Plans - Treatment plan acceptance and tracking
            - Call Tracking - Call performance metrics
        - **Data & Reports Section**:
            - Google Sheets - Connection and mapping interface
            - Reports - Comprehensive reporting views
            - Goals - Goal tracking and variance analysis
        - **Administration**:
            - Settings - Application and user settings
            - User Profile - Account management

### 5. State Management
- **Responsibilities:** Managing UI state, handling server data caching and synchronization, optimistic updates.
- **Key Sub-Components:**
    - `React Query`: For managing server state, caching, and data fetching operations.
    - `Zustand`: For managing global or complex local UI state.
    - `React Context`: For simpler, localized UI state sharing if needed.

## Design Patterns
- **Repository Pattern:** To abstract data access logic, making services independent of the specific data source implementation (Prisma).
- **Service Layer Pattern:** To encapsulate business logic, promoting reusability and separation from API/UI concerns.
- **Adapter Pattern:** For Google Sheets API integration, isolating external API specifics.
- **Layered Architecture:** As described above, for separation of concerns.
- **Server Components & Client Components (Next.js):** To optimize rendering and interactivity.
- **Provider Pattern (React Context):** For dependency injection or global state where appropriate.

## Data Flow
1.  **Data Ingestion (Google Sheets):** (Core functionality for connection, discovery, and basic extraction is now complete)
    *   User authenticates via Google OAuth. (Implemented)
    *   `Google Sheets Connector Service` lists available spreadsheets. (Implemented)
    *   User maps columns via UI. Mapping stored in `ColumnMappings` table.
    *   Scheduled or manual sync triggers `Data Transformation Service`.
    *   Transformed data stored in `MetricValues` table.
2.  **Data Display (Dashboard):**
    *   User navigates to a dashboard page (Next.js Server Component or Client Component using React Query).
    *   Page/Component requests data via:
        *   Direct call to a `Service` method (Server Components).
        *   Fetching from a Next.js `API Route` (Client Components with React Query), which in turn calls a `Service` method.
    *   `Service` method uses `Repository` to fetch data from Supabase (Prisma).
    *   `Service` performs necessary calculations/aggregations.
    *   Data is returned to the Presentation Layer.
    *   `Recharts` components visualize the data.
3.  **Data Mutation (Future - Forms):**
    *   User submits a form.
    *   Client-side validation occurs.
    *   A Next.js `Server Action` is called.
    *   Server Action validates input (e.g., using Zod via a `Service`).
    *   Server Action calls appropriate `Service` method to process and save data using a `Repository`.
    *   Server Action returns response; client UI updates (possibly with `revalidatePath` or React Query cache updates).

## Dashboard Navigation & User Experience
The dashboard implements a consistent navigation experience that aligns with the PRD requirements:

1. **Collapsible Sidebar**:
   - Expands on hover (desktop) for better space utilization
   - Toggles via menu button on mobile devices
   - Shows only icons in collapsed state to maximize content area

2. **Navigation Structure**:
   - Organized into logical groups matching the dental practice workflow
   - Primary sections include Dashboard, Metrics, Data & Reports
   - Each section contains relevant subsections (e.g., Financial metrics, Patient metrics)

3. **Responsive Design**:
   - Adapts to different screen sizes (mobile, tablet, desktop)
   - Sidebar collapses automatically on smaller screens
   - Header with context-aware breadcrumb navigation

4. **Context Awareness**:
   - Active route highlighting
   - Breadcrumb navigation shows current location
   - Consistent header with user profile access

This navigation structure directly maps to the PRD requirements for multi-level filtering and analysis, allowing users to easily access clinic-level comparisons, provider-specific dashboards, and different metric categories.

## Key Technical Decisions
- **Monorepo Structure (pnpm workspaces):** Adopted for potential future scalability, though initially might be a single application package. The provided `prd.txt` suggests a single `dental-dashboard` project.
- **Next.js App Router:** For modern React features, server components, and simplified routing.
- **Supabase as BaaS:** Leveraged for PostgreSQL database and Auth, simplifying backend setup.
- **Prisma as ORM:** For type-safe database interactions and migration management.
- **shadcn/ui with Tailwind CSS:** For rapid development of a professional and customizable UI.
- **Server Actions for Mutations:** Preferred over traditional API routes for mutations due to closer integration with React components and simplified data revalidation.
- **Services for Business Logic:** All core business logic, calculations, and data transformations will reside in service files (`src/services/`) to ensure it's decoupled from UI and API layers.

## Component Relationships (High-Level)
- **UI Components (`src/components`)** are used by **Pages/Views (`src/app`)**.
- **Pages/Views** and **Client Components** interact with the **API Layer** (API Routes using React Query) or directly with **Server Actions**.
- **Server Components** can directly interact with the **Business Logic Layer (Services)**.
- **The API Layer (API Routes and Server Actions)** uses the **Business Logic Layer (Services)**.
- **The Business Logic Layer (Services)** uses the **Data Layer (Repositories)**.
- **Repositories** interact with the **Database (Supabase via Prisma)** and external sources like **Google Sheets API (via Google Sheets Connector Service)**.

---

*This document captures the system architecture and design patterns used in the project.* 
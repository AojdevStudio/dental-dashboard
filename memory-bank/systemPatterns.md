# System Patterns: Dental Practice Analytics Dashboard
*Version: 1.1*
*Created: 2025-05-17*
*Last Updated: 2025-01-15*

## Architecture Overview
The Dental Practice Analytics Dashboard (MVP) adopts a layered architecture. It leverages Next.js (App Router) for frontend and API Routes. **Supabase Edge Functions will be the primary location for complex calculations, data transformations, and business logic, augmented by Next.js API Routes where appropriate.** Supabase (PostgreSQL) serves as the database with Prisma as the ORM. The system is designed for modularity across its Data Layer, Business Logic Layer (primarily in Edge Functions), API Layer, and Presentation Layer. State management uses React Query (TanStack Query) for server state and Zustand for minimal global UI state.

## Key Components

### 1. Data Layer
- **Responsibilities:** Database schema management (Prisma as per `.dev/database-schema-design.md` and `.dev/database-schema-metrics.md`), data access (Repositories), Google Sheets API integration for data extraction (OAuth, discovery, pre-defined mapping templates as per `.dev/feature-spec.md`), MVP-scoped data transformation (Edge Functions), and caching.
- **Key Sub-Components:**
    - `Prisma Models & Migrations`: Defines and evolves the database schema according to MVP specifications.
    - `Repositories`: Abstract data access logic (e.g., `ClinicRepository`, `MetricRepository`).
    - `Google Sheets Connector Services`: Handles authentication, discovery, and data extraction from Google Sheets (MVP scope: basic extraction, pre-defined templates).
    - `Data Transformation Services (Primarily Supabase Edge Functions)`: Cleans, standardizes, and prepares raw data for storage and use, focusing on MVP KPis.
    - `Caching Mechanisms`: (To be implemented, e.g., React Query for client-side, potential for server-side caching with Edge Functions).

### 2. Business Logic Layer (Primarily Supabase Edge Functions)
- **Responsibilities:** Implementing MVP-scoped business rules and calculations (e.g., for essential KPIs), authorization (RLS via Supabase), metric computation and aggregation for fixed dashboards, basic goal tracking logic, and data validation (Zod).
- **Key Sub-Components:**
    - `Supabase Edge Functions`: Grouped by domain (e.g., financial calculations, patient metric aggregation, Google Sheets sync processing, basic goal calculations). These functions will house the majority of complex business logic for the MVP.
    - `Next.js API Routes/Services (Minimal for MVP)`: May contain simpler business logic or act as a pass-through to Edge Functions if needed.
    - `Validation Libraries/Utilities (Zod)`: For validating input data and business rules within Edge Functions or API Routes.
    - `Authorization Logic (Supabase RLS)`: Primary mechanism for data isolation and access control.
    - `Calculation Engines (within Edge Functions)`: For MVP-specific metrics and KPI computations.

### 3. API Layer
- **Responsibilities:** Exposing consistent RESTful endpoints (via Next.js API Routes) that often trigger Supabase Edge Functions for data fetching and processing, request validation, response formatting, error handling, and security. **Enhanced with comprehensive authentication and OAuth integration.**
- **Key Sub-Components:**
    - `Next.js API Routes` (e.g., `src/app/api/[domain]/route.ts`): For data fetching operations initiated by the client, often acting as an interface to Supabase Edge Functions.
    - `Authentication API Routes`: Enhanced login, registration, and OAuth callback handling.
    - `Google Sheets API Routes`: OAuth integration, spreadsheet discovery, and data extraction endpoints.
    - `Middleware`: For common concerns like authentication (Supabase Auth), logging, and error handling.

### 4. Presentation Layer (UI)
- **Responsibilities:** User interface rendering (Next.js React Server Components and Client Components), data visualization for **fixed dashboards** (Recharts), user interaction handling, layout, and responsive design (Tailwind CSS, shadcn/ui). **Enhanced with comprehensive authentication flows and error handling.**
- **Key Sub-Components:**
    - `Next.js Pages/Views`: Located in `src/app/`, structured using the App Router conventions, adhering to the file structure in `.dev/file-system.md`.
    - `Authentication Components`: Multi-step registration form, enhanced login page, OAuth integration, loading and error states.
    - `Reusable UI Components`: Located in `src/components/`, built with shadcn/ui and Tailwind CSS, styled according to `.dev/design-brief.md`.
    - `Chart Components`: Specific Recharts implementations in `src/components/charts/` for MVP KPIs.
    - `Layout Components`: In `src/components/layout/` for consistent page structure (fixed layouts for MVP).
    - `Integration Components`: Google Sheets testing interface, data source management.
    - `Navigation Structure`: The dashboard employs a sidebar navigation pattern (`src/components/ui/sidebar.tsx`) that organizes access to key areas as per PRD/MVP focus:
        - **Dashboard Section**: Overview (main dashboard with MVP KPI summary), Clinics (basic clinic views), Providers (basic provider views).
        - **Metrics Section**: Financial, Patients, Appointments, Call Tracking (displaying MVP-defined core metrics).
        - **Data & Reports Section**: Google Sheets (connection and status), Goals (basic MVP goal display).
        - **Administration**: Settings, User Profile.

### 5. State Management
- **Responsibilities:** Managing UI state, handling server data caching and synchronization (via React Query), authentication state management.
- **Key Sub-Components:**
    - `React Query (TanStack Query)`: For managing server state, caching, and data fetching operations.
    - `Zustand`: For managing minimal global or complex local UI state, if necessary.
    - `Supabase Auth State`: Integrated authentication state management with proper session handling.

## Design Patterns

### Authentication Patterns
- **Multi-Step Registration Pattern:** Three-step process with validation at each stage and transaction-based data consistency.
- **Enhanced Login Pattern:** Database verification with proper error handling and automatic cleanup of partial states.
- **OAuth Integration Pattern:** Secure token management with proper callback handling and refresh mechanisms.

### Data Integration Patterns
- **Repository Pattern:** To abstract data access logic.
- **Service Layer Pattern (Primarily within Edge Functions):** To encapsulate business logic.
- **Adapter Pattern:** For Google Sheets API integration.
- **OAuth Token Management Pattern:** Secure storage and retrieval of API tokens with refresh capabilities.

### UI/UX Patterns
- **Loading State Pattern:** Consistent loading states across all pages with skeleton UI.
- **Error Boundary Pattern:** Comprehensive error handling with user-friendly messages.
- **Progressive Form Pattern:** Multi-step forms with validation and progress indicators.
- **Responsive Design Pattern:** Mobile-first approach with consistent breakpoints.

### Architecture Patterns
- **Layered Architecture:** As described above.
- **Server Components & Client Components (Next.js):** To optimize rendering.
- **Transaction Pattern:** For ensuring data consistency across multiple database operations.

## Data Flow (MVP Focus)

### 1. Authentication Flow
**Registration Flow:**
1. User accesses multi-step registration form (`RegisterFormComprehensive`)
2. Step 1: Account information validation (email, password, name)
3. Step 2: Role selection and clinic association (join existing or create new)
4. Step 3: Terms acceptance and registration summary
5. Form submission triggers transaction-based API (`/api/auth/register-comprehensive`)
6. API creates Supabase auth user, database user, clinic (if new), and role assignments
7. User receives email verification and is redirected to login

**Login Flow:**
1. User submits credentials via enhanced login form
2. `signInWithVerification` authenticates with Supabase Auth
3. System verifies user exists in database with proper clinic and role assignments
4. If verification fails, user is signed out and receives appropriate error message
5. Successful login redirects to dashboard with proper session state

**OAuth Flow (Google Sheets):**
1. User initiates Google OAuth from integration page
2. System redirects to Google OAuth with proper callback URL
3. Google redirects back with authorization code
4. Callback handler exchanges code for access/refresh tokens
5. Tokens are securely stored in data source record
6. User can now access Google Sheets integration features

### 2. Data Ingestion (Google Sheets - Enhanced)
1. **OAuth Authentication:** User authenticates via Google OAuth with secure token storage
2. **Spreadsheet Discovery:** System lists available spreadsheets using stored tokens
3. **Data Source Management:** Connection status tracking and token validation
4. **Data Extraction:** Fetch data with range support and proper error handling
5. **Testing Infrastructure:** Comprehensive testing page for validating integration
6. **Future Pipeline:** Pre-defined mapping templates and transformation (to be implemented)

### 3. Data Display (Fixed Dashboards)
*   User navigates to a dashboard page.
*   Page/Component (Client Component with React Query) fetches data from a Next.js `API Route`.
*   The `API Route` may call a **Supabase Edge Function** for data aggregation/computation.
*   Edge Function/API Route uses `Repository` (Prisma) to get data from Supabase.
*   Data is returned to the Presentation Layer.
*   `Recharts` components visualize the data on fixed dashboards.

## Dashboard Navigation & User Experience
The dashboard implements a consistent navigation experience:
1. **Collapsible Sidebar**: As previously defined, responsive for mobile and desktop.
2. **Navigation Structure**: Aligned with MVP core features: Dashboard (Overview, Clinics, Providers), Metrics (Financial, Patients, Appointments, Call Tracking), Data (Google Sheets, Goals), Admin (Settings, Profile).
3. **Responsive Design**: Adapts to different screen sizes with consistent breakpoints.
4. **Context Awareness**: Active route highlighting, breadcrumbs.
5. **Authentication States**: Proper handling of authenticated and unauthenticated states.

## Key Technical Decisions (MVP Focus)

### Core Architecture
- **Next.js App Router:** For modern React features with proper SSR/CSR optimization.
- **Supabase BaaS:** For PostgreSQL, Auth, and critically, **Edge Functions for backend business logic and data processing.**
- **Prisma as ORM:** For type-safe database interactions with multi-tenant support.
- **shadcn/ui with Tailwind CSS:** For consistent UI development with responsive design.

### Authentication & Security
- **Enhanced Supabase Auth:** With comprehensive database verification and proper error handling.
- **Multi-Step Registration:** For better user experience and data collection.
- **OAuth Integration:** For secure third-party API access (Google Sheets).
- **Transaction-Based Operations:** For data consistency across multiple database operations.

### Integration & Data Management
- **Google Sheets OAuth 2.0:** For secure API access with token refresh capabilities.
- **Data Source Pattern:** For managing multiple integration connections per clinic.
- **Testing Infrastructure:** Comprehensive testing framework before production implementation.
- **Focus on Supabase Edge Functions for Backend Logic:** Complex calculations, data transformations, and business logic will primarily reside in Supabase Edge Functions for the MVP.

### UI/UX Standards
- **Consistent Loading States:** Skeleton UI patterns across all pages.
- **Error Boundaries:** User-friendly error handling with proper recovery options.
- **Progressive Forms:** Multi-step forms with validation and progress indicators.
- **Responsive Design:** Mobile-first approach with consistent breakpoints.

## Component Relationships (High-Level - MVP)

### Authentication Flow
- **Auth Components (`src/components/auth`)** handle user registration and login
- **Auth Actions (`src/app/auth/actions.ts`)** manage server-side authentication logic
- **OAuth Actions (`src/actions/auth/oauth.ts`)** handle third-party authentication
- **Registration API (`src/app/api/auth/register-comprehensive`)** processes multi-step registration

### Data Integration Flow
- **Integration Pages (`src/app/(dashboard)/integrations`)** provide user interfaces for connections
- **Google Sheets APIs (`src/app/api/google/sheets`)** handle OAuth and data extraction
- **Google Services (`src/services/google`)** abstract Google API interactions
- **Data Source Management** stores and manages integration tokens and status

### UI Component Hierarchy
- **UI Components (`src/components`)** used by **Pages/Views (`src/app`)**.
- **Pages/Views (Client Components)** interact with **Next.js API Routes** (using React Query).
- **Server Components** (if used for data fetching) might directly call services that could invoke Edge Functions or simple data retrievals.
- **Next.js API Routes** primarily trigger or fetch data processed by **Supabase Edge Functions**.
- **Supabase Edge Functions (Business Logic)** use **Repositories (Data Layer)**.
- **Repositories** interact with **Supabase DB (Prisma)** and **Google Sheets API**.

---

*This document captures the system architecture and design patterns used in the project.* 
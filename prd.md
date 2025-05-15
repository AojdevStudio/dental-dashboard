<prd>
<overview>
The Dental Practice Analytics Dashboard is a centralized web application designed to visualize and analyze key performance indicators (KPIs) from dental practices. It connects to existing Google Spreadsheets via API, transforms raw data into actionable insights, and presents them through intuitive visualizations. The system will initially serve as a read-only dashboard and eventually evolve into a complete reporting platform with form-based data entry, replacing the current spreadsheet-based workflow. This solution addresses the critical need for cohesive data analysis across multiple dental practices and provides real-time performance visibility against established goals.
</overview>
<target_audience>
The primary users of this dashboard will be:

Office Managers - Responsible for overall practice performance monitoring, financial oversight, and staff management. They need comprehensive views across all metrics with the ability to drill down into specific areas.
Dentists/Providers - Need visibility into their individual performance metrics, treatment planning effectiveness, and patient-related statistics to optimize their clinical workflow.
Front Desk Staff - Require access to appointment metrics, patient statistics, and call performance data to improve operational efficiency and patient communication.

Each user type will have tailored dashboard views appropriate to their role while maintaining a consistent user experience across the application.
</target_audience>
<core_features>

Google Sheets Integration Engine

Secure OAuth connection to Google Sheets API
Visual interface for mapping spreadsheet columns to system metrics
Automated data synchronization with configurable frequency
Data transformation pipeline for normalizing and standardizing information
Support for historical data import and incremental updates


Comprehensive KPI Visualization

Interactive dashboards for financial metrics (production, collections, payments)
Provider performance analysis (production, treatment planning, procedure statistics)
Patient metrics (active patients, new patients, recare rates)
Appointment analytics (total appointments, hygiene breakdown, cancellation rates)
Call tracking performance (unscheduled treatment, hygiene reactivation)
Treatment plan acceptance and conversion reporting


Multi-Level Filtering and Analysis

Clinic-level comparative analysis
Provider-specific performance dashboards
Time-based filtering (daily, weekly, monthly, quarterly, annual)
Goal tracking and variance reporting
Trend analysis with historical comparisons


Customizable Dashboard System

Role-based dashboard templates
User-configurable widgets and layouts
Saved views for frequently accessed reports
Export capabilities for presentations and meetings


Form-Based Data Entry (Future Phase)

Custom form builder for different data collection needs
Mobile-friendly data entry interfaces
Data validation and business rule enforcement
Gradual migration path from spreadsheet-based to form-based reporting
</core_features>



<database_schema>
The database schema is designed to efficiently store and relate all dental practice metrics while supporting the transition from spreadsheet-based to form-based reporting:

Clinics

id (PK)
name
location
status (active/inactive)
created_at, updated_at


Users

id (PK)
email
name
role (office_manager, dentist, front_desk, admin)
clinic_id (FK to Clinics)
last_login
created_at, updated_at


Providers

id (PK)
name
provider_type (dentist, hygienist, specialist)
clinic_id (FK to Clinics)
status (active/inactive)
created_at, updated_at


MetricDefinitions

id (PK)
name
description
data_type (currency, percentage, integer, date)
calculation_formula (optional)
category (financial, patient, appointment, provider, treatment)
is_composite (boolean)
created_at, updated_at


DataSources

id (PK)
name
spreadsheet_id
sheet_name
last_synced_at
sync_frequency
connection_status
created_at, updated_at


ColumnMappings

id (PK)
data_source_id (FK to DataSources)
metric_definition_id (FK to MetricDefinitions)
column_name
transformation_rule (optional)
created_at, updated_at


MetricValues

id (PK)
metric_definition_id (FK to MetricDefinitions)
clinic_id (FK to Clinics, optional)
provider_id (FK to Providers, optional)
date
value
source_type (spreadsheet, form)
data_source_id (FK to DataSources, optional)
created_at, updated_at


Goals

id (PK)
metric_definition_id (FK to MetricDefinitions)
clinic_id (FK to Clinics, optional)
provider_id (FK to Providers, optional)
time_period (daily, weekly, monthly, quarterly, annual)
start_date
end_date
target_value
created_at, updated_at


Dashboards

id (PK)
name
user_id (FK to Users)
is_default (boolean)
layout_config (JSON)
created_at, updated_at


Widgets

id (PK)
dashboard_id (FK to Dashboards)
metric_definition_id (FK to MetricDefinitions, optional)
widget_type (chart, counter, table, etc.)
chart_type (line, bar, pie, etc., if applicable)
position_x, position_y
width, height
config (JSON)
created_at, updated_at


Forms (Future Phase)

id (PK)
name
description
form_fields (JSON)
clinic_id (FK to Clinics, optional)
created_at, updated_at


FormSubmissions (Future Phase)

id (PK)
form_id (FK to Forms)
user_id (FK to Users)
submission_date
data (JSON)
created_at, updated_at



Relationships:

Clinics have many Users, Providers, and clinic-specific MetricValues
Providers belong to Clinics and have many provider-specific MetricValues
MetricDefinitions have many MetricValues and ColumnMappings
DataSources have many ColumnMappings
Users have many Dashboards
Dashboards have many Widgets
Forms have many FormSubmissions
</database_schema>

<data_visualization>
The dashboard will visualize dental practice data through carefully selected chart types based on the nature of each metric:

Financial Performance Visualizations

Net Production by Clinic: Line and bar charts with clinic comparison
Provider Net Production: Horizontal bar charts with sorting capability
Collections Breakdown: Stacked bar charts showing payment types
Aging Accounts Receivable: Area charts with time-based thresholds
Collection Percentage: Gauge charts with goal indicators
Insurance/Patient/Third-Party Payments: Pie/donut charts with drill-down


Patient Metrics Visualizations

Active Patients: Large number displays with trend indicators
New Patients: Line charts with month-over-month comparison
Active Hygiene Patients: Counter cards with percentage of total
Online Google Reviews: Line chart tracking growth over time


Appointment Analytics Visualizations

Total Appointments Kept: Bar charts with historical comparison
Hygiene Appointment Breakdown: Stacked column charts for different types
Cancellation Rates: Line charts with threshold indicators
Reappointment Rates: Gauge charts with goal tracking


Provider Performance Visualizations

Treatment Plan Value: Horizontal bar charts by provider
Case Acceptance Rate: Gauge charts with targets
Procedure Counts: Line charts tracking volume over time
Specialized Procedure Rates: Radar charts comparing fluoride, perio, bone graft percentages


Call Performance Visualizations

Unscheduled Treatment Calls: Funnel charts showing conversion rates
Hygiene Reactivation Calls: Conversion charts with drill-down capability
Call Answer Rates: Line charts with threshold indicators


Treatment Planning Visualizations

Treatment $ Presented vs. Scheduled: Comparison bar charts
Same-Day Treatment Acceptance: Trend line over time
Case Acceptance by Type: Heat map showing acceptance by procedure type



Interaction Capabilities:

Time Period Selection: Toggles for daily, weekly, monthly, quarterly, annual views
Clinic/Provider Filtering: Drop-down filters to focus on specific entities
Drill-Down Navigation: Click-through capability from summary to detailed views
Goal Visualization: Overlay target lines/values on applicable charts
Data Export: PDF/CSV export capabilities for reporting
Saved Views: User-specific saved dashboard configurations
</data_visualization>

<technology_stack>
The recommended technology stack is designed to provide a robust, scalable, and maintainable solution:

Package Manager: pnpm (REQUIRED)

Pros: Disk space efficiency, strict dependency management, faster installation
Cons: Some libraries may have edge-case compatibility issues
Justification: Superior disk space usage, stricter dependency resolution, and significantly faster installations
Implementation: Project MUST use pnpm workspaces for monorepo management with strict lockfile enforcement


Frontend Framework: Next.js

Pros: Server-side rendering capabilities, excellent React framework, built-in API routes
Cons: More complex than plain React, learning curve for advanced features
Justification: Leverages user's existing experience, provides both frontend and backend capabilities


UI Component Library: shadcn/ui

Pros: High-quality, customizable components, excellent Tailwind CSS integration
Cons: Relatively new library, less extensive documentation than some alternatives
Justification: Provides professional-looking components with minimal styling effort


Styling: Tailwind CSS

Pros: Utility-first approach, responsive design, minimal CSS files
Cons: HTML can become verbose with many utility classes
Justification: Perfect pairing with shadcn/ui, rapid development capability


Charting Library: Recharts

Pros: React-based, customizable, wide variety of chart types
Cons: Some advanced visualizations require custom implementation
Justification: Well-maintained, good documentation, responsive charts


Backend API: Next.js API Routes

Pros: Seamless integration with frontend, TypeScript support, serverless-friendly
Cons: Limited to Next.js ecosystem
Justification: Simplifies development by keeping everything in one framework


Database ORM: Prisma (as specified)

Pros: Type-safe database access, migrations, schema management
Cons: Performance overhead for some complex queries
Justification: Modern ORM with excellent TypeScript integration, specified requirement


Database: Supabase PostgreSQL (as specified)

Pros: Reliable SQL database, well-maintained, good ecosystem
Cons: Requires database management knowledge
Justification: Robust relational database for complex relationships, specified requirement


Authentication: NextAuth.js

Pros: Easy integration with Next.js, supports multiple providers
Cons: Some advanced configurations can be complex
Justification: Simplifies Google OAuth implementation for Sheets API


State Management: React Query & Zustand

Pros: Optimized for server state, caching, easy to implement
Cons: Learning curve for advanced patterns
Justification: Excellent for API data management and UI state


Testing Framework: Vite (as specified) & Jest

Pros: Fast testing, good component testing
Cons: Configuration can be complex for advanced cases
Justification: Specified requirement, good for component testing


Deployment Platform: Vercel

Pros: Optimized for Next.js, easy deployment, preview environments
Cons: Some limitations in free tier
Justification: Best platform for Next.js applications


Additional Libraries:

Google API Client Library: For Google Sheets integration
date-fns: For date manipulation
Zod: For runtime type validation
Axios: For HTTP requests outside of Next.js
</technology_stack>



</technology_stack>



<development_phases>
To ensure a structured, iterative approach to development, the project is divided into distinct phases:
Phase 1: Foundation & Google Sheets Integration (4-6 weeks)

Project setup and configuration
Database schema implementation with Prisma and Supabase
Google OAuth implementation and authorization flow
Basic Google Sheets API integration
Spreadsheet discovery and selection interface
Simple data extraction from Google Sheets
Core API development for metric definitions

Phase 2: Data Processing & Storage (3-4 weeks)

Column mapping interface implementation
Data transformation pipeline development
Historical data import functionality
Scheduled data synchronization
Error handling and logging system
Data validation rules implementation
Initial metric calculations

Phase 3: Dashboard Foundation & Core Visualizations (4-5 weeks)

Basic dashboard layout implementation with shadcn/ui
Dashboard layout customization capabilities
Essential chart components with Recharts
Time period filtering functionality
Clinic and provider filtering
Initial KPI visualizations for financial metrics
Performance optimization for data queries

Phase 4: Advanced Visualizations & Features (3-4 weeks)

Complete visualization set for all KPI categories
Goal tracking implementation
Comparison views (clinic vs. clinic, provider vs. provider)
Trend analysis with historical data
Export functionality for reports
Saved views and dashboard templates
User role-based dashboard configurations

Phase 5: Form-Based Reporting (Future Phase) (5-6 weeks)

Form builder interface
Mobile-responsive form components
Data validation for form submissions
Integration with existing metrics database
Migration path from spreadsheets to forms
Historical data preservation
Real-time reporting capabilities

Each phase will include:

Design and wireframing
Development and implementation
Testing and quality assurance
User feedback and iteration
Documentation updates
</development_phases>

<separation_of_concerns>
To ensure maintainability and scalability, the application will follow a clear separation of concerns:

Data Layer

Responsibilities:

Database schema management (Prisma)
Data access and manipulation
Google Sheets API integration
Data transformation and normalization
Caching and performance optimization


Key Components:

Prisma models and migrations
Repository pattern for data access
Google Sheets connector services
Data transformation services
Caching middleware




Business Logic Layer

Responsibilities:

Implementing business rules and calculations
Authorization and permission checks
Metric computation and aggregation
Goal tracking and comparison logic
Data validation rules


Key Components:

Service modules for each domain (financial, appointments, etc.)
Validation libraries (Zod schemas)
Authorization middleware
Calculation engines for complex metrics




API Layer

Responsibilities:

Exposing consistent REST endpoints
Request validation and sanitization
Response formatting and error handling
Rate limiting and security


Key Components:

Next.js API routes
Middleware for common concerns
Error handling utilities
API documentation (OpenAPI/Swagger)




Presentation Layer

Responsibilities:

User interface rendering
Data visualization
User interaction handling
Layout and responsive design


Key Components:

Next.js pages and components
shadcn/ui component library
Recharts visualization components
Tailwind CSS styling




State Management

Responsibilities:

Managing UI state
Handling server data caching
Optimistic updates
Real-time data synchronization


Key Components:

React Query for server state
Zustand for UI state
Context providers for shared state





Design Patterns to Implement:

Repository Pattern: Abstract data access logic
Service Pattern: Encapsulate business logic
Adapter Pattern: Handle external API integration
Factory Pattern: Create complex objects consistently
Strategy Pattern: Handle different visualization types

This separation ensures:

Components can be developed, tested, and maintained independently
Business logic remains decoupled from the UI
The system can scale horizontally as needed
New features can be added with minimal impact on existing code
Testing can be performed at each layer independently
</separation_of_concerns>

<next_steps>
Immediate actions to begin implementing this dental practice dashboard:

Environment Setup (1-2 days)

Create a new Next.js project with TypeScript
Configure Tailwind CSS and shadcn/ui
Set up Prisma with Supabase PostgreSQL
Configure ESLint and Prettier for code quality
Set up a GitHub repository with branching strategy


Google API Configuration (2-3 days)

Register application in Google Cloud Console
Enable necessary APIs (Google Sheets, Drive)
Create OAuth credentials
Implement secure environment variable storage
Test basic API connectivity


Database Implementation (3-4 days)

Define Prisma schema based on the specified database design
Set up initial migrations
Create seed data for testing
Implement repository pattern for data access
Test database operations


Core Framework Development (1 week)

Create basic application layout with shadcn/ui
Implement authentication flow with NextAuth.js
Set up routing structure
Create reusable layout components
Implement basic state management


Google Sheets Integration Prototype (1-2 weeks)

Implement OAuth flow for Google authentication
Create spreadsheet discovery and selection interface
Develop column mapping functionality
Build initial data transformation pipeline
Test with sample spreadsheet data


First Dashboard Prototype (1-2 weeks)

Implement basic dashboard layout
Create initial visualizations for key metrics
Set up filtering by time period
Add clinic/provider filtering
Test with transformed spreadsheet data


Planning and Documentation

Refine the development roadmap
Create detailed technical documentation
Set up project management tools
Define sprint cycles and milestones
Establish testing strategy



Key Considerations:

Start with a small subset of metrics for the initial prototype
Focus on the Google Sheets integration as the critical path
Create a solid foundation with proper separation of concerns
Implement continuous integration from the beginning
Gather feedback early and often to adjust the implementation
</next_steps>
</prd>


Project Structure
Based on the PRD and recommended technology stack, here's a suggested project structure for your Next.js dental practice dashboard:
dental-dashboard/
├── .npmrc                  # pnpm configuration (strict-peer-dependencies=true)
├── pnpm-lock.yaml          # pnpm lockfile (must be committed)
├── pnpm-workspace.yaml     # Workspace configuration
├── package.json            # Root package configuration
├── .env                    # Environment variables (includes NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── next.config.js          # Next.js configuration
├── middleware.ts           # Supabase auth session middleware
├── prisma/                 # Prisma database schemas and migrations
│   ├── schema.prisma       # Prisma schema definition
│   └── migrations/         # Database migrations
├── supabase/               # Supabase specific configuration
│   ├── schema/             # SQL schema definitions for Supabase
│   │   ├── auth.sql        # Auth related schema
│   │   ├── storage.sql     # Storage related schema
│   │   └── rls.sql         # Row Level Security policies
│   ├── functions/          # Edge functions
│   ├── migrations/         # Supabase migrations
│   └── seed-data/          # Seed data for development
├── public/                 # Static assets
├── src/                    # Application source code
│   ├── app/                # Next.js app directory (App Router)
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication routes
│   │   │   │   └── callback/route.ts  # Auth callback handler
│   │   │   ├── clinics/    # Clinic-related endpoints
│   │   │   ├── dashboards/ # Dashboard configuration endpoints
│   │   │   ├── google/     # Google Sheets integration endpoints
│   │   │   ├── metrics/    # Metrics and KPI endpoints
│   │   │   └── users/      # User management endpoints
│   │   ├── auth/           # Authentication-related pages
│   │   │   ├── signin/     # Sign in page
│   │   │   ├── signup/     # Sign up page
│   │   │   └── callback/route.ts # Auth callback handler
│   │   ├── (dashboard)/    # Dashboard pages (protected routes)
│   │   │   ├── page.tsx    # Main dashboard page
│   │   │   ├── layout.tsx  # Dashboard layout
│   │   │   ├── clinics/    # Clinic-specific views
│   │   │   ├── providers/  # Provider-specific views
│   │   │   ├── metrics/    # Metrics detail pages
│   │   │   └── settings/   # Dashboard settings
│   │   ├── google/         # Google integration pages
│   │   │   ├── connect/    # Connection setup
│   │   │   └── mapping/    # Column mapping interface
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── charts/         # Chart components
│   │   ├── dashboards/     # Dashboard-specific components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   ├── auth/           # Authentication components
│   │   └── metrics/        # Metric-specific components
│   ├── lib/                # Domain-specific libraries and clients
│   │   ├── api/            # API client configuration
│   │   ├── db/             # Database connection and helpers
│   │   ├── google/         # Google API integration
│   │   └── supabase/       # Supabase client configuration
│   │       ├── client.ts   # Browser client
│   │       ├── server.ts   # Server client
│   │       └── middleware.ts # Middleware client
│   ├── utils/              # Pure utility functions
│   │   ├── date/           # Date formatting and manipulation
│   │   ├── string/         # String operations and formatting
│   │   ├── number/         # Number formatting and calculations
│   │   └── format/         # General formatting utilities
│   ├── actions/            # Server actions (Next.js)
│   │   ├── auth/           # Authentication actions (moved from lib)
│   │   ├── clinics/        # Clinic-related mutations
│   │   ├── metrics/        # Metrics-related mutations
│   │   └── users/          # User-related mutations
│   ├── hooks/              # Custom React hooks
│   │   ├── useSupabase.ts  # Supabase client hook
│   │   └── useAuth.ts      # Authentication hook
│   ├── types/              # TypeScript type definitions
│   │   ├── supabase.ts     # Supabase generated types
│   │   └── database.ts     # Database types
│   ├── services/           # Business logic services
│   │   ├── clinics/        # Clinic-related services
│   │   ├── google/         # Google integration services
│   │   ├── metrics/        # Metric calculation services
│   │   └── users/          # User-related services
│   └── styles/             # Global and modular styles
│       ├── globals.css     # Global CSS
│       ├── themes/         # Theme configurations
│       └── components/     # Component-specific styles
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── turbo.json               # Turborepo pipeline configuration (build, dev, lint, test scripts)
└── README.md               # Project documentation

# Key Directory Organization

## Libraries and Utils
- src/lib/: Domain-specific libraries and API clients. Houses core integrations (Supabase, Google, etc.)
- src/utils/: Pure utility functions organized by type (date, string, number, format). No side effects or app state.
- src/actions/: All server-side mutations using Next.js server actions, organized by domain (auth, clinics, etc.)

## Styles and UI
- src/styles/: All styling concerns including global CSS, themes, and component styles
- src/components/: Reusable React components, organized by domain and function

## Business Logic
- src/services/: Core business logic and data transformation services
- src/hooks/: React hooks for state management and shared behaviors

## Configuration
- turbo.json: Turborepo pipeline configuration for build, test, and development tasks

This structure follows Next.js App Router conventions while implementing clean code architecture with proper separation of concerns. It's organized to scale with your application as you progress through the development phases outlined in the PRD.
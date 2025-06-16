## Launch Features (MVP)

### Google Sheets Integration Core
**Simplified data synchronization using Google Apps Script to directly populate the Supabase database with standardized dental practice KPIs.**

* Google Apps Script deployed to practice spreadsheets for automated data processing
* Scheduled cron jobs within Google Sheets to extract and transform data
* Direct upserts to Supabase database via REST API with service key authentication
* Pre-built Google Apps Script templates for common dental practice spreadsheet formats
* Simple sync status monitoring and Winston logging for error tracking in the Next.js app

#### Tech Involved
* Google Apps Script with built-in cron scheduling (Google Workspace limits)
* Supabase REST API with service key authentication for direct database access
* Next.js API routes for sync status monitoring and configuration
* Prisma for data source status tracking and validation
* Winston for structured logging of sync operations and errors

#### Main Requirements
* Secure Supabase service key management in Google Apps Script
* Error handling and retry logic within Google Apps Script for API failures
* Data validation using built-in Google Apps Script functions and Supabase database constraints
* Support for multiple spreadsheets per clinic with unique script deployments
* Sync status dashboard in Next.js app to monitor Google Apps Script operations
* Template scripts for easy deployment to different practice spreadsheet formats

### Essential KPI Dashboard
**Fixed dashboard layouts displaying core dental practice metrics with basic filtering and time period selection, optimized for up to 50 concurrent users.**

* Pre-built dashboard templates for each user role (Office Manager, Dentist, Front Desk)
* Core financial metrics (production, collections, payments)
* Patient metrics (active patients, new patients, recare rates)
* Appointment analytics (total kept, cancellation rates, hygiene breakdown)
* Provider performance basics (production by provider, treatment planning)
* Call tracking performance (unscheduled treatment, hygiene reactivation)
* Time period filtering (daily, weekly, monthly, quarterly)
* Clinic and provider-level filtering

#### Tech Involved
* Recharts for visualization components
* TanStack Query for data fetching and caching (sufficient for 50 users)
* ShadCN UI for dashboard layout components
* Prisma for metrics data queries with connection pooling
* Supabase Edge Functions for complex metric calculations

#### Main Requirements
* Responsive design for desktop access
* Role-based dashboard content filtering via Supabase RLS
* Efficient data aggregation queries optimized for small user base
* Export capabilities (PDF/CSV) via Supabase Storage
* Real-time data updates through Supabase Edge Functions

### Multi-Tenant User Management
**Role-based access control system supporting multiple dental practices with provider-specific data isolation, designed for small practice teams.**

* Clinic-based user organization and data isolation via Supabase RLS
* Role definitions (Office Manager, Dentist, Front Desk, Admin)
* Provider association and performance tracking
* Basic user profile management and invitation system
* Session management with secure JWT handling

#### Tech Involved
* Supabase Auth with Row Level Security (RLS)
* Prisma schema with multi-tenant relationships
* Next.js middleware for route protection
* Server actions for user management
* Winston logging for audit trails

#### Main Requirements
* HIPAA-compliant data isolation between clinics using RLS policies
* Secure session management via Supabase Auth
* Provider performance data association and tracking
* Audit logging with Winston for user actions and data access
* Input validation using Zod schemas for all user data

### Data Synchronization & Processing
**Automated background processing for Google Sheets data transformation and metric calculations using Supabase Edge Functions.**

* Scheduled data synchronization using Supabase cron jobs
* Real-time data transformation pipeline via Edge Functions
* Historical data import for existing spreadsheet data (< 1000 rows)
* Data validation and error handling with comprehensive logging
* Metric calculation engine for complex KPI computations

#### Tech Involved
* Supabase Edge Functions for all background processing
* Supabase cron jobs for scheduled synchronization
* Prisma for efficient batch operations
* Winston for structured logging and error tracking
* Zod for runtime data validation

#### Main Requirements
* Reliable data transformation with error recovery
* Efficient processing of small datasets (< 1000 rows)
* Comprehensive error logging and monitoring
* Data consistency validation between Google Sheets and database
* Simple retry mechanisms for failed operations

### Goal Tracking & Reporting
**Basic goal setting and performance tracking against established targets with simple variance reporting.**

* Goal definition by clinic and provider
* Time-based goal tracking (monthly, quarterly, annual)
* Variance reporting and trend analysis
* Performance indicators with visual goal progress
* Basic comparative analysis between providers and time periods

#### Tech Involved
* Prisma for goal data management
* Recharts for goal visualization components
* Supabase Edge Functions for goal calculations
* TanStack Query for real-time goal progress updates

#### Main Requirements
* Simple goal configuration interface
* Visual progress indicators on dashboards
* Historical goal performance tracking
* Basic alerting for goal achievement/variance
* Export capabilities for goal reports

#### System Diagram

![System Diagram](dental_dashboard_architecture.svg)

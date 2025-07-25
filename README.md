# Dental Dashboard - Multi-Tenant Practice Insights Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-orange?logo=playwright)](https://playwright.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748?logo=prisma)](https://www.prisma.io/)

> **A comprehensive multi-tenant dental practice insights dashboard providing real-time KPI tracking, data visualization, and Google Sheets integration for dental clinics.**

## 🎯 Project Overview

The Dental Dashboard is a production-grade Next.js application designed to empower dental practices with actionable data insights. Built with a focus on multi-tenancy, security, and performance, it provides comprehensive analytics and KPI tracking for dental clinic owners, practice managers, and healthcare providers.

### Key Features
- 📊 **Real-time Analytics** - Live KPI tracking and performance metrics
- 🏥 **Multi-Clinic Support** - Secure multi-tenant architecture with Row Level Security (RLS)
- 📈 **Provider Performance** - Individual dentist and hygienist performance tracking
- 🔗 **Google Sheets Integration** - Automated data synchronization from practice spreadsheets
- 📱 **Responsive Design** - Mobile-first design with accessibility compliance
- 🔐 **Enterprise Security** - Supabase authentication with comprehensive access controls
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E test coverage with Playwright

## 🏗️ Technology Stack

### Frontend
- **Framework**: [Next.js 15.3.2](https://nextjs.org/) with App Router and Turbopack
- **Language**: TypeScript 5.8.3 with strict mode
- **UI Library**: [Shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Styling**: [Tailwind CSS 4.1.11](https://tailwindcss.com/) with PostCSS
- **Icons**: Lucide React 0.510.0
- **Charts**: Recharts 2.15.4 for data visualization
- **Animation**: Framer Motion 12.23.6
- **State Management**: TanStack Query 5.83.0, Zustand 5.0.6

### Backend & Database
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL via [Supabase](https://supabase.com/)
- **ORM**: [Prisma 6.12.0](https://www.prisma.io/) with type-safe queries
- **Authentication**: Supabase Auth with SSR support
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions

### Development & Testing
- **Package Manager**: pnpm 10.12.4
- **Code Quality**: [Biome 1.9.4](https://biomejs.dev/) for linting and formatting
- **Testing**: 
  - Unit/Integration: Vitest 3.2.4 with jsdom
  - E2E Testing: Playwright 1.54.1 with multi-browser support
  - Cloud Testing: Branch database testing with .env.test
- **Type Checking**: TypeScript compiler with strict null checks
- **Pre-commit**: Husky 9.1.7 with automated quality checks

### External Integrations
- **Google APIs**: Google Sheets API, Google Drive API
- **Authentication**: Google OAuth 2.0 integration
- **AI Services**: Anthropic Claude, OpenAI (for development tooling)
- **Monitoring**: Winston 3.17.0 for structured logging

### Deployment & Infrastructure
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Supabase managed PostgreSQL
- **CDN**: Vercel Edge Network
- **Environment**: Environment-specific configurations (.env files)

## 🎯 Business Context

### Vision & Mission
- **Vision**: Empower dental practices with accessible, actionable data insights to optimize operations and improve patient care
- **Mission**: Deliver a user-friendly, comprehensive dashboard that seamlessly integrates data sources and facilitates evidence-based decision making

### Target Users
- **Dental Clinic Owners**: High-level practice performance and financial oversight
- **Practice Managers**: Daily operations management and staff performance tracking
- **Office Administrators**: User management, data entry, and system configuration
- **Dentists & Hygienists**: Individual performance tracking and goal management

### Core Value Proposition
- **Centralized Analytics**: Replace manual spreadsheet compilation with automated insights
- **Real-time Visibility**: Live KPI tracking for immediate operational awareness
- **Multi-location Support**: Secure, scalable architecture for practice groups
- **Integration-first**: Seamless data flow from existing Google Sheets workflows

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ with pnpm 10+
- **Database**: Supabase project (or local PostgreSQL)
- **Google Cloud Project** (for Sheets API integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AojdevStudio/dental-dashboard.git
   cd dental-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   DATABASE_URL=your-database-connection-string
   DIRECT_URL=your-direct-database-url
   
   # Google API Integration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   
   # Optional: AI Development Tools
   ANTHROPIC_API_KEY=your-claude-api-key
   ```

4. **Database setup**
   ```bash
   pnpm prisma:push     # Push schema to database
   pnpm prisma:generate # Generate Prisma client
   pnpm prisma:seed     # Seed with sample data
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```
   
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

### First-time Setup

1. **Create a test admin user**
   ```bash
   pnpm dlx tsx scripts/create-test-admin.ts
   ```

2. **Verify authentication flow**
   ```bash
   pnpm dlx tsx scripts/test-complete-auth.ts
   ```

3. **Run the test suite**
   ```bash
   pnpm test              # Unit/integration tests
   pnpm test:e2e          # End-to-end tests
   ```

## 🧪 Testing Infrastructure

### Test Architecture
The project uses a comprehensive testing strategy with multiple test types:

- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: API route and database interaction testing
- **E2E Tests**: Full user workflow testing with Playwright
- **Cloud Testing**: Tests run against branch databases for production parity

### Running Tests

```bash
# Unit and Integration Tests
pnpm test                    # Run all tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report
pnpm test:cloud             # Tests with cloud database

# End-to-End Tests
pnpm test:e2e               # Run E2E tests
pnpm test:e2e:ui            # Interactive mode
pnpm test:e2e:headed        # Headed browser mode
pnpm test:e2e:report        # View test report

# Playwright Configuration
pnpm playwright install     # Install browsers
```

### Test Environment Setup

The project uses environment-specific testing:

```bash
# Test environment variables (.env.test)
NODE_ENV=test
DATABASE_URL=your-test-database-url
NEXT_PUBLIC_SUPABASE_URL=your-test-supabase-url
```

### E2E Testing Features

- **Multi-browser testing**: Chrome, Firefox, Safari, Mobile
- **Authentication fixtures**: Automated login/signup flows
- **Visual regression**: Screenshot comparisons
- **Performance monitoring**: Core Web Vitals tracking
- **Parallel execution**: Optimized test runtime

## 🏗️ Architecture Overview

### System Architecture

The Dental Dashboard follows a modern multi-tenant architecture with strict security boundaries:

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Next.js Frontend]
        Auth[Authentication]
    end
    
    subgraph "API Layer"
        API[Next.js API Routes]
        Middleware[Auth Middleware]
        RLS[Row Level Security]
    end
    
    subgraph "Data Layer"
        DB[(Supabase PostgreSQL)]
        Prisma[Prisma ORM]
        Cache[Query Cache]
    end
    
    subgraph "External Services"
        Sheets[Google Sheets API]
        GAS[Google Apps Script]
        AI[AI Services]
    end
    
    UI --> API
    Auth --> Middleware
    API --> Prisma
    Prisma --> DB
    RLS --> DB
    API --> Sheets
    Sheets --> GAS
    
    classDef client fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class UI,Auth client
    class API,Middleware,RLS api
    class DB,Prisma,Cache data
    class Sheets,GAS,AI external
```

### Multi-Tenant Security Model

- **Row Level Security (RLS)**: Database-level access control ensuring data isolation
- **Auth Context**: User clinic associations determine data access scope
- **Role-Based Access**: Granular permissions (admin, clinic_admin, provider, user)
- **API Middleware**: Comprehensive authentication and authorization checks

### Key Architectural Decisions

- **Server Components First**: Leveraging Next.js 15 App Router for optimal performance
- **Type-Safe Database Access**: Prisma ORM with full TypeScript integration
- **Edge-Ready**: Designed for Vercel Edge Functions and global deployment
- **Real-time Capable**: Supabase subscriptions for live data updates

## 💻 Development Workflow

### Code Quality Pipeline

Every code change must pass our comprehensive quality gates:

```bash
# Pre-commit Quality Checks
pnpm format          # Biome code formatting
pnpm typecheck      # TypeScript type checking
pnpm biome:check    # Linting and code analysis
pnpm test           # Unit and integration tests

# Full Quality Pipeline
pnpm code-quality   # All checks + build verification
```

### Branch Strategy

```bash
# Feature development
git checkout -b feature/your-feature-name
# Make changes, commit frequently
git commit -m "feat: implement provider filtering"

# Before pushing
pnpm pre-commit     # Run quality checks
git push origin feature/your-feature-name

# Create PR when ready
gh pr create --title "feat: Add provider filtering" --body "Description..."
```

### Database Workflow

```bash
# Schema changes
pnpm prisma:push            # Push to development DB
pnpm prisma:generate        # Generate new client
pnpm prisma:studio          # Inspect data

# Data migrations
pnpm migrate:uuid           # Run UUID migration
pnpm migrate:validate       # Validate migration results

# Testing with fresh data
pnpm test:seed              # Seed test database
```

### Google Apps Script Deployment

```bash
# Deploy sync scripts
pnpm gas:deploy             # Deploy all scripts
pnpm gas:deploy:dentist     # Deploy dentist sync only
pnpm gas:deploy:hygienist   # Deploy hygienist sync only

# Health monitoring
pnpm gas:health             # Check script health
pnpm gas:status             # Deployment status
```

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register-comprehensive` | Complete user registration |
| `GET` | `/api/auth/session` | Get current session |
| `POST` | `/api/auth/complete-signup` | Complete signup process |
| `GET` | `/api/auth/google/connect` | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | Handle OAuth callback |

### Core API Routes

#### Clinics
- `GET /api/clinics` - List accessible clinics
- `POST /api/clinics` - Create new clinic (admin only)
- `GET /api/clinics/[clinicId]` - Get clinic details
- `PATCH /api/clinics/[clinicId]` - Update clinic
- `GET /api/clinics/[clinicId]/statistics` - Clinic analytics

#### Providers
- `GET /api/providers` - List providers
- `POST /api/providers` - Create provider
- `GET /api/providers/[providerId]` - Provider details
- `GET /api/providers/[providerId]/metrics` - Provider metrics
- `GET /api/providers/[providerId]/performance` - Performance data
- `GET /api/providers/[providerId]/kpi` - KPI calculations

#### Metrics & Analytics
- `GET /api/metrics/financial` - Financial metrics
- `GET /api/metrics/patients` - Patient analytics
- `GET /api/metrics/appointments` - Appointment metrics
- `GET /api/metrics/aggregated` - Pre-computed aggregations

#### Goals & Tracking
- `GET /api/goals` - List goals with filtering
- `POST /api/goals` - Create goal or from template
- `GET /api/goals/[goalId]` - Goal details
- `PUT /api/goals/[goalId]` - Update goal
- `DELETE /api/goals/[goalId]` - Soft delete goal

### API Response Format

All API responses follow a consistent format:

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}

// Paginated Response
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    hasMore: boolean
  }
}
```

### Authentication & Authorization

API routes use middleware-based auth:

```typescript
// Route with authentication
export const GET = withAuth(async (request, { user }) => {
  // Access authenticated user
});

// Route with role requirements
export const POST = withAuth(async (request, { user, authContext }) => {
  // Access user's clinic associations and roles
}, { requireClinicAdmin: true });
```

## 🗄️ Database Schema

### Core Models

The database follows a multi-tenant design with the following key entities:

#### Authentication & Users
- **User**: Application users with clinic associations
- **UserClinicRole**: Many-to-many relationship defining user roles per clinic

#### Practice Management
- **Clinic**: Top-level tenant with multiple locations
- **Location**: Physical clinic locations (e.g., "Baytown", "Humble")
- **Provider**: Healthcare providers (dentists, hygienists) with multi-location support

#### Metrics & Analytics  
- **MetricDefinition**: Configurable metric types (financial, patient, appointment)
- **MetricValue**: Time-series data points for each metric
- **MetricAggregation**: Pre-computed aggregations for performance

#### Goals & Tracking
- **Goal**: Practice and provider-specific targets
- **GoalTemplate**: Reusable goal configurations

#### Data Integration
- **DataSource**: Google Sheets and other data source configurations
- **ColumnMapping**: Maps external data columns to internal metrics

### Row Level Security (RLS)

Every table implements RLS policies ensuring:
- Users only access data from their associated clinics
- Role-based permissions (admin, clinic_admin, provider, user)
- Automatic data isolation at the database level

```sql
-- Example RLS Policy
CREATE POLICY "Users can only see their clinic's providers"
  ON providers FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM user_clinic_roles 
    WHERE user_id = auth.uid()
  ));
```

### Migration Strategy

The project uses a phased migration approach:
- **Phase 1**: Core multi-tenant schema
- **Phase 2**: UUID support for external system integration  
- **Phase 3**: Enhanced RLS and performance optimization

## 🚢 Deployment

### Production Environment

**Primary Stack**:
- **Frontend**: Vercel with Next.js optimization
- **Database**: Supabase managed PostgreSQL
- **CDN**: Vercel Edge Network with global caching
- **Monitoring**: Vercel Analytics + Custom Winston logging

**Environment Variables**:
```bash
# Production .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres
```

### Deployment Workflow

```bash
# Production deployment
git push origin main           # Automatic Vercel deployment

# Database migrations
pnpm prisma:push              # Apply schema changes
pnpm prisma:generate          # Update client

# Post-deployment validation
pnpm gas:health:all           # Verify Google Apps Script health
```

### Environment Management

- **Development**: Local development with Supabase local or cloud dev branch
- **Staging**: Branch preview deployments on Vercel
- **Production**: Main branch auto-deployment with environment promotion

### Monitoring & Observability

- **Application Logging**: Winston with structured JSON logging
- **Error Tracking**: Built-in error boundaries with detailed context
- **Performance**: Core Web Vitals monitoring via Vercel Analytics
- **Database**: Supabase built-in monitoring and query performance insights

## 🤝 Contributing

### Development Guidelines

1. **Follow the CLAUDE.md protocol** for comprehensive development partnership
2. **Run quality checks** before every commit (`pnpm pre-commit`)
3. **Write tests** for new features (aim for >80% coverage)
4. **Update documentation** for API changes or new features
5. **Use conventional commits** for clear changelog generation

### Code Standards

- **TypeScript**: Strict mode with explicit return types
- **Components**: Prefer Server Components, use Client Components judiciously  
- **API Routes**: Follow RESTful patterns with consistent error handling
- **Database**: Always use auth context for multi-tenant queries
- **Testing**: Unit tests for utilities, integration tests for APIs, E2E for workflows

### Getting Help

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Documentation**: Check `/docs` folder for detailed guides
- **AI Assistant**: Use Claude Code integration for development support

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Main application routes
│   ├── (auth)/           # Authentication pages
│   └── api/              # API routes
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   └── providers/       # Provider management components
├── lib/                 # Utilities and configurations
│   ├── database/        # Prisma client and queries
│   ├── auth/           # Authentication utilities
│   └── utils/          # Helper functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

---

## 📄 License

This project is proprietary software developed for dental practice management. Unauthorized reproduction or distribution is prohibited.

## 🔗 Links

- **Live Demo**: [Production URL]
- **Documentation**: `/docs` folder
- **API Reference**: Built-in API documentation
- **Supabase Project**: [Supabase Dashboard]
- **Linear Project**: [Project Management Board]

---

*Built with ❤️ for dental practices by the AOJDevStudio team.*

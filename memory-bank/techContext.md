# Technical Context: Dental Practice Analytics Dashboard
*Version: 1.0*
*Created: 2025-05-17*
*Last Updated: 2025-05-17*

## Technology Stack
- **Package Manager:** pnpm (REQUIRED)
- **Frontend Framework:** Next.js
- **UI Component Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **Charting Library:** Recharts
- **Backend API:** Next.js API Routes
- **Database ORM:** Prisma
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **State Management:** React Query & Zustand
- **Testing Framework:** Vite & Vitest
- **Deployment Platform:** Vercel
- **Additional Libraries:**
    - Google API Client Library (for Google Sheets integration)
    - date-fns (for date manipulation)
    - Zod (for runtime type validation)
    - Axios (for HTTP requests outside of Next.js)

## Development Environment Setup
- Set up Next.js project with TypeScript.
- Configure pnpm for package management and workspaces.
- Integrate Tailwind CSS for styling.
- Install and configure shadcn/ui for UI components.
- Set up Prisma to connect to Supabase PostgreSQL.
- Configure Supabase Auth for authentication.
- Install Recharts for data visualization.
- Implement React Query for server state management and Zustand for UI state.
- Configure Vite and Vitest for testing.
- Use ESLint and Prettier for code quality (as per PRD Next Steps).
- Store sensitive keys (Google API, Supabase) in `.env` and use `.env.example` for templates.

## Dependencies
(Key dependencies based on technology stack - specific versions to be determined during project setup)
- `next`: Framework
- `react`, `react-dom`: UI Library
- `pnpm`: Package Manager
- `tailwindcss`: Styling
- `shadcn-ui` (various component packages like `button`, `card` etc.): UI Components
- `recharts`: Charting
- `@prisma/client`: Prisma ORM Client
- `prisma`: Prisma CLI (dev dependency)
- `@supabase/supabase-js`: Supabase Client
- `@supabase/auth-helpers-nextjs`: Supabase Auth Helpers
- `@tanstack/react-query`: Server State Management
- `zustand`: Client State Management
- `vitest`, `vite`: Testing Framework (dev dependencies)
- `googleapis`: Google API Client Library
- `date-fns`: Date utility
- `zod`: Validation
- `axios`: HTTP Client

## Technical Constraints
- Must use pnpm as the package manager.
- Database must be Supabase PostgreSQL.
- ORM must be Prisma.
- Testing framework must be Vite/Vitest.
- Initial phase is read-only data from Google Sheets.
- Future phase will introduce form-based data entry.

## Build and Deployment
- **Build Process:** Utilized Next.js build process (`next build`), managed via pnpm scripts and Turborepo if multiple packages/apps are involved in the monorepo.
- **Deployment Procedure:** Deployment via Vercel, connected to the Git repository.
- **CI/CD:** Vercel provides CI/CD capabilities. Further pipeline configurations (e.g., automated testing, linting checks) to be set up.

## Testing Approach
- **Unit Testing:** Vitest for testing individual functions, components, and services.
- **Integration Testing:** Vitest for testing interactions between components, services, and API routes.
- **E2E Testing:** (To be defined - potentially Playwright or Cypress if complex E2E scenarios arise). The PRD mentions testing, but Vitest is primarily for unit/integration.

---

*This document describes the technologies used in the project and how they're configured.* 
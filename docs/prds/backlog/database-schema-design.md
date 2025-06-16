#### Detailed Implementation Guide

**Database Schema Design**:
```sql
-- Google Sheets Integration Tables
CREATE TABLE google_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL, -- Encrypted
  refresh_token text NOT NULL, -- Encrypted
  expires_at timestamptz NOT NULL,
  scope text[] NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE spreadsheet_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  credential_id uuid REFERENCES google_credentials(id) ON DELETE CASCADE,
  spreadsheet_id text NOT NULL,
  spreadsheet_name text NOT NULL,
  sheet_names text[] NOT NULL,
  last_sync_at timestamptz,
  sync_status text CHECK (sync_status IN ('active', 'paused', 'error')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, spreadsheet_id)
);

CREATE TABLE column_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES spreadsheet_connections(id) ON DELETE CASCADE,
  sheet_name text NOT NULL,
  mapping_config jsonb NOT NULL, -- Column mappings and transformations
  template_name text,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_google_credentials_clinic_id ON google_credentials(clinic_id);
CREATE INDEX idx_spreadsheet_connections_clinic_id ON spreadsheet_connections(clinic_id);
CREATE INDEX idx_column_mappings_connection_id ON column_mappings(connection_id);
```

**Authentication Flow Implementation**:
1. Frontend initiates OAuth flow by redirecting to `/api/auth/google/connect`
2. API route generates state parameter and redirects to Google OAuth consent screen
3. Google redirects back to `/api/auth/google/callback` with authorization code
4. Callback handler exchanges code for access/refresh tokens using server-side flow
5. Tokens are encrypted using Supabase encryption functions and stored in database
6. Frontend receives success confirmation and updates connection status
7. Implement automatic token refresh 5 minutes before expiration using Edge Functions

**Data Extraction Pipeline**:
1. **Discovery Phase**: Query Google Sheets API for accessible spreadsheets, cache results
2. **Selection Phase**: User selects target spreadsheets through frontend interface
3. **Mapping Phase**: Analyze sheet structure, suggest mappings, allow customization
4. **Validation Phase**: Test mappings against sample data, validate data types
5. **Extraction Phase**: Extract data in batches, apply transformations, validate results
6. **Storage Phase**: Insert transformed data into metrics tables with conflict resolution

**Error Handling Strategy**:
- Implement exponential backoff for API rate limits (initial delay: 1s, max: 60s)
- Categorize errors: Authentication, Authorization, API Limits, Data Validation, Network
- For authentication errors: Attempt token refresh, prompt re-authorization if needed
- For API limit errors: Queue requests with intelligent retry scheduling
- For data validation errors: Log details, skip invalid rows, continue processing
- Maintain error logs with Winston structured logging for debugging and monitoring

**Security Considerations**:
- Encrypt all Google API credentials using Supabase built-in encryption
- Implement Row Level Security policies to isolate clinic data
- Validate all user inputs using Zod schemas before processing
- Use HTTPS for all external API communications
- Implement request signing for sensitive operations
- Regular credential rotation with 90-day expiration warnings

### Essential KPI Dashboard

**Feature Goal**: Provide role-based, responsive dashboard interfaces displaying core dental practice metrics with real-time updates, customizable filtering, and optimized performance for up to 50 concurrent users.

**API Relationships**:
- Metrics API endpoints for data retrieval
- Supabase RLS for role-based data filtering
- TanStack Query for caching and real-time updates
- Recharts library for visualization components
- Export API for PDF/CSV generation

#### Detailed Feature Requirements

**Dashboard Layout & Navigation**:
- Implement three distinct dashboard layouts based on user roles:
  - **Office Manager**: Complete financial overview, patient metrics, provider performance, goal tracking
  - **Dentist**: Personal production metrics, patient case acceptance, treatment planning progress
  - **Front Desk**: Appointment analytics, call tracking, daily schedules, patient check-ins
- Responsive design supporting desktop (1920x1080), tablet (768x1024), and mobile (375x812) viewports
- Persistent sidebar navigation with collapsible menu and active state indicators
- Breadcrumb navigation for deep dashboard sections with back button functionality

**Financial Metrics Dashboard**:
- **Production Tracking**: Daily, weekly, monthly production totals with year-over-year comparison
- **Collection Analytics**: Collection percentages, aging reports, payment method breakdown
- **Insurance vs Patient Payments**: Visual breakdown of payment sources with trending
- **Provider Production Comparison**: Side-by-side provider performance with production goals
- **Profit Margin Analysis**: Revenue vs expenses with profitability indicators
- Real-time updates every 15 minutes during business hours, hourly after hours

**Patient Metrics Display**:
- **Active Patient Count**: Total active patients with growth/decline indicators
- **New Patient Acquisition**: Monthly new patient counts with source tracking
- **Recare Rate Tracking**: Hygiene reactivation success rates and overdue patient counts
- **Patient Retention Analytics**: Churn rates, average patient lifetime value
- **Demographics Breakdown**: Age groups, insurance types, geographic distribution
- **Treatment Acceptance Rates**: Case acceptance by treatment type and provider

**Appointment Analytics Interface**:
- **Schedule Efficiency**: Appointment slot utilization with optimal scheduling recommendations
- **Cancellation & No-Show Tracking**: Rates by day of week, time of day, and patient demographics
- **Provider Schedule Analysis**: Productivity by provider with available appointment slots
- **Treatment Type Distribution**: Breakdown of appointment types with revenue per appointment
- **Same-Day Scheduling**: Emergency appointment handling and last-minute availability

**Call Tracking Performance**:
- **Unscheduled Treatment Follow-up**: Success rates for treatment plan follow-up calls
- **Hygiene Reactivation**: Recall appointment booking success rates
- **New Patient Conversion**: Phone inquiry to scheduled appointment conversion rates
- **Call Volume Analytics**: Peak calling times, average call duration, call outcomes
- **Script Performance**: Conversion rates by call script and team member


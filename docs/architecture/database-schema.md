# Database Schema

## Overview

This document describes the PostgreSQL database schema for the Dental Dashboard, including tables, relationships, indexes, and migration strategies. The database is hosted on Supabase and accessed through Prisma ORM.

## Quick Reference

```sql
-- Core tables
users                 -- System authentication and profiles
clinics              -- Dental practice organizations  
providers            -- Dentists and hygienists
locations            -- Physical clinic locations
patients             -- Patient records
appointments         -- Scheduled visits
daily_financials     -- Financial metrics
goals                -- Performance targets
```

## Database Configuration

### Connection Details

```typescript
// Environment variables
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

// Prisma configuration
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### PostgreSQL Settings

```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Database settings
ALTER DATABASE postgres SET timezone TO 'UTC';
```

## Core Tables

### users

System users with authentication details.

```sql
CREATE TABLE users (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  avatar_url TEXT,
  
  -- Role and permissions
  role VARCHAR(50) NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMPTZ,
  
  -- Multi-tenancy
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  current_clinic_id UUID REFERENCES clinics(id),
  
  -- Provider link
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT check_role CHECK (role IN ('admin', 'office_manager', 'provider', 'front_desk', 'viewer'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_provider_id ON users(provider_id) WHERE provider_id IS NOT NULL;
```

### clinics

Dental practice organizations.

```sql
CREATE TABLE clinics (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic information
  name VARCHAR(255) NOT NULL,
  
  -- Contact information
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  website TEXT,
  
  -- Business information
  tax_id VARCHAR(50),
  npi VARCHAR(10),
  license_number VARCHAR(50),
  
  -- Configuration
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/New_York',
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
  
  -- Settings (JSONB for flexibility)
  settings JSONB NOT NULL DEFAULT '{}',
  
  -- Subscription
  subscription_plan VARCHAR(50) DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinics_name ON clinics(name);
CREATE INDEX idx_clinics_is_active ON clinics(is_active);
```

### providers

Medical staff (dentists, hygienists, etc.).

```sql
CREATE TABLE providers (
  -- Primary key (supporting both CUID and UUID during migration)
  id VARCHAR(36) PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  
  -- Personal information
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  
  -- Professional information
  type VARCHAR(20) NOT NULL DEFAULT 'dentist',
  specialty VARCHAR(100),
  license_number VARCHAR(50) NOT NULL,
  license_state VARCHAR(2) NOT NULL,
  license_expiry DATE,
  npi VARCHAR(10),
  dea_number VARCHAR(20),
  
  -- Employment
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  primary_location_id UUID REFERENCES locations(id),
  employee_id VARCHAR(50),
  hire_date DATE,
  termination_date DATE,
  employment_type VARCHAR(20) DEFAULT 'full_time',
  
  -- Schedule (JSONB for flexibility)
  work_schedule JSONB DEFAULT '{}',
  color_code VARCHAR(7), -- Hex color for calendar
  
  -- Profile
  biography TEXT,
  photo_url TEXT,
  specializations TEXT[],
  languages TEXT[],
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_accepting_patients BOOLEAN DEFAULT true,
  
  -- User account link
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_provider_type CHECK (type IN ('dentist', 'hygienist', 'assistant', 'specialist')),
  CONSTRAINT check_employment_type CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary'))
);

CREATE INDEX idx_providers_clinic_id ON providers(clinic_id);
CREATE INDEX idx_providers_email ON providers(email);
CREATE INDEX idx_providers_is_active ON providers(is_active);
CREATE INDEX idx_providers_type ON providers(type);
CREATE INDEX idx_providers_uuid ON providers(uuid) WHERE uuid IS NOT NULL;
CREATE INDEX idx_providers_display_name_trgm ON providers USING gin(display_name gin_trgm_ops);
```

### locations

Physical clinic locations.

```sql
CREATE TABLE locations (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic information
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20),
  type VARCHAR(20) DEFAULT 'main_office',
  
  -- Address
  address TEXT NOT NULL,
  address2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  phone_number VARCHAR(20) NOT NULL,
  fax_number VARCHAR(20),
  email VARCHAR(255),
  
  -- Operations
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  operating_hours JSONB DEFAULT '{}',
  holiday_schedule JSONB DEFAULT '[]',
  
  -- Facilities
  operatories INTEGER DEFAULT 0,
  equipment JSONB DEFAULT '[]',
  amenities TEXT[],
  
  -- Financial
  tax_rate DECIMAL(5, 4),
  overhead_rate DECIMAL(5, 4),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  opened_date DATE,
  closed_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_location_type CHECK (type IN ('main_office', 'satellite', 'specialty', 'mobile'))
);

CREATE INDEX idx_locations_clinic_id ON locations(clinic_id);
CREATE INDEX idx_locations_is_active ON locations(is_active);
CREATE INDEX idx_locations_name ON locations(name);
```

### provider_locations

Junction table for provider-location assignments.

```sql
CREATE TABLE provider_locations (
  -- Composite primary key
  provider_id VARCHAR(36) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  
  -- Assignment details
  is_primary BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  schedule JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (provider_id, location_id)
);

CREATE INDEX idx_provider_locations_provider ON provider_locations(provider_id);
CREATE INDEX idx_provider_locations_location ON provider_locations(location_id);
```

### patients

Patient records (simplified for MVP).

```sql
CREATE TABLE patients (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Identifiers
  chart_number VARCHAR(50),
  
  -- Personal information
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  preferred_name VARCHAR(50),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  
  -- Contact
  email VARCHAR(255),
  phone_number VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  
  -- Address (JSONB for flexibility)
  address JSONB NOT NULL DEFAULT '{}',
  
  -- Emergency contact
  emergency_contact JSONB DEFAULT '{}',
  
  -- Clinical
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  primary_provider_id VARCHAR(36) REFERENCES providers(id),
  allergies TEXT[],
  medications TEXT[],
  medical_history JSONB DEFAULT '{}',
  
  -- Insurance (array of JSONB)
  insurances JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  first_visit_date DATE,
  last_visit_date DATE,
  
  -- Preferences
  communication_preference VARCHAR(20) DEFAULT 'email',
  appointment_reminders BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_gender CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  CONSTRAINT check_communication CHECK (communication_preference IN ('email', 'sms', 'phone', 'mail'))
);

CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_primary_provider ON patients(primary_provider_id);
CREATE INDEX idx_patients_last_name ON patients(last_name);
CREATE INDEX idx_patients_phone ON patients(phone_number);
CREATE INDEX idx_patients_chart_number ON patients(chart_number) WHERE chart_number IS NOT NULL;
```

### appointments

Scheduled patient visits.

```sql
CREATE TABLE appointments (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_number VARCHAR(50),
  
  -- Scheduling
  provider_id VARCHAR(36) NOT NULL REFERENCES providers(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  
  -- Time
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration INTEGER NOT NULL, -- minutes
  
  -- Type and status
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  confirmation_status VARCHAR(20) DEFAULT 'unconfirmed',
  
  -- Clinical
  reason_for_visit TEXT NOT NULL,
  procedures JSONB DEFAULT '[]',
  notes TEXT,
  treatment_plan_id UUID,
  
  -- Financial (stored in cents)
  estimated_production INTEGER DEFAULT 0,
  actual_production INTEGER,
  insurance_coverage INTEGER,
  patient_responsibility INTEGER,
  
  -- Tracking
  created_by UUID NOT NULL REFERENCES users(id),
  confirmed_by UUID REFERENCES users(id),
  completed_by UUID REFERENCES users(id),
  cancelled_by UUID REFERENCES users(id),
  cancel_reason TEXT,
  
  -- Reminders
  reminders_sent JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_appointment_type CHECK (type IN ('exam', 'cleaning', 'treatment', 'consultation', 'emergency', 'follow_up')),
  CONSTRAINT check_appointment_status CHECK (status IN ('scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled')),
  CONSTRAINT check_time_order CHECK (scheduled_end > scheduled_start)
);

CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_location_id ON appointments(location_id);
CREATE INDEX idx_appointments_scheduled_start ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_provider ON appointments(DATE(scheduled_start), provider_id);
```

### daily_financials

Aggregated financial metrics.

```sql
CREATE TABLE daily_financials (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Date and scope
  date DATE NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  provider_id VARCHAR(36) REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Production (cents)
  scheduled_production INTEGER DEFAULT 0,
  completed_production INTEGER DEFAULT 0,
  adjustments INTEGER DEFAULT 0,
  net_production INTEGER DEFAULT 0,
  
  -- Collections (cents)
  patient_payments INTEGER DEFAULT 0,
  insurance_payments INTEGER DEFAULT 0,
  total_collections INTEGER DEFAULT 0,
  refunds INTEGER DEFAULT 0,
  
  -- Procedures
  procedure_count INTEGER DEFAULT 0,
  procedures_by_category JSONB DEFAULT '{}',
  
  -- Patients
  patients_scheduled INTEGER DEFAULT 0,
  patients_seen INTEGER DEFAULT 0,
  new_patients INTEGER DEFAULT 0,
  
  -- Appointments
  appointments_scheduled INTEGER DEFAULT 0,
  appointments_completed INTEGER DEFAULT 0,
  appointments_cancelled INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  
  -- Calculated metrics
  collection_rate DECIMAL(5, 4),
  production_per_patient INTEGER,
  case_acceptance_rate DECIMAL(5, 4),
  
  -- Source tracking
  source VARCHAR(20) NOT NULL DEFAULT 'manual',
  imported_at TIMESTAMPTZ,
  imported_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_daily_financial UNIQUE (date, clinic_id, location_id, provider_id),
  CONSTRAINT check_source CHECK (source IN ('manual', 'google_sheets', 'api', 'calculated'))
);

CREATE INDEX idx_daily_financials_date ON daily_financials(date);
CREATE INDEX idx_daily_financials_clinic ON daily_financials(clinic_id);
CREATE INDEX idx_daily_financials_location ON daily_financials(location_id);
CREATE INDEX idx_daily_financials_provider ON daily_financials(provider_id);
CREATE INDEX idx_daily_financials_composite ON daily_financials(date, clinic_id, location_id);
```

### goals

Performance targets and tracking.

```sql
CREATE TABLE goals (
  -- Primary key
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Scope
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  provider_id VARCHAR(36) REFERENCES providers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  
  -- Definition
  type VARCHAR(20) NOT NULL,
  metric VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER,
  quarter INTEGER,
  
  -- Values (cents for financial goals)
  target INTEGER NOT NULL,
  actual INTEGER DEFAULT 0,
  variance INTEGER GENERATED ALWAYS AS (actual - target) STORED,
  percentage_achieved DECIMAL(5, 4) GENERATED ALWAYS AS (
    CASE WHEN target > 0 THEN actual::DECIMAL / target ELSE 0 END
  ) STORED,
  
  -- Status and tracking
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  adjustments JSONB DEFAULT '[]',
  
  -- Notifications
  thresholds JSONB DEFAULT '[]',
  last_alert_sent TIMESTAMPTZ,
  
  -- Approval
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_goal_type CHECK (type IN ('financial', 'operational', 'quality')),
  CONSTRAINT check_goal_metric CHECK (metric IN ('production', 'collection', 'new_patients', 'case_acceptance', 'hygiene_production')),
  CONSTRAINT check_goal_period CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  CONSTRAINT check_goal_status CHECK (status IN ('draft', 'active', 'achieved', 'missed', 'cancelled')),
  CONSTRAINT check_period_fields CHECK (
    (period = 'monthly' AND month IS NOT NULL) OR
    (period = 'quarterly' AND quarter IS NOT NULL) OR
    (period NOT IN ('monthly', 'quarterly'))
  )
);

CREATE INDEX idx_goals_clinic ON goals(clinic_id);
CREATE INDEX idx_goals_provider ON goals(provider_id);
CREATE INDEX idx_goals_period ON goals(year, period);
CREATE INDEX idx_goals_status ON goals(status);
```

## Supporting Tables

### audit_logs

Track important system changes.

```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(50) NOT NULL,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### google_sheets_sync

Track Google Sheets synchronization.

```sql
CREATE TABLE google_sheets_sync (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  spreadsheet_id VARCHAR(255) NOT NULL,
  sheet_name VARCHAR(255) NOT NULL,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sheets_sync_clinic ON google_sheets_sync(clinic_id);
CREATE INDEX idx_sheets_sync_status ON google_sheets_sync(status);
```

## Views

### provider_metrics_view

Aggregated provider performance metrics.

```sql
CREATE OR REPLACE VIEW provider_metrics_view AS
SELECT 
  p.id AS provider_id,
  p.display_name,
  p.clinic_id,
  
  -- YTD metrics
  COALESCE(SUM(CASE 
    WHEN df.date >= DATE_TRUNC('year', CURRENT_DATE) 
    THEN df.net_production 
  END), 0) AS production_ytd,
  
  -- MTD metrics
  COALESCE(SUM(CASE 
    WHEN df.date >= DATE_TRUNC('month', CURRENT_DATE) 
    THEN df.net_production 
  END), 0) AS production_mtd,
  
  -- Patient counts
  COUNT(DISTINCT CASE 
    WHEN a.scheduled_start >= CURRENT_DATE - INTERVAL '18 months' 
    THEN a.patient_id 
  END) AS active_patients,
  
  -- Appointment metrics
  COUNT(CASE 
    WHEN a.status = 'completed' 
    AND a.scheduled_start >= DATE_TRUNC('year', CURRENT_DATE)
    THEN 1 
  END) AS appointments_completed_ytd

FROM providers p
LEFT JOIN daily_financials df ON p.id = df.provider_id
LEFT JOIN appointments a ON p.id = a.provider_id
WHERE p.is_active = true
GROUP BY p.id, p.display_name, p.clinic_id;
```

## Functions and Triggers

### Updated timestamp trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for all tables...
```

### RLS context function

```sql
-- Get current clinic ID from JWT claims
CREATE OR REPLACE FUNCTION get_current_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'clinic_id',
    current_setting('app.current_clinic_id', true)
  )::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row Level Security (RLS)

### Enable RLS on all tables

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
-- Users can only see their own clinic's data
CREATE POLICY clinic_isolation_users ON users
  FOR ALL USING (clinic_id = get_current_clinic_id());

-- Providers visible within clinic
CREATE POLICY clinic_isolation_providers ON providers
  FOR ALL USING (clinic_id = get_current_clinic_id());

-- Appointments visible within clinic
CREATE POLICY clinic_isolation_appointments ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = appointments.provider_id
      AND p.clinic_id = get_current_clinic_id()
    )
  );

-- Financial data restricted to clinic
CREATE POLICY clinic_isolation_financials ON daily_financials
  FOR ALL USING (clinic_id = get_current_clinic_id());
```

## Indexes Strategy

### Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_appointments_provider_date 
  ON appointments(provider_id, scheduled_start);

CREATE INDEX idx_daily_financials_date_clinic 
  ON daily_financials(date DESC, clinic_id);

-- Partial indexes for active records
CREATE INDEX idx_providers_active 
  ON providers(clinic_id) 
  WHERE is_active = true;

-- Text search indexes
CREATE INDEX idx_patients_search 
  ON patients USING gin(
    to_tsvector('english', 
      first_name || ' ' || last_name || ' ' || COALESCE(preferred_name, '')
    )
  );
```

### Foreign Key Indexes

All foreign keys automatically have indexes created for performance.

## Migration Strategy

### Version Control

All schema changes tracked in:
- `/prisma/migrations/` - Prisma migrations
- `/migrations/` - Raw SQL migrations
- `/supabase/migrations/` - Supabase-specific

### Migration Process

```bash
# Development iteration
pnpm prisma db push

# Production migration
pnpm prisma migrate dev --name descriptive_name

# Apply to production
pnpm prisma migrate deploy
```

### Rollback Strategy

Each migration includes rollback scripts:
```sql
-- migrations/rollback/001_rollback.sql
DROP TABLE IF EXISTS new_table CASCADE;
ALTER TABLE existing_table DROP COLUMN IF EXISTS new_column;
```

## Data Types Reference

### Custom Types

```sql
-- Create custom types
CREATE TYPE user_role AS ENUM (
  'admin', 
  'office_manager', 
  'provider', 
  'front_desk', 
  'viewer'
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'confirmed', 
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'rescheduled'
);
```

### JSONB Usage

JSONB used for flexible, schema-less data:
- `settings` - Clinic configuration
- `work_schedule` - Provider schedules
- `procedures` - Appointment procedures
- `address` - Patient addresses

## Performance Considerations

### Query Optimization

1. **Use indexes**: All foreign keys and common WHERE clauses
2. **Partial indexes**: For filtered queries (e.g., active records)
3. **Composite indexes**: For multi-column queries
4. **JSONB indexes**: GIN indexes for JSONB queries

### Partitioning Strategy

For large tables, consider partitioning:
```sql
-- Example: Partition appointments by year
CREATE TABLE appointments_2024 PARTITION OF appointments
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## Security Considerations

### Data Encryption

- Passwords: Handled by Supabase Auth (bcrypt)
- PII: Consider column-level encryption for sensitive data
- API Keys: Stored in encrypted vault

### Access Control

- Row Level Security for multi-tenancy
- Role-based permissions in application layer
- Audit logging for compliance

## Related Resources

- [Data Models](./data-models.md) - Business entity definitions
- [Backend Architecture](./backend-architecture.md) - Data access patterns
- [Security Considerations](./security-considerations.md) - Security implementation

---

**Last Updated**: December 2024
**Navigation**: [Back to Architecture Index](./index.md)
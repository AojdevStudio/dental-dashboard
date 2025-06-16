## Feature Specifications

### Google Sheets Integration Core

**Feature Goal**: Provide Google Apps Script templates and monitoring capabilities for dental practices to automatically sync their spreadsheet data directly to the Supabase database, with comprehensive error tracking and sync status monitoring.

**API Relationships**:
- Google Apps Script runtime with built-in cron scheduling
- Supabase REST API for direct database operations via service key
- Supabase Edge Functions for background processing and metric calculations
- Prisma ORM for data storage and retrieval
- Winston logging for operation tracking

#### Detailed Feature Requirements

**Google Apps Script Templates**:
- Provide pre-built Google Apps Script templates for common dental practice spreadsheet formats:
  - Production tracking (Date, Provider, Procedure Code, Amount, Patient)
  - Collection reports (Date, Payment Type, Amount, Insurance vs Patient Portion)
  - Appointment logs (Date, Time, Provider, Patient, Status, Type)
  - Patient demographics (Name, Phone, Email, Insurance, Last Visit)
- Include data transformation functions for standardizing formats before database upsert
- Implement built-in data validation using Google Apps Script utilities
- Support configurable sync schedules using Google Apps Script triggers
- Include error handling and retry logic within the script templates
- Integrate Google Apps Script's built-in error notifications for sync failures

**Script Deployment & Configuration**:
- Provide step-by-step deployment guides for each template type
- Include secure Supabase service key configuration instructions
- Support multiple clinic configurations through script parameters
- Implement clinic and data source identification in upsert operations
- Provide script versioning and update mechanisms

**Data Processing & Upserts**:
- Extract data using Google Apps Script's built-in spreadsheet reading methods
- Transform data to match Supabase database schema requirements
- Implement direct upserts to Supabase via REST API with conflict resolution
- Handle data type conversion and validation within the script
- Support batch operations for efficient database updates
- Include data deduplication logic based on configurable key combinations

**Background Processing & Calculations**:
- Use Supabase Edge Functions for all metric calculations and data aggregations
- Trigger calculations automatically after data upserts from Google Apps Script
- Handle complex KPI computations that cannot be done in real-time
- Implement data consistency checks and validation via Edge Functions
- Process historical data imports and transformations through background functions


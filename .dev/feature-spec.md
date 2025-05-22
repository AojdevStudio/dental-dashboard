## Feature Specifications

### Google Sheets Integration Core

**Feature Goal**: Establish secure, reliable connection to Google Sheets API with automated data extraction and standardized metric mapping for essential dental practice KPIs, supporting multiple spreadsheets per clinic with comprehensive error handling and retry mechanisms.

**API Relationships**:
- Google Sheets API v4 for spreadsheet operations
- Supabase Auth API for credential storage
- Next.js API routes for frontend integration
- Supabase Edge Functions for background processing
- Prisma ORM for data source configuration management

#### Detailed Feature Requirements

**Authentication & Authorization**:
- Implement OAuth 2.0 flow with Google Sheets API using server-side authorization code flow
- Store encrypted Google API credentials in Supabase with automatic token refresh
- Support multiple Google accounts per clinic with account switching capability
- Implement scope validation to ensure minimum required permissions (spreadsheets.readonly)
- Handle OAuth errors including expired tokens, revoked access, and insufficient permissions

**Spreadsheet Discovery & Selection**:
- Retrieve and display all accessible spreadsheets from connected Google accounts
- Implement spreadsheet filtering by name, last modified date, and ownership
- Support folder-based organization display matching Google Drive structure
- Cache spreadsheet metadata with 1-hour TTL to reduce API calls
- Handle large spreadsheet lists with pagination (100 spreadsheets per page)

**Column Mapping & Templates**:
- Provide pre-defined mapping templates for common dental practice formats:
  - Production tracking (Date, Provider, Procedure Code, Amount, Patient)
  - Collection reports (Date, Payment Type, Amount, Insurance vs Patient Portion)
  - Appointment logs (Date, Time, Provider, Patient, Status, Type)
  - Patient demographics (Name, Phone, Email, Insurance, Last Visit)
- Support custom column mapping with drag-and-drop interface
- Validate column data types against expected KPI requirements
- Save mapping configurations per spreadsheet with versioning support
- Detect and suggest mapping changes when spreadsheet structure changes

**Data Extraction & Transformation**:
- Extract data using batch operations with 1000-row chunks to respect API limits
- Implement real-time data validation using Zod schemas during extraction
- Transform extracted data to standardized internal format with type coercion
- Handle missing data with configurable default values or skip rules
- Support date format standardization across different spreadsheet formats
- Implement data deduplication based on configurable key combinations

**Synchronization Management**:
- Support both manual and scheduled synchronization with cron-based scheduling
- Implement incremental sync using last-modified timestamps when available
- Provide detailed sync status tracking with progress indicators
- Store sync history with timestamp, record counts, and error details
- Support sync rollback for failed operations with data integrity protection


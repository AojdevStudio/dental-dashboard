# System Patterns: Dental Practice Analytics Dashboard
*Version: 1.3*
*Created: 2025-05-17*
*Last Updated: 2025-06-14*

## Core System Architecture

### **Enhanced Dashboard Architecture (Updated 2025-06-03)**

The dashboard system now implements a comprehensive layout pattern with optimized performance and user experience:

#### **Layout Structure**
```
┌─────────────────────────────────────────────────────┐
│ Top Navigation Bar (Fixed)                         │
│ [Logo] [Breadcrumb] [Search] [Notifications] [User]│
├─────────────────────┬───────────────────────────────┤
│ Collapsible Sidebar │ Main Content Area             │
│                     │                               │
│ [Navigation Items]  │ [Page Content]                │
│ [Role-based Menu]   │ [Widgets/Forms/Tables]        │
│ [Collapse Toggle]   │ [Loading States]              │
│                     │                               │
│ [User Profile]      │                               │
│ [Settings]          │                               │
└─────────────────────┴───────────────────────────────┘
```

#### **Performance Pattern**
- **React Query Integration**: Aggressive caching with 24-42ms subsequent load times
- **API Response Caching**: Appropriate headers for optimized data retrieval
- **Skeleton Loading**: Improved perceived performance during data fetching
- **Optimistic Updates**: Better user experience with background synchronization

#### **Navigation State Management**
- Persistent sidebar state across sessions using local storage
- Type-safe navigation components with proper TypeScript definitions
- Dynamic navigation based on user roles and clinic permissions
- Responsive design for mobile, tablet, and desktop experiences

### **Multi-Tenant Data Architecture**

The system implements a comprehensive multi-tenant architecture with UUID-based identifiers:

#### **Core Entity Relationships**
```
Organizations (Root Level)
├── Clinics (Tenant Level)
│   ├── Users (Clinic Members with Roles)
│   ├── Providers (Staff/Dentists)
│   ├── Patients (Per Clinic)
│   ├── Appointments (Per Clinic)
│   ├── Metrics (Per Clinic)
│   ├── Goals (Per Clinic)
│   ├── Data Sources (Per Clinic)
│   └── Audit Logs (Per Clinic)
└── Scheduled Jobs (Cross-Tenant)
```

#### **Row Level Security (RLS) Pattern**
All tables implement comprehensive RLS policies with helper functions:
- `get_user_clinics()`: Returns clinics accessible to current user
- `has_clinic_access()`: Validates user access to specific clinic
- `is_clinic_admin()`: Checks administrative permissions
- `get_user_role()`: Returns user role within clinic context

### **Authentication & Authorization Patterns**

#### **Enhanced Multi-Step Registration**
```
Step 1: Account Information
├── Email validation and uniqueness check
├── Password strength validation
├── Name and phone number collection
└── Real-time validation feedback

Step 2: Role & Clinic Setup
├── Role selection (Admin, Manager, Staff, Provider)
├── Clinic association options:
│   ├── Create new clinic (with auto-generated code)
│   └── Join existing clinic (via registration code)
├── Provider-specific fields (for dentist roles)
└── Clinic verification and validation

Step 3: Terms & Agreements
├── Legal terms acceptance
├── Registration summary review
├── Final confirmation
└── Transaction-based account creation
```

#### **Enhanced Login Process**
```
Authentication Flow:
├── Supabase Auth verification
├── Database user existence check
├── Clinic association validation
├── Role verification within clinic
├── Session establishment
└── Error handling with user feedback
```

### **Google Sheets Integration Architecture**

#### **Enhanced OAuth Pattern (Updated 2025-06-03)**
```
Google Sheets Integration:
├── OAuth 2.0 Secure Authentication
│   ├── Limited scope (Google Sheets read access only)
│   ├── Secure token storage in data source records
│   └── Token refresh mechanisms
├── Provider Name Auto-Extraction
│   ├── Sheet title parsing for provider identification
│   ├── Hygiene production tracking enhancement
│   └── Automated provider association
├── Data Discovery & Extraction
│   ├── Spreadsheet metadata fetching
│   ├── Range-based data extraction (A1 notation)
│   └── Error handling and validation
└── Connection Management
    ├── Status tracking and validation
    ├── Multi-source support per clinic
    └── Debugging and testing infrastructure
```

#### **Data Transformation Pipeline Pattern**
```
Google Sheets → Raw Data Extraction → Column Mapping → Data Validation → Metrics Storage
     ↓                    ↓                  ↓              ↓                ↓
OAuth Token      Spreadsheet API    Mapping Templates  Business Rules  Database Tables
Management       Integration        Application        Validation      (Metrics, etc.)
```

### **Data Flow Architecture**

#### **Metrics Calculation Pattern**
```
Data Sources (Google Sheets)
├── Raw Data Extraction
├── Column Mapping & Transformation
├── Business Logic Application
├── Metrics Calculation (Supabase Edge Functions)
├── Database Storage (Metrics Tables)
└── Dashboard Visualization (React Components)
```

#### **Scheduled Processing Pattern**
```
Scheduled Jobs (pg_cron):
├── Daily Aggregation (2 AM)
│   ├── Financial metrics rollup
│   ├── Patient statistics calculation
│   └── Appointment analytics update
├── Weekly Reports (3 AM Mondays)
│   ├── Provider performance analysis
│   ├── Goal progress calculation
│   └── Trend analysis updates
├── Monthly Cleanup (4 AM 1st of month)
│   ├── Archive old data
│   ├── Cleanup temporary records
│   └── Optimize database performance
└── Hourly Sync Check (15 past each hour)
    ├── Update last_sync_attempt for active data sources
    ├── Monitor connection health
    └── Handle failed synchronizations
```

### **API Design Patterns**

#### **Enhanced RESTful API Structure**
```
/api/
├── auth/                     # Authentication endpoints
│   ├── register-comprehensive # Multi-step registration
│   ├── session              # Session management
│   └── google/              # OAuth endpoints
├── clinics/                 # Clinic management
│   ├── [clinicId]/         # Specific clinic operations
│   ├── switch/             # Clinic switching
│   └── statistics/         # Clinic-level analytics
├── google-sheets/          # Integration endpoints
│   ├── discover/           # Spreadsheet discovery
│   ├── mapping/            # Column mapping
│   ├── sync/               # Data synchronization
│   └── validate/           # Connection validation
├── metrics/                # Metrics and analytics
│   ├── financial/          # Financial KPIs
│   ├── patients/           # Patient metrics
│   ├── appointments/       # Appointment analytics
│   └── providers/          # Provider performance
└── users/                  # User management
    ├── [userId]/           # User-specific operations
    └── invite/             # User invitation system
```

#### **Response Pattern with Caching**
```typescript
// Standard API Response Pattern
{
  data: T | null,
  error: string | null,
  meta: {
    timestamp: string,
    clinic_id: string,
    user_id: string,
    cache_hint?: number
  }
}

// Caching Headers Pattern
headers: {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
  'ETag': 'response-hash',
  'Vary': 'Authorization, X-Clinic-ID'
}
```

### **Error Handling Patterns**

#### **Comprehensive Error Boundary Pattern**
```
Application Level:
├── Global Error Boundary (app/error.tsx)
├── Route-Level Error Boundaries (page-level error.tsx)
├── Component-Level Error Handling
├── API Error Response Standardization
└── User-Friendly Error Messages

Error Types:
├── Authentication Errors (401, 403)
├── Validation Errors (400)
├── Not Found Errors (404)
├── Integration Errors (Google Sheets API)
├── Database Errors (RLS, Connection)
└── Rate Limiting Errors (429)
```

### **Testing Patterns**

#### **Comprehensive Testing Strategy**
```
Testing Levels:
├── Unit Tests (Components, Utilities)
│   ├── Component behavior testing
│   ├── Hook testing with React Testing Library
│   └── Utility function validation
├── Integration Tests (API Routes, Database)
│   ├── API endpoint testing with mock data
│   ├── Database interaction testing
│   └── Google Sheets integration testing
├── End-to-End Tests (User Flows)
│   ├── Authentication flow testing
│   ├── Dashboard navigation testing
│   └── Google Sheets connection testing
└── Performance Tests
    ├── Load time optimization validation
    ├── Cache effectiveness testing
    └── React Query behavior validation
```

### **Security Patterns**

#### **Defense in Depth Strategy**
```
Security Layers:
├── Authentication (Supabase Auth + Database Verification)
├── Authorization (RLS Policies + Role-Based Access)
├── Data Validation (Input Sanitization + Schema Validation)
├── API Security (Rate Limiting + Request Validation)
├── Integration Security (OAuth Scopes + Token Management)
└── Audit Logging (Comprehensive Activity Tracking)
```

### **Performance Optimization Patterns**

#### **Caching Strategy**
```
Caching Levels:
├── Browser Cache (Static Assets, API Responses)
├── React Query Cache (Server State Management)
│   ├── Automatic background refetching
│   ├── Optimistic updates
│   ├── Stale-while-revalidate patterns
│   └── Cache invalidation strategies
├── API Response Cache (Next.js API Routes)
├── Database Query Cache (Supabase Query Optimization)
└── CDN Cache (Static Assets, Future Implementation)
```

#### **Loading State Pattern**
```
Loading States:
├── Skeleton UI Components
│   ├── Dashboard widgets
│   ├── Data tables
│   └── Form placeholders
├── Progressive Loading
│   ├── Critical content first
│   ├── Non-critical content lazy loading
│   └── Image lazy loading
└── Background Processing
    ├── React Query background updates
    ├── Optimistic UI updates
    └── Silent error recovery
```

### **Monitoring & Observability Patterns**

#### **Comprehensive Monitoring Strategy**
```
Monitoring Layers:
├── Application Performance Monitoring
│   ├── Page load times (585-626ms initial, 24-42ms subsequent)
│   ├── Component render times
│   ├── API response times
│   └── Error rates and patterns
├── Database Performance Monitoring
│   ├── Query performance tracking
│   ├── RLS policy effectiveness
│   ├── Scheduled job execution monitoring
│   └── Connection pool monitoring
├── Integration Monitoring
│   ├── Google Sheets API call success rates
│   ├── OAuth token refresh success
│   ├── Data synchronization health
│   └── Error tracking and recovery
└── User Experience Monitoring
    ├── Navigation patterns
    ├── Feature usage analytics
    ├── Error recovery success rates
    └── Performance perception metrics
```

### **Future Architecture Considerations**

#### **Scalability Patterns**
- **Horizontal Scaling**: Multi-region deployment strategy
- **Database Scaling**: Read replicas and connection pooling optimization
- **Cache Scaling**: Redis implementation for cross-instance caching
- **API Scaling**: Rate limiting and load balancing strategies

#### **Feature Flag Pattern**
- **Gradual Rollout**: New feature controlled release
- **A/B Testing**: User experience optimization testing
- **Circuit Breaker**: Automatic feature disabling on errors
- **Environment-Based**: Different features per environment

---

*This document defines the core architectural patterns and design decisions for the system.* 
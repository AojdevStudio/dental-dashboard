# Apps Script Automation: Hygienist Sync v2.1 Multi-Provider System

## Quick Overview
A resilient Google Apps Script system that automatically detects hygienists from spreadsheet names, maintains data continuity during staff changes, and enables self-service provider onboarding through the dashboard UI without requiring technical intervention.

## Key Components
- **Primary Service:** Google Sheets with Supabase integration
- **Trigger:** Daily automated sync at 6 AM + on-edit triggers
- **Data Flow:** Google Sheets → Provider Detection → External Mapping Resolution → Supabase Database
- **Users:** Clinic admins, hygienists, and IT support
- **Complexity:** High (multi-provider detection and resilience features)

## Critical Requirements

### 1. **Automatic Provider Detection**
System must identify hygienists from spreadsheet names using regex patterns without manual configuration. Supports "Adriane Fontenot", "Kia Redfearn" with extensibility for new providers.

### 2. **Self-Service Provider Onboarding**
New hygienists are added through the dashboard UI (/providers/new), automatically generating provider codes and external mappings. No Apps Script code changes required.

### 3. **Data Continuity During Staff Changes**
When hygienists leave, setting status to 'inactive' stops sync but preserves 100% of historical data. Dashboard continues showing historical metrics while excluding from current reports.

## Technical Highlights
- **APIs Required:** Google Sheets, Drive, Gmail, Supabase REST API, Dashboard API
- **External Integrations:** ExternalIdMapping system for sync resilience
- **Performance Target:** Process 2000 records in < 300 seconds
- **Security Level:** Internal PHI with HIPAA considerations

## Provider Management Workflows

### New Hygienist Onboarding
1. **Dashboard Creation:** Admin creates provider via `/providers/new` with auto-generated provider code
2. **External Mapping:** System creates ExternalIdMapping entries for sync resilience  
3. **Sheet Creation:** Create Google Sheet with provider name for auto-detection
4. **Script Deployment:** Deploy Apps Script and run setup wizard
5. **Auto-Detection:** System detects provider and begins sync automatically

### Hygienist Departure
1. **Status Change:** Admin sets provider.status = 'inactive' in dashboard
2. **Sync Stoppage:** Apps Script detects inactive status and stops processing
3. **Data Preservation:** All historical data remains intact and accessible
4. **Reporting Impact:** Hidden from current metrics, visible in historical reports

## Implementation Approach
The system uses a **database-first approach** where providers are managed in the dashboard UI, and Apps Scripts dynamically detect and sync based on the authoritative provider registry. This eliminates the need for hardcoded configurations and enables business users to manage provider lifecycle without technical involvement.

**Key Innovation:** External ID mapping system ensures sync continuity even after database reseeds, making the system truly resilient to infrastructure changes.

## Risk Areas
- **Provider Detection Accuracy:** Regex patterns must reliably identify providers from varied spreadsheet naming
- **Performance Scaling:** System must handle increasing provider count without timeouts  
- **Mapping Resilience:** External mappings must survive database changes and provide fallback mechanisms

## Estimated Timeline
- **Requirements Review:** 4 hours
- **Development:** 24 hours (provider detection, mapping system, UI integration)
- **Testing:** 8 hours (multi-provider scenarios, error handling, performance)
- **Deployment:** 4 hours (staging validation, production rollout)
- **Total:** 40 hours

## Next Steps for Developer
1. Review the full specification: `/Users/ossieirondi/Projects/kamdental/dental-dashboard-db-sync-fixes/docs/specs/apps-script-hygienist-sync-multi-provider-spec.json`
2. Examine existing multi-provider utilities in `shared-multi-provider-utils.gs`
3. Set up test environment with sample provider data
4. Begin with provider detection logic and external mapping integration

## Dashboard Integration Requirements

### Provider Management UI Enhancements Needed
- **Provider Status Toggle:** UI to activate/deactivate providers
- **Sync Status Indicator:** Show last sync status and health per provider
- **Provider Code Display:** Show auto-generated provider codes for reference
- **External Mapping Viewer:** Admin interface to view and manage mappings

### API Endpoints to Implement
- `GET /api/providers/:id/sync-status` - Get sync health for specific provider
- `POST /api/providers/:id/sync-test` - Trigger test sync for provider validation
- `GET /api/external-mappings` - List external mappings for troubleshooting
- `POST /api/external-mappings` - Create/update mappings for new providers

## Questions for Stakeholder
1. **Provider Naming Standards:** Should we enforce specific naming patterns for new hygienists to improve auto-detection reliability?
2. **Notification Preferences:** Which staff members should receive sync failure alerts, and through what channels?
3. **Historical Data Access:** How long should inactive provider data remain visible in reports?
4. **Scaling Timeline:** What's the expected growth rate for hygienist count to inform performance optimization priorities?
5. **Approval Workflow:** Should new provider creation require approval, or can clinic admins create providers immediately?

## Success Metrics
- **Zero-Downtime Transitions:** Staff changes cause no sync interruption
- **95% Self-Service Rate:** Provider additions completed via UI without IT
- **99.5% Sync Success Rate:** High reliability for daily operations
- **< 60 Second Sync Duration:** Fast processing for daily volumes
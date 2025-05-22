## File System

### Frontend Repository Structure
```
dental-analytics-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── integrations/
│   │   │   ├── google-sheets/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── connect/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── mapping/
│   │   │   │       └── page.tsx
│   │   │   └── page.tsx
│   │   ├── goals/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [goalId]/
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── export/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── clinic/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [userId]/
│   │   │   │       └── page.tsx
│   │   │   └── providers/
│   │   │       ├── page.tsx
│   │   │       └── [providerId]/
│   │   │           └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google/
│   │   │   │   ├── connect/
│   │   │   │   │   └── route.ts
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   └── session/
│   │   │       └── route.ts
│   │   ├── google-sheets/
│   │   │   ├── discover/
│   │   │   │   └── route.ts
│   │   │   ├── sync/
│   │   │   │   └── route.ts
│   │   │   ├── mapping/
│   │   │   │   └── route.ts
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   ├── metrics/
│   │   │   ├── financial/
│   │   │   │   └── route.ts
│   │   │   ├── patients/
│   │   │   │   └── route.ts
│   │   │   ├── appointments/
│   │   │   │   └── route.ts
│   │   │   ├── providers/
│   │   │   │   └── route.ts
│   │   │   └── calls/
│   │   │       └── route.ts
│   │   ├── goals/
│   │   │   ├── route.ts
│   │   │   └── [goalId]/
│   │   │       └── route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   ├── invite/
│   │   │   │   └── route.ts
│   │   │   └── [userId]/
│   │   │       └── route.ts
│   │   ├── clinics/
│   │   │   ├── route.ts
│   │   │   └── [clinicId]/
│   │   │       ├── route.ts
│   │   │       └── providers/
│   │   │           └── route.ts
│   │   └── export/
│   │       ├── pdf/
│   │       │   └── route.ts
│   │       └── csv/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── toast.tsx
│   │   └── loading-spinner.tsx
│   ├── dashboard/
│   │   ├── metric-card.tsx
│   │   ├── kpi-chart.tsx
│   │   ├── provider-performance.tsx
│   │   ├── financial-overview.tsx
│   │   ├── patient-metrics.tsx
│   │   ├── appointment-analytics.tsx
│   │   ├── call-tracking.tsx
│   │   └── dashboard-layout.tsx
│   ├── google-sheets/
│   │   ├── connection-status.tsx
│   │   ├── spreadsheet-selector.tsx
│   │   ├── column-mapper.tsx
│   │   ├── sync-status.tsx
│   │   └── mapping-preview.tsx
│   ├── goals/
│   │   ├── goal-card.tsx
│   │   ├── goal-progress.tsx
│   │   ├── goal-form.tsx
│   │   └── variance-indicator.tsx
│   ├── users/
│   │   ├── user-table.tsx
│   │   ├── role-selector.tsx
│   │   ├── invite-form.tsx
│   │   └── provider-assignment.tsx
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── auth-guard.tsx
│   └── common/
│       ├── navigation.tsx
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── filters.tsx
│       ├── date-picker.tsx
│       └── export-button.tsx
├── lib/
│   ├── auth/
│   │   ├── config.ts
│   │   ├── session.ts
│   │   └── middleware.ts
│   ├── database/
│   │   ├── prisma.ts
│   │   ├── queries/
│   │   │   ├── metrics.ts
│   │   │   ├── users.ts
│   │   │   ├── clinics.ts
│   │   │   ├── goals.ts
│   │   │   └── google-sheets.ts
│   │   └── schemas/
│   │       ├── user.ts
│   │       ├── clinic.ts
│   │       ├── metric.ts
│   │       ├── goal.ts
│   │       └── google-sheet.ts
│   ├── google-sheets/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── sync.ts
│   │   ├── mapping.ts
│   │   └── validation.ts
│   ├── metrics/
│   │   ├── calculations.ts
│   │   ├── transformations.ts
│   │   ├── aggregations.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   ├── date-helpers.ts
│   │   ├── export.ts
│   │   └── logger.ts
│   └── types/
│       ├── auth.ts
│       ├── dashboard.ts
│       ├── metrics.ts
│       ├── goals.ts
│       └── api.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-metrics.ts
│   ├── use-google-sheets.ts
│   ├── use-goals.ts
│   ├── use-users.ts
│   └── use-filters.ts
├── middleware.ts
├── next.config.js
├── tailwind.config.js
├── package.json
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed.ts
```

### Backend Repository Structure (Supabase Functions)
```
supabase/
├── functions/
│   ├── google-sheets-sync/
│   │   ├── index.ts
│   │   ├── handlers/
│   │   │   ├── discovery.ts
│   │   │   ├── extraction.ts
│   │   │   ├── transformation.ts
│   │   │   └── validation.ts
│   │   └── types.ts
│   ├── metrics-calculation/
│   │   ├── index.ts
│   │   ├── calculators/
│   │   │   ├── financial.ts
│   │   │   ├── patients.ts
│   │   │   ├── appointments.ts
│   │   │   ├── providers.ts
│   │   │   └── calls.ts
│   │   └── aggregators/
│   │       ├── daily.ts
│   │       ├── weekly.ts
│   │       ├── monthly.ts
│   │       └── quarterly.ts
│   ├── goal-tracking/
│   │   ├── index.ts
│   │   ├── progress-calculator.ts
│   │   ├── variance-analyzer.ts
│   │   └── alert-generator.ts
│   ├── data-export/
│   │   ├── index.ts
│   │   ├── pdf-generator.ts
│   │   ├── csv-generator.ts
│   │   └── formatters.ts
│   ├── scheduled-sync/
│   │   ├── index.ts
│   │   ├── cron-handler.ts
│   │   └── retry-logic.ts
│   └── audit-logging/
│       ├── index.ts
│       ├── user-actions.ts
│       └── data-access.ts
├── migrations/
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240101000001_user_management.sql
│   ├── 20240101000002_google_sheets_integration.sql
│   ├── 20240101000003_metrics_tables.sql
│   └── 20240101000004_goals_tracking.sql
└── config.toml
```


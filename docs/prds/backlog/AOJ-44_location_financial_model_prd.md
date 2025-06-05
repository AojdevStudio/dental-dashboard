# PRD: Location-based Financial Data Model Implementation (AOJ-44)

## 1. Summary

This document outlines the requirements for implementing a comprehensive location-based financial data model within the dental dashboard application. The current system lacks a unified way to track production, collections, and other financial metrics specifically tied to individual clinic locations. This feature will introduce a new `LocationFinancial` Prisma model, associated API endpoints for data management and retrieval, and a data import mechanism utilizing **Google Apps Script** to pull data from Google Sheets for location-specific financial information. This is a foundational step for accurate Key Performance Indicator (KPI) calculations (related to AOJ-35) and detailed financial reporting.

## 2. User Stories

*   **US1:** As a Clinic Administrator, I want to view detailed financial reports (production, collections, adjustments, net production) for each specific clinic location, so that I can accurately assess the financial health and performance of individual sites.
*   **US2:** As a Data Manager, I want daily financial data from designated Google Sheets to be automatically synced into the system for each clinic location via a **Google Apps Script**, so that the system reflects the latest financial activities with minimal manual intervention.
*   **US3:** As a System, I need to store and aggregate financial data per location accurately, so that this data can be reliably used for calculating location-specific and overall clinic KPIs.
*   **US4:** As a Developer, I need a clear and efficient way to migrate existing historical financial data into the new location-specific model, so that historical analysis remains possible.

## 3. Functional Expectations

### 3.1. Data Model (`LocationFinancial`)

A new Prisma model named `LocationFinancial` will be created with the following fields:

*   `id`: String (Primary Key, CUID)
*   `clinicId`: String (Foreign Key to `Clinic` model)
*   `locationName`: String (e.g., "Baytown", "Humble") - This should be standardized or linked to a future `Location` entity if granularity beyond `Clinic` is needed.
*   `date`: DateTime (Date of the financial record)
*   `production`: Float (Daily gross production amount)
*   `adjustments`: Float (Adjustments to production, can be positive or negative)
*   `writeOffs`: Float (Insurance write-offs, typically negative or zero)
*   `netProduction`: Float (Calculated: `production` + `adjustments` + `writeOffs`)
*   `patientIncome`: Float (Collections received directly from patients)
*   `insuranceIncome`: Float (Collections received from insurance providers)
*   `totalCollections`: Float (Calculated: `patientIncome` + `insuranceIncome`)
*   `unearned`: Float (Unearned patient income, if applicable)
*   `dataSourceId`: String (Optional Foreign Key to `DataSource` model, if tracking origin of data)
*   `createdAt`: DateTime (Timestamp of creation)
*   `updatedAt`: DateTime (Timestamp of last update)

**Indexes:**
*   `@@index([clinicId, date])`
*   `@@index([locationName, date])` (Consider if `locationName` is within a single `clinicId` or globally unique. If per clinic, `@@index([clinicId, locationName, date])` might be better).

A Prisma migration script will be generated to apply these schema changes.

### 3.2. API Endpoints

New API routes will be created under `app/api/metrics/financial/locations/`:

*   **`GET /api/metrics/financial/locations`**:
    *   Retrieves a list of location financial data.
    *   Supports filtering by `clinicId`, `locationName`, `date` range.
    *   Supports pagination.
*   **`GET /api/metrics/financial/locations/{locationName}`**:
    *   Retrieves financial data for a specific `locationName`.
    *   Requires `clinicId` as a query parameter for specificity if `locationName` is not globally unique.
*   **`POST /api/metrics/financial/locations/import`**:
    *   Accepts financial data (likely in array/JSON format, processed from CSV) for one or more locations.
    *   Performs validation on incoming data (correct types, required fields, sensible values).
    *   Creates or updates `LocationFinancial` records.
    *   Should be idempotent: re-importing the same data for the same date/location should not create duplicates but update existing records or ignore if identical.

### 3.3. Data Import Process (Google Apps Script)

*   A **Google Apps Script** will be developed and deployed on the relevant Google Sheet(s) containing location-specific financial data.
*   This script will be responsible for:
    *   Reading data directly from the Google Sheet.
    *   Identifying columns corresponding to the fields of the `LocationFinancial` model (e.g., date, locationName, production, collections).
    *   Handling sheets that contain data for multiple locations (e.g., by reading a 'Location' column or processing multiple tabs if each tab represents a location).
    *   Performing basic data cleaning and transformation (e.g., currency to number, date formatting) within the Apps Script.
    *   Sending the processed data to the `POST /api/metrics/financial/locations/import` endpoint.
*   The Apps Script will be configured with necessary credentials (e.g., Supabase URL, Anon Key, target Clinic ID) via Script Properties.
*   Triggers will be set up within the Apps Script for automatic synchronization (e.g., on edit, daily).
*   The `POST /api/metrics/financial/locations/import` endpoint will still perform robust validation on the data it receives from the Apps Script:
    *   Check for required fields.
    *   Ensure correct data types.
    *   Log errors and provide feedback (though direct user feedback from Apps Script might be limited to execution logs).

### 3.4. Historical Data Migration

*   A strategy and accompanying script(s) must be developed to migrate existing financial data from models like `DentistProduction`, `HygieneProduction`, and any relevant `FinancialMetric` records into the new `LocationFinancial` structure.
*   This may involve:
    *   Identifying location information from existing fields (e.g., `verifiedProductionHumble` in `DentistProduction`).
    *   Consolidating data from multiple sources.
    *   Handling potential data inconsistencies or missing location information in old records.

## 4. Affected Files

*   `prisma/schema.prisma`: For the new `LocationFinancial` model and updates to existing models if any relations are added.
*   `prisma/migrations/`: New migration file(s) for schema changes.
*   `app/api/metrics/financial/locations/route.ts`: New file for the GET all endpoint.
*   `app/api/metrics/financial/locations/[locationName]/route.ts`: New file for the GET specific location endpoint.
*   `app/api/metrics/financial/locations/import/route.ts`: New file for the import endpoint that will receive data from the Google Apps Script.
*   `scripts/google-apps-script/location-financials-sync.gs` (or similar): New Google Apps Script file (Note: this file will reside in Google Apps Script environment, not directly in the project repo, but its development is part of this task. Reference to its functionality is key).
*   Potentially, existing financial metric calculation services/utilities if they need to consume data from the new model.
*   New script files for historical data migration (e.g., `scripts/migrate-financials.ts`).

## 5. Implementation Strategy (including AI Guardrails)

Given the scope and impact of this feature, a careful, phased implementation is crucial.

### 5.1. Phases

1.  **Phase 1: Data Model & Basic APIs**
    *   Define and implement the `LocationFinancial` Prisma model.
    *   Generate and apply the database migration.
    *   Implement the `GET` API endpoints (`/locations` and `/locations/{locationName}`) with basic filtering.
    *   Thoroughly test model creation and data retrieval.
2.  **Phase 2: Data Import Logic (Google Apps Script & API Endpoint)**
    *   Implement the `POST /api/metrics/financial/locations/import` endpoint, including robust validation for data received from the Apps Script.
    *   Develop the **Google Apps Script** (`location-financials-sync.gs` or similar) to read, transform, and send data from the Google Sheet to the import endpoint.
    *   Configure and test the Apps Script with sample sheet data, including setting up triggers.
    *   Ensure the API endpoint correctly processes data from the Apps Script and stores it in the `LocationFinancial` table.
3.  **Phase 3: Historical Data Migration**
    *   Analyze existing data structures (`DentistProduction`, `HygieneProduction`, etc.) to plan migration paths.
    *   Develop and test migration scripts in a staging/development environment.
    *   Execute migration on production after thorough validation and backup.
4.  **Phase 4: Integration & Refinement**
    *   Update any existing financial reporting or KPI calculation logic (e.g., AOJ-35) to use the new `LocationFinancial` model.
    *   Refine API endpoints and import processes based on testing and feedback.

### 5.2. AI Guardrails & Best Practices

*   **Iterative Development:** Use the phased approach above. Each phase should be developed, tested, and reviewed independently.
*   **Type Safety:** Leverage Prisma's generated types throughout the backend. Ensure API request/response bodies are strongly typed (e.g., using Zod for validation).
*   **Comprehensive Testing:**
    *   Unit tests for data transformation logic, validation rules, and individual API handlers.
    *   Integration tests for the data import flow (Google Sheets -> API -> Database).
    *   End-to-end tests for retrieving and displaying location-specific financial data (once UI components exist).
*   **Data Validation:** Implement strict validation at API boundaries for all incoming data, especially for the import endpoint.
*   **Database Transactions:** Use database transactions for operations that involve multiple writes (e.g., importing a batch of financial records) to ensure atomicity.
*   **Migration Safety:**
    *   **Backup:** Always back up the database before running any data migration scripts on production.
    *   **Dry Runs:** Migration scripts should support a "dry run" mode to preview changes without applying them.
    *   **Idempotency:** Ensure migration scripts can be run multiple times without causing errors or data duplication.
*   **Code Reviews:** All code changes, especially schema modifications and API implementations, must undergo thorough code review.
*   **Configuration Management:** Store any sensitive information (API keys, database URLs) securely using environment variables.
*   **Logging:** Implement detailed logging for the data import process, including errors, successes, and data sources.

## 6. Timeline & Priority Recommendation

*   **Priority:** High (As per Linear issue AOJ-44, and it's a blocker for AOJ-35 KPI implementation).
*   **Estimated Timeline:** (This is a rough estimate and needs refinement)
    *   Phase 1: 1-2 weeks
    *   Phase 2: 2-3 weeks
    *   Phase 3: 2-4 weeks (highly dependent on complexity of existing data)
    *   Phase 4: 1-2 weeks
    *   **Total:** 6-11 weeks. This is a significant effort.

## 7. Additional Considerations

*   **Location Master Data:** Consider if a dedicated `Location` model is needed in the future, especially if locations have more attributes than just a name and are not simply 1:1 with `Clinic` entities. For now, `locationName` within `LocationFinancial` (scoped by `clinicId`) is assumed.
*   **Error Handling & Reporting:** The data import process should have robust error handling and provide clear feedback to users about any issues encountered during an import.
*   **Performance:** Ensure database queries for financial data are optimized, especially for reporting and KPI calculations that might involve large datasets.
*   **Scalability:** Design the data model and APIs with potential future growth in data volume and the number of locations in mind.
*   **Deprecation of Old Models:** Plan for the eventual deprecation or archiving of data from `DentistProduction` and `HygieneProduction` once migration is complete and verified.

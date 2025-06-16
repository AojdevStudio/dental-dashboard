# Product Requirements Document: Multi-Sheet Support for Hygiene Sync

## 1. Introduction

The current Hygiene Sync Google Apps Script (`@/hygiene-sync`) is designed to synchronize data from a single Google Sheet (identified by `HYGIENE_SHEET_ID`) to a specific Supabase backend. This PRD outlines the requirements for enhancing the script to support managing and syncing data from multiple Google Sheets (e.g., one for each hygienist). All data will be synced to a **common Supabase table in a single Supabase instance**. The primary goal is to allow for a centralized update mechanism (e.g., a single `clasp push`) that applies the updated script logic to all configured hygienist spreadsheets.

**Problem Statement:** Clinic administrators managing multiple hygienists, each with their own Hygiene Production Google Sheet, need an efficient way to sync all this data to a central Supabase table. They require a method to configure and operate the sync process for these several sheets without duplicating and manually altering the entire script for each instance. A key requirement is the ability to update the core script logic via a single `clasp push` that effectively updates the sync capabilities for all linked spreadsheets.

## 2. Goals and Objectives

*   **Enable Multi-Sheet Configuration:** Allow administrators to define and manage configurations for multiple Google Sheets.
*   **Independent Sync Operations:** Each configured sheet should sync its data to the common Supabase backend, with appropriate identifiers if needed (e.g., hygienist name or specific Clinic ID variant per sheet). Logs should be managed per sheet.
*   **Simplified Credential Management:** Securely store and retrieve common Supabase credentials (URL, Key). Allow for sheet-specific identifiers (like a `data_source_identifier` or `clinic_id` variant if used for segmentation within the common table) to be configured per sheet.
*   **Scalable Trigger Management:** Ensure `onEdit` and time-based triggers can be reliably set up and operate for each managed sheet, ideally leveraging a shared, centrally updated script library.
*   **Simplified Administration:** Make the process of adding, configuring, and managing new sheet syncs as straightforward as possible.
*   **Clear Logging and Monitoring:** Provide distinct logging for each sync instance (ideally within each hygienist's sheet) for easier troubleshooting.
*   **Centralized Script Updates:** Implement a deployment model where a single `clasp push` to a core script project updates the sync logic used by all configured hygienist spreadsheets.

## 3. User Stories

*   **As an Administrator, I want to** configure multiple Hygiene Google Sheets (one per hygienist), each with its unique Sheet ID and any necessary hygienist-specific identifier (e.g., a name or specific ID for data tagging), **so that** I can sync data from all hygienists into our central Supabase table.
*   **As an Administrator, I want to** easily add a new hygienist's Google Sheet to the sync configuration **so that** I can quickly onboard new hygienists.
*   **As an Administrator, I want to** remove or deactivate a Google Sheet from the sync configuration **so that** I can manage the lifecycle of synced sheets.
*   **As an Administrator, I want to** have `onEdit` and time-based triggers function reliably and independently for each configured sheet, using a centrally updated script logic, **so that** data is synced automatically and consistently.
*   **As an Administrator, I want to** view sync logs separately for each configured sheet (e.g., in a log tab within that hygienist's sheet) **so that** I can troubleshoot issues for a specific hygienist without sifting through combined logs.
*   **As an Administrator, I want to** update the core sync script logic with a single `clasp push` **so that** all hygienist spreadsheets benefit from the update simultaneously without needing to manually update each one.
*   **As an Administrator, I want** the custom menu in each hygienist's Google Sheet to provide relevant actions for that sheet, powered by the central script logic.

## 4. Proposed Solutions / Design Considerations

This section explores high-level approaches to implementing multi-sheet support, focusing on a centralized script logic with easy updates.

### 4.1. Configuration Management

How will the script know about the multiple hygienist sheets and their specific identifiers? The Supabase URL and Service Key will be common.

*   **Option A: Centralized Configuration Sheet (Recommended for UI)**
    *   **Description:** A dedicated "Master Sync Configuration" Google Sheet. Each row represents a hygienist's sheet: `Hygienist Name`, `Target Sheet ID`, `Log Tab Name`, `Status (Active/Inactive)`, `Sheet-Specific Identifier (e.g., clinic_id variant or hygienist_id for Supabase table)`.
    *   **Pros:** User-friendly for admins. No direct code modification for adding new sheets.
    *   **Cons:** The central script (or library) needs permission to read this master sheet. `onEdit` for target sheets still needs a solution (see Trigger Management).

*   **Option B: JSON Configuration in Central Script's Properties (Recommended for Simplicity)**
    *   **Description:** Store an array of JSON objects in a Script Property of the *central script project*. Each object defines a hygienist's sheet:
        ```json
        [
          { "configName": "Hygiene_Adriane", "sheetId": "abc123...", "logTabName": "Adriane-Sync-Log", "hygienistIdentifier": "adriane_smith", "isActive": true },
          { "configName": "Hygiene_John", "sheetId": "xyz789...", "logTabName": "John-Sync-Log", "hygienistIdentifier": "john_doe", "isActive": true }
        ]
        ```
        A script function would manage these configurations.
    *   **Pros:** Programmatic management is easier. Contained within the script project.
    *   **Cons:** Less UI-friendly for direct admin editing unless a UI is built via Apps Script.

**Recommendation:** Option B (JSON Configuration in Script Properties of the central script) is robust. A simple UI within a utility sheet (part of the central script's project or a separate admin sheet) can be built to manage this JSON if needed.

### 4.2. Credential Handling (`credentials.gs`)

*   `setSupabaseCredentials_` will prompt for the *common* Supabase Project URL and Service Role Key once and store them in the central script's properties.
*   `getSupabaseCredentials_` will retrieve these common credentials.
*   The per-sheet configuration (from 4.1) will provide the `sheetId` and any specific identifier (e.g., `hygienistIdentifier`) needed for tagging data within the common Supabase table.

### 4.3. Trigger Management (`triggers.gs`, `setup.gs`)

This is key for the "single `clasp push`" model. The best approach is a **shared library model.**

*   **Central Library Script:** The main script project (the one managed by `clasp`) is deployed as a Google Apps Script Library.
*   **Target Sheet Stub Script:** Each hygienist's Google Sheet will have a *minimal, identical stub script* bound to it. This stub script will:
    1.  Include the central script as a library.
    2.  Contain `onEdit(e)` and time-based trigger functions (`dailySyncTrigger`) that simply call the corresponding robust functions from the library, passing necessary context like `e` and `SpreadsheetApp.getActiveSpreadsheet().getId()`.
*   **Operation:**
    *   `clasp push` updates the central library.
    *   All stub scripts in hygienist sheets automatically use the new version of the library functions on their next execution.
*   **Time-based triggers:** Can be managed in two ways:
    1.  Each stub script creates its own time-based trigger calling the library function. (More robust, distributed)
    2.  The central script project has one time-based trigger that iterates through all configured active sheets (from 4.1) and calls the library sync function for each. (Simpler to manage triggers, but one point of failure).
*   **`onEdit` triggers:** Created by the stub script in each hygienist's sheet. This is the standard and most reliable way for `onEdit`.

**Recommendation for Triggers:** Use the Library model. Each stub script creates its own `onEdit` and (optionally) its own time-based trigger, both calling library functions. This distributes trigger load and is robust. The setup for a new hygienist's sheet involves copying this stub script.

### 4.4. Logging (`logging.gs`)

*   The library's `logToHygieneSheet_` function MUST accept the `targetSheetId` and `logTabName` as parameters.
*   It will then use `SpreadsheetApp.openById(targetSheetId)` to get the correct spreadsheet and log to the specified tab within that hygienist's sheet.

### 4.5. UI/Menu Changes (`menu.gs`, `main.gs`)

*   The `onOpen()` function, now part of the central library, will create the menu. When called from a stub script in a hygienist's sheet, `SpreadsheetApp.getActiveSpreadsheet()` will correctly refer to that hygienist's sheet, making the menu context-aware.
*   Functions like `setupHygieneSync` (for initial common credential setup), `syncAllHygieneData` (if run centrally or a menu item for the current sheet), will be part of the library.
*   A separate utility could be provided for managing the list of configured sheets (if using Option B for configuration).

### 4.6. Core Sync Logic (`sync.gs`, `mapping.gs`)

*   These modules, as part of the library, will be largely reusable.
*   They must be parameterized to accept `sheetId` and `credentials` (which now includes the common Supabase URL/Key and potentially a per-sheet `hygienistIdentifier` or `clinic_id` variant).
*   `parseHygieneRow_` might need to include the `hygienistIdentifier` in the returned record for storage in Supabase.

### 4.7. Deployment Model (`.clasp.json` and Script IDs)

**Recommended Deployment: Centralized Script as a Library (Scenario 2 from original PRD)**

1.  **Main Library Script Project:**
    *   This is your current `@/hygiene-sync` project.
    *   You use `clasp push` to update this project's code.
    *   This project is deployed as a Google Apps Script Library (e.g., "HygieneSyncLib"). Versioning of the library is important.
2.  **Hygienist Sheet Stub Script:**
    *   A very small, standardized `.gs` file (e.g., `stub.gs`).
    *   **Content of `stub.gs`:**
        ```javascript
        // --- Hygienist Sheet Stub Script ---

        // Add the HygieneSyncLib library using its Script ID and desired version
        // For example, if library Script ID is 'LibABCD1234'
        // function onOpen(e) { HygieneSyncLib.onOpen(e); }
        // function onEdit(e) { HygieneSyncLib.onEditHygieneSync(e); } // Assuming onEditHygieneSync is in the library
        // function dailySyncTrigger() { HygieneSyncLib.syncAllHygieneDataForSheet(SpreadsheetApp.getActiveSpreadsheet().getId()); } // Example

        // --- Placeholder for actual library calls, to be fleshed out ---
        function onOpen(e) {
          // Example: Call a library function, assuming 'HygieneSyncLib' is the library identifier
          // This requires adding the library via Resources > Libraries in the script editor
          try {
            HygieneSyncLib.onOpen(e);
          } catch (err) {
            SpreadsheetApp.getUi().alert('Error loading Hygiene Sync Menu. Library might be missing or misconfigured.');
          }
        }

        function onEdit(e) {
          try {
            HygieneSyncLib.onEditTriggerHandler(e); // The library function would handle sheet ID checks etc.
          } catch (err) {
            // Minimal logging or fail silently if library isn't there
          }
        }
        
        function timeBasedSync() {
          try {
            HygieneSyncLib.scheduledSyncForCurrentSheet(); // Library function that knows how to sync the current sheet
          } catch (err) {
             // Error handling
          }
        }
        ```
    *   **Setup for a New Hygienist Sheet:**
        1.  Open the hygienist's Google Sheet.
        2.  Go to "Extensions" > "Apps Script".
        3.  Copy the content of `stub.gs` into the script editor (e.g., `Code.gs`).
        4.  Add the "HygieneSyncLib" library via "Resources" > "Libraries..." using its Script ID, selecting the latest version.
        5.  Manually run `onOpen` once or reload the sheet to get the menu.
        6.  Set up `onEdit` and `timeBasedSync` triggers from the stub script's editor to call these functions.
        7.  Add the new hygienist's Sheet ID and any identifier to the central configuration (4.1).
*   **`clasp push` Workflow:** You push updates to the Main Library Script Project. All hygienist sheets using this library will pick up the changes automatically on their next execution or when the library version is updated in their stub scripts (if versioning is pinned).

This model achieves the "single `clasp push` updates all" goal by updating the shared library.

## 5. Functional Requirements

*   **FR1:** The system MUST allow an administrator to define multiple "Sync Configurations" that map hygienist Google Sheet IDs to identifiers for the common Supabase table.
*   **FR2:** Each Sync Configuration MUST include:
    *   A unique identifier for the configuration (e.g., `configName`).
    *   The target hygienist's Google Sheet ID.
    *   A sheet-specific identifier (e.g., `hygienist_identifier` or `clinic_id_variant`) to be included in the data sent to Supabase.
    *   A designated Log Tab Name for that sheet.
    *   An active/inactive status.
*   **FR3:** The system MUST provide a mechanism (UI in a master sheet or script function) for administrators to add, view, update, and deactivate Sync Configurations.
*   **FR4:** The central library's `getSupabaseCredentials_` function MUST retrieve the common Supabase URL and Key.
*   **FR5:** The library's `logToHygieneSheet_` function MUST accept a `targetSheetId` and `logTabName` and write logs to the correct tab in the correct hygienist's sheet.
*   **FR6:** Time-based triggers (whether central or per-sheet stubs) MUST correctly initiate sync for all active and configured hygienist sheets.
*   **FR7:** `onEdit` triggers in each hygienist's sheet (via the stub script) MUST call the library function to process the edit for that specific sheet.
*   **FR8:** The library's core data parsing (`parseHygieneRow_`) and upserting (`upsertBatchToSupabase_`) logic MUST be parameterized to use the context of the current Sync Configuration (including `sheetId` and the `hygienist_identifier`).
*   **FR9:** The Google Sheets UI menu generated by the library (`onOpen`) MUST operate correctly within the context of the active hygienist's spreadsheet.
*   **FR10:** Global constants in `config.gs` like `HYGIENE_SHEET_ID`, `SUPABASE_URL_PROPERTY_KEY`, etc., MUST be either eliminated (if now passed as parameters or part of a config object) or represent common values for the single Supabase instance. Sheet-specific values must come from the per-sheet configuration.

## 6. Non-Functional Requirements

*   **NFR1: Security:** Common Supabase credentials must be stored securely in the central library script's properties.
*   **NFR2: Usability:** Managing multiple sync configurations and setting up a new hygienist sheet should be intuitive.
*   **NFR3: Performance:** The script should perform efficiently. Batching and API call limits must be respected.
*   **NFR4: Scalability:** The system should handle tens of hygienist sheets.
*   **NFR5: Maintainability:** The centralized library codebase should be well-structured. Stub scripts should be minimal and stable.
*   **NFR6: Error Handling:** Robust error handling and clear logging per hygienist sheet are essential.

## 7. Open Questions / Considerations

*   What is the maximum number of hygienist sheets the system should handle?
*   Is the `hygienistIdentifier` (or similar) needed in the Supabase table to distinguish data from different sheets? If so, what should this identifier be (e.g., hygienist's name, an ID)?
*   How will the initial setup of the common Supabase credentials in the central library script be handled? (e.g., a one-time setup function).
*   How should versioning of the central library be managed and propagated to the stub scripts? (Development mode vs. specific versions).

## 8. Out of Scope

*   Automatic creation of new hygienist Google Sheets.
*   A user interface outside of Google Sheets for managing configurations (unless a simple one is built as part of an admin sheet).
*   Changes to the common Supabase table schema beyond potentially adding a `hygienist_identifier` column if needed.

[MODE: PLAN]
That's a very sensible and robust approach!

Here's how that would work and the steps involved:

**Concept:**

1.  **Seed Providers:** You'll define your providers (hygienists, in this case) in your `prisma/seed.ts` file. When you seed your database, these providers will be created with unique IDs (CUIDs or UUIDs, depending on your Prisma setup for the `Provider` model's ID).
2.  **Configure Provider ID in Apps Script:** For each Google Sheet that corresponds to a specific provider's hygiene data, you will manually configure that provider's unique ID (obtained after seeding) within the Google Apps Script project. This could be done via Script Properties or by modifying the `config.gs` for each relevant sheet if you have separate deployments/configurations per sheet (though Script Properties are generally better for instance-specific config).
3.  **Apps Script Uses Configured ID:** The `parseHygieneRow_` function in your Apps Script will then retrieve this pre-configured `provider_id` and include it in the payload sent to Supabase, populating the `hygiene_production.provider_id` column.
4.  **Remove Sheet Name Extraction:** The logic in `extractProviderNameFromSheet_` and its usage to populate a `provider_name` field will be removed from the Apps Script, as the `provider_id` will now be the definitive link.

**Advantages of this Approach:**

*   **Data Integrity:** Ensures that `hygiene_production.provider_id` correctly links to a valid provider in your `Providers` table.
*   **Reliable Linking:** Avoids the potential fragility of deriving names from spreadsheet titles (which can change or be inconsistent).
*   **Clear Responsibility:** The database (via seeding) is the source of truth for provider IDs, and the Apps Script configuration explicitly links a sheet to one of these IDs.
*   **Scalability:** Easier to manage as you add more providers/sheets, as the linking is explicit.

**Steps to Implement:**

**Phase 1: Database and Prisma Setup**

1.  **Ensure `Provider` Model Exists:**
    *   Verify you have a `Provider` model in your `prisma/schema.prisma` file. It would look something like this:
        ```prisma
        model Provider {
          id          String    @id @default(cuid()) // Or uuid()
          name        String
          email       String?   @unique
          // other relevant provider fields...
          createdAt   DateTime  @default(now())
          updatedAt   DateTime  @updatedAt

          hygieneProduction HygieneProduction[] // Relation to HygieneProduction
          // other relations...
        }
        ```
    *   Ensure the `HygieneProduction` model has the corresponding relation:
        ```prisma
        model HygieneProduction {
          // ... other fields ...
          providerId  String?    @map("provider_id") // Foreign key
          provider    Provider?  @relation(fields: [providerId], references: [id])
        }
        ```
        *(The `provider_id String? @map("provider_id")` field is what your database schema already has for `hygiene_production`)*

2.  **Update Seed File (`prisma/seed.ts`):**
    *   Add entries for your hygiene providers.
    *   Example:
        ```typescript
        // prisma/seed.ts
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();

        async function main() {
          // ... other seeding logic (clinics, users, etc.) ...

          const providerAlice = await prisma.provider.upsert({
            where: { email: 'alice.hygienist@example.com' }, // Or some other unique identifier if email isn't primary
            update: {},
            create: {
              name: 'Alice Wonderland', // Full name
              email: 'alice.hygienist@example.com',
              // clinicId: 'ID_OF_THE_CLINIC_ALICE_BELONGS_TO', // If you link providers to clinics
              // providerType: 'Hygienist', // If you have such a field
            },
          });
          console.log({ providerAlice });

          const providerBob = await prisma.provider.upsert({
            where: { email: 'bob.hygienist@example.com' },
            update: {},
            create: {
              name: 'Bob The Builder',
              email: 'bob.hygienist@example.com',
              // clinicId: 'ID_OF_THE_CLINIC_BOB_BELONGS_TO',
              // providerType: 'Hygienist',
            },
          });
          console.log({ providerBob });

          // Add more providers as needed

          // ... other seeding logic ...
        }

        main()
          .catch(async (e) => {
            console.error(e);
            await prisma.$disconnect();
            process.exit(1);
          })
          .finally(async () => {
            await prisma.$disconnect();
          });
        ```
    *   **Important:** After running the seed, note down the generated `id` for each provider. You'll need these for the Apps Script configuration.

3.  **Run Migrations (if schema changed) and Seed:**
    *   If you had to modify `schema.prisma` (e.g., to add the `Provider` model or relations), run:
        `npx prisma migrate dev --name setup_provider_model_and_relations`
    *   Then run the seed command (usually defined in your `package.json`, often `npx prisma db seed` or executed as part of `prisma migrate dev` if configured).

**Phase 2: Google Apps Script Configuration and Code Changes**

1.  **Decide on Configuration Method for `provider_id` in Apps Script:**
    *   **Method A (Recommended): Script Properties.**
        *   For each Google Sheet (or Apps Script project linked to a sheet), you'll set a Script Property.
        *   Go to `Project Settings` (gear icon) > `Script Properties`.
        *   Add a property like `HYGIENE_PROVIDER_ID` and set its value to the actual ID of the provider (e.g., `clx....` or `abc...`) that corresponds to the data in *that specific spreadsheet*.
    *   **Method B: Hardcode in `config.gs` (Less Flexible).**
        *   If you have a separate `config.gs` for each deployed script (one per provider's sheet), you could add:
            ```javascript
            // In config.gs for Alice's sheet
            const HYGIENE_PROVIDER_ID = 'alice_cuid_here';
            ```
        *   This is less ideal if you manage many sheets or want to update IDs without code changes.

2.  **Modify Apps Script Code (`scripts/google-apps-script/hygiene-sync/`):**
    *   **`credentials.gs` (or similar where `getSupabaseCredentials_` is):**
        *   Update `getSupabaseCredentials_` to also fetch the `HYGIENE_PROVIDER_ID` from Script Properties if you chose Method A.
            ```javascript
            function getSupabaseCredentials_() {
              // ... (existing code for url, key, clinicId) ...
              const scriptProperties = PropertiesService.getScriptProperties();
              const providerId = scriptProperties.getProperty('HYGIENE_PROVIDER_ID'); // New line

              if (!url || !key || !clinicId || !providerId) { // Added providerId to check
                Logger.log('Supabase credentials or Provider ID not fully set in Script Properties.');
                SpreadsheetApp.getUi().alert('Configuration Error', 'Supabase URL, Key, Clinic ID, or Provider ID is missing. Please run "1. Setup Sync" or check Script Properties.', SpreadsheetApp.getUi().ButtonSet.OK);
                return null;
              }
              return { url, key, clinicId, providerId }; // Added providerId
            }
            ```
    *   **`mapping.gs` -> `parseHygieneRow_` function:**
        1.  Remove the `extractProviderNameFromSheet_` function entirely, or at least its call within `parseHygieneRow_`.
        2.  The `clinicId` and now `providerId` should be passed into `parseHygieneRow_` (or accessed from `credentials` object).
            ```javascript
            // function parseHygieneRow_(row, mapping, monthTab, clinicId) { // Old signature
            function parseHygieneRow_(row, mapping, monthTab, clinicId, providerId) { // New signature
              try {
                // ... (date, numeric values, uuid extraction) ...

                // REMOVE these lines:
                // const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
                // const spreadsheetName = ss.getName();
                // const providerName = extractProviderNameFromSheet_(spreadsheetName);

                return {
                  id: String(uuid),
                  clinic_id: clinicId,
                  provider_id: providerId, // USE THE PASSED/CONFIGURED providerId
                  date: date,
                  month_tab: monthTab,
                  // ... other fields ...
                  // REMOVE this line: provider_name: providerName,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
              } catch (error) {
                Logger.log(`Error parsing hygiene row: ${error.message} for providerId: ${providerId}`);
                return null;
              }
            }
            ```
    *   **`sync.gs` -> `syncSheetData_` function:**
        *   When calling `parseHygieneRow_`, pass the `providerId` from the `credentials` object.
            ```javascript
            function syncSheetData_(sheet, monthTab) {
              const credentials = getSupabaseCredentials_();
              if (!credentials) { // This now also checks for providerId
                throw new Error('No credentials (including Provider ID) available');
              }
              // ...
              const record = parseHygieneRow_(row, mapping, monthTab, credentials.clinicId, credentials.providerId); // Pass providerId
              // ...
            }
            ```
    *   **`sync.gs` -> `syncSingleRow_` function (if used):**
        *   Similarly, update the call to `parseHygieneRow_` if this function is actively used.
            ```javascript
            function syncSingleRow_(sheet, rowNumber) {
              const credentials = getSupabaseCredentials_();
              if (!credentials) { /* ... */ }
              // ...
              const record = parseHygieneRow_(row, mapping, sheetName, credentials.clinicId, credentials.providerId); // Pass providerId
              // ...
            }
            ```

**Summary of this Plan:**

1.  **DB Schema:** Confirm `Provider` model and its relation to `HygieneProduction` (using `provider_id`). The `hygiene_production.provider_id` column already exists.
2.  **Seed Providers:** Add hygiene providers to `prisma/seed.ts` and run the seed to get their IDs.
3.  **Configure Apps Script:** Store the relevant `provider_id` (from seeding) in the Apps Script's Script Properties for each hygiene sheet.
4.  **Modify Apps Script Code:**
    *   Update `getSupabaseCredentials_` to fetch the `HYGIENE_PROVIDER_ID`.
    *   Remove `extractProviderNameFromSheet_` logic.
    *   Update `parseHygieneRow_` to accept `providerId` and use it to populate `provider_id` in the returned object, removing the old `provider_name` field.
    *   Update callers of `parseHygieneRow_` (`syncSheetData_`, `syncSingleRow_`) to pass the `providerId`.

This approach correctly uses the existing `provider_id` column in `hygiene_production` and establishes a clear, maintainable link to your `Provider` records. It directly addresses the schema mismatch error.

Does this plan sound good to you? I can help you implement these changes step by step. We should start with the Prisma schema and seeding, then move to the Apps Script modifications.
Read file: prisma/schema.prisma

[MODE: IMPLEMENT]
You've chosen a solid strategy! Using seeded provider IDs and configuring them in the Apps Script is definitely the way to go for robust and maintainable provider linking.

Let's break down the implementation into phases.

**Phase 1: Prisma Setup & Seeding Providers (No Schema Changes Needed)**

Good news! I've reviewed your `prisma/schema.prisma` file.
*   Your `Provider` model (lines 50-69) is well-defined with an `id` field.
*   Your `HygieneProduction` model (lines 457-476) already has the necessary `providerId String? @map("provider_id")` field and the `@relation` to the `Provider` model.

This means **no changes are needed in your `prisma/schema.prisma` file for this particular task.** The database structure already supports what we want to do.

**Next Step for You (Database Seeding):**

1.  **Update Your Seed File (`prisma/seed.ts`):**
    You need to add entries for your hygiene providers in this file. If a provider already exists (e.g., from a previous seed or manual entry that matches the `where` condition), `upsert` will prevent duplicates.

    Here's an example snippet you can adapt for `prisma/seed.ts`. Make sure to adjust names, emails, and potentially `clinicId` or `providerType` if you use those fields to uniquely identify or categorize providers.

    ```typescript
    // In prisma/seed.ts

    // ... (import PrismaClient and other setup) ...

    async function main() {
      // ... (your existing seeding logic for clinics, users, etc.) ...

      console.log('Seeding providers...');

      const hygienistAlice = await prisma.provider.upsert({
        where: { email: 'alice.hygienist@example.com' }, // Use a unique field for the where clause
        update: { // Fields to update if Alice already exists
          name: 'Alice Wonderland',
          providerType: 'Hygienist',
          status: 'active',
          // clinicId: 'TARGET_CLINIC_ID_FOR_ALICE', // Specify if needed
        },
        create: { // Fields to set if Alice is being created
          name: 'Alice Wonderland',
          firstName: 'Alice', // Optional, but good for clarity
          lastName: 'Wonderland', // Optional
          email: 'alice.hygienist@example.com',
          providerType: 'Hygienist',
          status: 'active',
          clinicId: 'YOUR_MAIN_CLINIC_ID_HERE', // Replace with an actual Clinic ID from your DB/seed
        },
      });
      console.log(`Upserted provider Alice with ID: ${hygienistAlice.id}`);

      const hygienistBob = await prisma.provider.upsert({
        where: { email: 'bob.hygienist@example.com' },
        update: {
          name: 'Bob The Hygienist',
          providerType: 'Hygienist',
          status: 'active',
          // clinicId: 'TARGET_CLINIC_ID_FOR_BOB',
        },
        create: {
          name: 'Bob The Hygienist',
          firstName: 'Bob',
          lastName: 'Hygienist',
          email: 'bob.hygienist@example.com',
          providerType: 'Hygienist',
          status: 'active',
          clinicId: 'YOUR_MAIN_CLINIC_ID_HERE', // Replace
        },
      });
      console.log(`Upserted provider Bob with ID: ${hygienistBob.id}`);

      // Add more hygienists as needed, ensuring unique 'where' conditions (e.g., email)

      // ... (rest of your seeding logic) ...
    }

    main()
      .catch(async (e) => {
        console.error('Error during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
        console.log('Seeding finished.');
      });
    ```

2.  **Run the Database Seed Command:**
    *   This is typically defined in your `package.json` scripts. It might be `pnpm prisma db seed`, `npx prisma db seed`, or part of `pnpm prisma migrate dev`.
    *   Execute the command.
    *   **Crucially, copy the generated `id`s** for each hygienist/provider from the console output (e.g., "Upserted provider Alice with ID: `clxxxxxxxxx`"). You will need these IDs for the next phase.

Once you have updated your seed file and run it to get the provider IDs, let me know, and we'll proceed to configuring the Google Apps Script.

**Phase 2: Google Apps Script Configuration**

After you have the Provider IDs from seeding:

1.  **Open your Hygiene Google Spreadsheet.**
2.  Go to `Extensions > Apps Script` to open the script editor for that specific sheet.
3.  In the Apps Script editor, click on the `Project Settings` (gear icon ⚙️) on the left sidebar.
4.  Scroll down to the **Script Properties** section.
5.  Click **Add script property**.
    *   **Property name:** `HYGIENE_PROVIDER_ID`
    *   **Value:** Paste the actual ID of the provider (e.g., `clxxxxxxxxx`) whose data is in *this specific spreadsheet*.
6.  Click **Save script properties**.
7.  **Repeat these steps for each separate Google Spreadsheet/Apps Script project** that handles a different hygienist's data, using the correct Provider ID for each.

**Phase 3: Google Apps Script Code Changes**

Once the Script Properties are set, I will help you make the following code changes in your `scripts/google-apps-script/hygiene-sync/` project:

*   **`credentials.gs` (or where `getSupabaseCredentials_` is defined):**
    *   Modify `getSupabaseCredentials_` to fetch and return the `HYGIENE_PROVIDER_ID` from Script Properties.
*   **`mapping.gs`:**
    *   Remove the `extractProviderNameFromSheet_` function.
    *   Modify `parseHygieneRow_` to:
        *   Accept `providerId` as a parameter (it will come from the `credentials` object).
        *   Use this `providerId` to populate the `provider_id` field in the object it returns.
        *   Remove the old `provider_name` field from the returned object.
*   **`sync.gs`:**
    *   Update the parts of `syncSheetData_` and `syncSingleRow_` that call `parseHygieneRow_` to pass the `credentials.providerId`.

This structured approach will resolve the "Could not find the 'provider_name' column" error and correctly link your hygiene production data to the respective providers.

Please proceed with updating your `prisma/seed.ts` and running the seed. Let me know when you have the Provider IDs and have set the Script Properties, or if you'd like assistance with the seed file itself!
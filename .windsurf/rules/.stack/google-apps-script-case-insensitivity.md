---
trigger: model_decision
description: 
globs: *.gs
---
- **Prioritize Case-Insensitive String Comparisons:**
    - When comparing strings that might come from sheet data, configurations, or user input, always convert them to a consistent case (usually lowercase) before comparison.
    - ✅ **DO:** `if (inputValue.toLowerCase() === 'expectedvalue') { /* ... */ }`
    - ✅ **DO:** `if (sheetHeader.toLowerCase().includes(configPattern.toLowerCase())) { /* ... */ }`
    - ❌ **DON'T:** `if (inputValue === 'ExpectedValue') { /* ... */ }` (This is case-sensitive and prone to errors if `inputValue` is `expectedvalue` or `EXPECTEDVALUE`)

- **Case-Insensitive Object Property Access (When Keys are Dynamic or from External Sources):**
    - If object keys are derived from external data (e.g., sheet headers) or configuration where case might vary, standardize the keys before storing them in an object, or standardize the lookup key.
    - **Strategy 1: Standardize keys upon object creation.**
        - When creating an internal mapping object (like `mapHeaders_` does), ensure all keys are stored in a consistent case (e.g., lowercase).
            ```javascript
            // Example: processing sheet headers
            const mapping = {};
            sheetHeaders.forEach(header => {
              const lowerHeader = header.toLowerCase();
              mapping[lowerHeader] = getColumnIndex(header); 
            });
            // Now access with: mapping['date'] or mapping['client name']
            ```
    - **Strategy 2: Standardize the lookup key.**
        - If you have an object with potentially mixed-case keys, and you need to look up a value case-insensitively, you might iterate or pre-process keys.
            ```javascript
            function findValueCaseInsensitive(obj, lookupKey) {
              const lowerLookupKey = lookupKey.toLowerCase();
              for (const key in obj) {
                if (obj.hasOwnProperty(key) && key.toLowerCase() === lowerLookupKey) {
                  return obj[key];
                }
              }
              return undefined;
            }
            // const value = findValueCaseInsensitive(myConfigObject, 'UserName');
            ```
        - *Note:* Strategy 1 is generally more efficient if you control the object creation.

- **JavaScript Function Names and Variable Names:**
    - JavaScript itself is **case-sensitive** for function names, variable names, and built-in object properties (e.g., `PropertiesService`, `SpreadsheetApp`).
    - This rule *does not* attempt to override this fundamental JavaScript behavior.
    - You **MUST** call functions and use variables with their exact defined casing.
    - ✅ **DO:** `SpreadsheetApp.getUi();`
    - ❌ **DON'T:** `spreadsheetapp.getui();` (This will cause a `ReferenceError`)

- **Configuration File Keys (e.g., in `config.gs`):**
    - When defining constants or configuration objects (like `HYGIENE_COLUMN_HEADERS`), the *keys* of these objects are case-sensitive in JavaScript.
    - `const MY_CONFIG = { KEY_ONE: 'value1' };` is different from `const MY_CONFIG = { key_one: 'value1' };`
    - When accessing these (e.g., `MY_CONFIG.KEY_ONE`), the exact case must be used.
    - However, the *string values* within these configurations *can and should* be handled case-insensitively by the functions that use them, as per the first point.
        ```javascript
        // In config.gs
        const COLUMN_PATTERNS = {
          DATE_COLUMN: ['Date', 'Transaction Date'] // Patterns can be mixed case here
        };

        // In mapping.gs (example)
        function findDateColumn(sheetHeader) {
          const lowerSheetHeader = sheetHeader.toLowerCase();
          return COLUMN_PATTERNS.DATE_COLUMN.some(pattern => 
            pattern.toLowerCase() === lowerSheetHeader
          );
        }
        ```

- **Focus on Interfaces and Data:**
    - The primary goal is to make the script's interaction with *data sources* (like sheet cells, sheet names, script properties) and *configurable string patterns* case-insensitive.
    - Internal logic, variable names, and function calls will adhere to JavaScript's inherent case sensitivity.

- **Example from `hygiene-sync/mapping.gs` ([mapping.gs](mdc:scripts/google-apps-script/hygiene-sync/mapping.gs))**
    - The `mapHeaders_` function correctly converts sheet headers to lowercase (`cleanSheetHeader`).
    - It then compares these to patterns from `HYGIENE_COLUMN_HEADERS`. The recent update ensured these patterns are also lowercased during comparison: `HYGIENE_COLUMN_HEADERS.DATE.some(pattern => { const lowerPattern = String(pattern).toLowerCase(); return cleanSheetHeader === lowerPattern || cleanSheetHeader.includes(lowerPattern); })`
    - The resulting `mapping` object uses lowercase keys (e.g., `mapping.date`).
    - `parseHygieneRow_` now correctly accesses this `mapping` object using lowercase keys (e.g., `mapping.date`). This is good practice.

By following these guidelines, Google Apps Script functions will be more resilient to variations in casing from external sources, reducing potential errors and improving maintainability.

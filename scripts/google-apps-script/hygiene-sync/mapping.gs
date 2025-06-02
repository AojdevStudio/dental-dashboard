/**
 * Get headers from a sheet (first row that contains data)
 * @param {Sheet} sheet - The Google Sheet
 * @return {array} Array of header strings
 */
function getSheetHeaders_(sheet) {
  const data = sheet.getDataRange().getValues();
  
  // Find header row (contains "Date", "Hours Worked", etc.)
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i];
    const hasDateColumn = row.some(cell => 
      String(cell).toLowerCase().includes('date') || 
      String(cell).toLowerCase().includes('day')
    );
    if (hasDateColumn) {
      Logger.log(`getSheetHeaders_: Header row found at index ${i} in sheet '${sheet.getName()}'. Headers: ${JSON.stringify(row.map(cell => String(cell).trim()))}`);
      return row.map(cell => String(cell).trim());
    }
  }
  
  Logger.log(`getSheetHeaders_: No header row containing "date" or "day" found within the first 5 rows for sheet '${sheet.getName()}'. Falling back to first row if available.`);
  // Fallback to first row
  return data.length > 0 ? data[0].map(cell => String(cell).trim()) : [];
}

/**
 * Map sheet headers to database columns
 * @param {array} headers - Array of header strings from the sheet
 * @return {object} Object mapping field names to column indices
 */
function mapHeaders_(headers) {
  const mapping = {
    date: -1,
    hoursWorked: -1,
    estimatedProduction: -1,
    verifiedProduction: -1,
    productionGoal: -1,
    variancePercentage: -1,
    bonusAmount: -1,
    uuid: -1
  };

  headers.forEach((header, index) => {
    const cleanSheetHeader = String(header).toLowerCase().trim();
    
    // Date column
    if (mapping.date === -1 && 
        HYGIENE_COLUMN_HEADERS.DATE.some(pattern => {
            const lowerPattern = String(pattern).toLowerCase();
            return cleanSheetHeader === lowerPattern || cleanSheetHeader.includes(lowerPattern);
        })) {
      mapping.date = index;
    }
    // Hours worked - exact match to avoid "Average Hours worked"
    else if (mapping.hoursWorked === -1 && cleanSheetHeader === 'hours worked') { // This implies HYGIENE_COLUMN_HEADERS.HOURS_WORKED contains 'hours worked'
      mapping.hoursWorked = index;
    }
    // Estimated production
    else if (mapping.estimatedProduction === -1 && 
             HYGIENE_COLUMN_HEADERS.ESTIMATED_PRODUCTION.some(pattern => {
                const lowerPattern = String(pattern).toLowerCase();
                return cleanSheetHeader === lowerPattern || cleanSheetHeader.includes(lowerPattern);
            })) {
      mapping.estimatedProduction = index;
    }
    // Verified production
    else if (mapping.verifiedProduction === -1 && 
             HYGIENE_COLUMN_HEADERS.VERIFIED_PRODUCTION.some(pattern => {
                const lowerPattern = String(pattern).toLowerCase();
                return cleanSheetHeader === lowerPattern || cleanSheetHeader.includes(lowerPattern);
            })) {
      mapping.verifiedProduction = index;
    }
    // Production goal - exact match to avoid "Over/Under Production Goal"
    else if (mapping.productionGoal === -1 && cleanSheetHeader === 'production goal') { // Implies exact match desired from HYGIENE_COLUMN_HEADERS.PRODUCTION_GOAL
      mapping.productionGoal = index;
    }
    // Variance Percentage - flexible matching, using camelCase internal key
    else if (mapping.variancePercentage === -1 && 
             (cleanSheetHeader === 'variance %' || cleanSheetHeader === 'variance' || cleanSheetHeader === 'variance percentage' || cleanSheetHeader.includes('variance')) && 
             !cleanSheetHeader.includes('amount') && !cleanSheetHeader.includes('value') // Avoid matching variance amount/value if those exist
            ) { 
      mapping.variancePercentage = index;
    }
    // Bonus - exact match, maps to bonusAmount
    else if (mapping.bonusAmount === -1 && cleanSheetHeader === 'bonus') { 
      mapping.bonusAmount = index;
    }
    // UUID
    else if (mapping.uuid === -1 && 
             HYGIENE_COLUMN_HEADERS.UUID.some(pattern => {
                const lowerPattern = String(pattern).toLowerCase();
                return cleanSheetHeader === lowerPattern || cleanSheetHeader.includes(lowerPattern);
            })) {
      mapping.uuid = index;
    }
  });

  // Debug logging to help troubleshoot missing columns
  Logger.log('=== HEADER MAPPING DEBUG ===');
  Logger.log('Sheet headers: ' + JSON.stringify(headers));
  Logger.log('Final mapping: ' + JSON.stringify(mapping));
  Logger.log('Missing mappings: ' + Object.keys(mapping).filter(key => mapping[key] === -1).join(', '));

  // Log a warning to the sheet if critical columns are missing
  const criticalColumns = ['date', 'verifiedProduction']; // Add other critical columns as needed (keys from HYGIENE_COLUMN_HEADERS)
  const missingCritical = criticalColumns.filter(key => mapping[key.toLowerCase()] === -1 || mapping[key.toUpperCase()] === -1 ); // Check for both cases just in case config keys change case
  
  // Attempt to get sheet name for logging, may not be available here directly
  // This function is generic, so sheet name isn't passed. Consider if context is needed for log sheet.
  // For now, this will log to Logger.log primarily if sheet name context is complex to get here.

  if (missingCritical.length > 0) {
    const message = `Critical columns not mapped: ${missingCritical.join(', ')}. This will likely prevent data sync. Headers found: ${JSON.stringify(headers)}`;
    Logger.log(`mapHeaders_ WARNING: ${message}`);
    // Consider if this specific warning should go to the main log sheet. 
    // logToHygieneSheet_('mapHeaders_', 'WARNING', null, null, null, message); 
    // ^ This would require passing sheet name or making logToHygieneSheet_ more flexible for generic warnings.
  }

  return mapping;
}

/**
 * Parses a single row of hygiene data based on predefined mapping.
 *
 * @param {Array<any>} row The row data from the sheet.
 * @param {object} mapping The column mapping object.
 * @param {string} monthTab The name of the month tab being processed.
 * @param {string} clinicId The ID of the clinic.
 * @param {string} providerId The ID of the provider.
 * @param {number} rowIndex The index of the row being processed.
 * @return {object|null} A structured object for the hygiene record or null if key data is missing.
 */
function parseHygieneRow_(row, mapping, monthTab, clinicId, providerId, rowIndex) {
  try {
    const record = {};
    let hasEssentialData = false; // Flag to check if core financial data is present

    // Date parsing - use lowercase 'date' key from the mapping object
    const dateColumnIndex = mapping.date !== undefined ? mapping.date : -1; // Access with lowercase 'date'
    if (dateColumnIndex === -1) {
        Logger.log(`parseHygieneRow_: CRITICAL - 'date' column not found in mapping for '${monthTab}'. Row ${rowIndex + 1} will be skipped.`);
        return null;
    }
    const dateValue = row[dateColumnIndex];
    const date = parseDateForSupabase_(dateValue, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone());
    if (!date) {
      Logger.log(`parseHygieneRow_: Skipped row ${rowIndex !== undefined ? '#' + (rowIndex + 1) : '(unknown_row)'} in '${monthTab}' due to invalid or missing date. Value: '${dateValue}'`);
      return null; 
    }
    
    // Validate that the date is not in the future (beyond today)
    const today = new Date();
    const todayString = Utilities.formatDate(today, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "yyyy-MM-dd");
    if (date > todayString) {
      Logger.log(`parseHygieneRow_: Skipped row ${rowIndex !== undefined ? '#' + (rowIndex + 1) : '(unknown_row)'} in '${monthTab}' due to future date. Date: '${date}' is after today: '${todayString}'`);
      return null;
    }
    
    record.date = date;

    // Process other mapped columns using their expected keys from HYGIENE_COLUMN_HEADERS (which map to lowercase in the mapping object)
    // The `mapping` object created by `mapHeaders_` has lowercase keys like `hoursWorked`, `estimatedProduction` etc.
    // The loop `for (const key in mapping)` will iterate over these lowercase keys.

    for (const mappedKey in mapping) { // e.g., mappedKey could be 'hoursWorked', 'uuid' etc.
      if (mapping.hasOwnProperty(mappedKey) && mappedKey !== 'date') { // Skip date as it's handled, and it's already lowercase
        const columnIndex = mapping[mappedKey]; // This is the index from the sheet
        
        if (columnIndex !== undefined && columnIndex !== -1 && columnIndex < row.length) {
          let value = row[columnIndex];
          if (typeof value === 'string') {
            value = value.trim();
          }

          // Determine the Supabase field name (snake_case) from the mappedKey
          // This assumes mappedKey (e.g., 'hoursWorked') needs to become 'hours_worked'
          const supabaseFieldKey = mappedKey.replace(/([A-Z])/g, '_$1').toLowerCase(); 

          // Logic based on the original HYGIENE_COLUMN_HEADERS keys is tricky here directly
          // We should standardize based on the lowercase mappedKey
          if (['hoursWorked', 'estimatedProduction', 'verifiedProduction', 'productionGoal', 'variancePercentage', 'bonusAmount'].includes(mappedKey)) {
            let numericValue = parseFloat(cleanNumeric_(value));
            if (Number.isNaN(numericValue)) {
              numericValue = null;
            }
            record[supabaseFieldKey] = numericValue;
            if (numericValue === null && (mappedKey === 'verifiedProduction' || mappedKey === 'estimatedProduction')) {
              Logger.log(`parseHygieneRow_: Null numeric value for critical field '${mappedKey}' in '${monthTab}', row ${rowIndex !== undefined ? '#' + (rowIndex + 1) : '(unknown_row)'}. Original value: '${value}'`);
            }
            if (numericValue !== null && (mappedKey === 'estimatedProduction' || mappedKey === 'verifiedProduction')) {
              hasEssentialData = true; 
            }
          } else if (mappedKey === 'uuid') {
            record.id = String(value || Utilities.getUuid()); 
          } else {
            // For any other direct string fields if necessary (currently none in HYGIENE_COLUMN_HEADERS requiring special handling this way)
            // This part might need review based on actual HYGIENE_COLUMN_HEADERS
            record[supabaseFieldKey] = value;
          }
        } else {
          // Initialize field as null if column is not present, out of bounds, or not mapped (-1)
          const supabaseFieldKey = mappedKey.replace(/([A-Z])/g, '_$1').toLowerCase();
          record[supabaseFieldKey] = null;
          if (columnIndex === -1){
            Logger.log(`parseHygieneRow_: Column for '${mappedKey}' was not found in sheet headers (mapping index -1) for '${monthTab}'. Setting to null.`);
          }
        }
      }
    }

    // If no essential financial data was found beyond the date, consider it a row to skip
    // This helps avoid syncing rows that only have a date and nothing else of value.
    if (!hasEssentialData && !record.id) { // if no financial data and no pre-existing UUID
      Logger.log(`parseHygieneRow_: Skipped row ${rowIndex !== undefined ? '#' + (rowIndex + 1) : '(unknown_row)' } in '${monthTab}' due to no essential financial data (and no existing UUID).`);
      return null; 
    }
    
    // Add common fields
    record.clinic_id = clinicId;
    record.provider_id = providerId; // Use the passed providerId
    record.month_tab = monthTab;
    record.created_at = new Date().toISOString();
    record.updated_at = new Date().toISOString();

    // Ensure 'id' is present, generate if it was not in the sheet
    if (!record.id) {
      record.id = Utilities.getUuid();
    }
    
    // Remove provider_name as it's no longer used
    // delete record.provider_name; // Ensure this field is not present

    return record;

  } catch (error) {
    Logger.log(`Error in parseHygieneRow_ for month tab "${monthTab}", providerId "${providerId}", row ${rowIndex !== undefined ? '#' + (rowIndex + 1) : '(unknown_row)'}, data "${row.join(',')}": ${error.message} (Stack: ${error.stack})`);
    return null;
  }
}

/**
 * Clean numeric values (remove $, commas, spaces, %)
 * @param {any} value - Value to clean
 * @return {string} Cleaned numeric string
 */
function cleanNumeric_(value) {
  if (!value) return '0';
  return String(value).replace(/[\$,\s%]/g, '');
}

/**
 * Parse date value into Supabase-compatible format
 * @param {any} dateValue - The date value to parse
 * @param {string} timeZone - The timezone to use for formatting
 * @return {string|null} A formatted date string in YYYY-MM-DD format or null if invalid
 */
function parseDateForSupabase_(dateValue, timeZone) {
  // If already a Date object and valid
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    try {
      return Utilities.formatDate(dateValue, timeZone, "yyyy-MM-dd");
    } catch (err) {
      Logger.log(`Error formatting date: ${err.message}`);
      return null;
    }
  }

  // For string dates or other formats
  if (dateValue) {
    try {
      let dateObj;

      if (typeof dateValue === 'string') {
        // Try JavaScript parsing first
        dateObj = new Date(dateValue);

        // If that failed, try manual parsing for common formats
        if (Number.isNaN(dateObj.getTime())) {
          // Try US format MM/DD/YYYY
          const usParts = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (usParts) {
            dateObj = new Date(usParts[3], usParts[1] - 1, usParts[2]);
          } else {
            Logger.log(`Could not parse date string: ${dateValue}`);
            return null;
          }
        }
      } else {
        // For other types, try direct conversion
        dateObj = new Date(dateValue);
      }

      // Ensure the date is valid before formatting
      if (!Number.isNaN(dateObj.getTime())) {
        return Utilities.formatDate(dateObj, timeZone, "yyyy-MM-dd");
      } else {
        Logger.log(`Invalid date object: ${dateValue}`);
        return null;
      }

    } catch (err) {
      Logger.log(`Error parsing date: ${err.message}`);
      return null;
    }
  }

  return null;
}
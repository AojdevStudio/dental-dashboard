/**
 * Get headers from a sheet (first row that contains data) and header row index
 * @param {Sheet} sheet - The Google Sheet
 * @return {object} Object containing headers array and headerRowIndex (0-based)
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
      return {
        headers: row.map(cell => String(cell).trim()),
        headerRowIndex: i
      };
    }
  }
  
  Logger.log(`getSheetHeaders_: No header row containing "date" or "day" found within the first 5 rows for sheet '${sheet.getName()}'. Falling back to first row if available.`);
  // Fallback to first row
  return {
    headers: data.length > 0 ? data[0].map(cell => String(cell).trim()) : [],
    headerRowIndex: 0
  };
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
  const missingCritical = criticalColumns.filter(key => mapping[key] === -1);
  
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
 * Extract and validate date value from row
 * @param {Array<any>} row The row data
 * @param {object} mapping The column mapping
 * @param {number} rowIndex The row index for logging
 * @param {string} monthTab The month tab name
 * @param {string} timezone The timezone
 * @return {string|null} Formatted date string or null if invalid
 */
function extractDateValue_(row, mapping, rowIndex, monthTab, timezone) {
  const dateColumnIndex = mapping.date !== undefined ? mapping.date : -1;
  if (dateColumnIndex === -1) {
    Logger.log(`extractDateValue_: CRITICAL - 'date' column not found in mapping for '${monthTab}'. Row ${rowIndex + 1} will be skipped.`);
    return null;
  }
  
  const dateValue = row[dateColumnIndex];
  const date = parseDateForSupabase_(dateValue, timezone);
  if (!date) {
    Logger.log(`extractDateValue_: Skipped row ${rowIndex + 1} in '${monthTab}' due to invalid or missing date. Value: '${dateValue}'`);
    return null;
  }
  
  // Validate that the date is not in the future
  const today = new Date();
  const todayString = Utilities.formatDate(today, timezone, "yyyy-MM-dd");
  if (date > todayString) {
    Logger.log(`extractDateValue_: Skipped row ${rowIndex + 1} in '${monthTab}' due to future date. Date: '${date}' is after today: '${todayString}'`);
    return null;
  }
  
  return date;
}

/**
 * Extract financial data from row
 * @param {Array<any>} row The row data
 * @param {object} mapping The column mapping
 * @param {number} rowIndex The row index for logging
 * @param {string} monthTab The month tab name
 * @return {object} Object containing extracted financial data and hasEssentialData flag
 */
function extractFinancialData_(row, mapping, rowIndex, monthTab) {
  const financialData = {};
  let hasEssentialData = false;
  
  for (const mappedKey in mapping) {
    if (mapping.hasOwnProperty(mappedKey) && mappedKey !== 'date') {
      const columnIndex = mapping[mappedKey];
      
      if (columnIndex !== undefined && columnIndex !== -1 && columnIndex < row.length) {
        let value = row[columnIndex];
        if (typeof value === 'string') {
          value = value.trim();
        }
        
        const supabaseFieldKey = mappedKey.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        if (['hoursWorked', 'estimatedProduction', 'verifiedProduction', 'productionGoal', 'variancePercentage', 'bonusAmount'].includes(mappedKey)) {
          let numericValue = parseFloat(cleanNumeric_(value));
          if (Number.isNaN(numericValue)) {
            numericValue = null;
          }
          
          // Cap variance_percentage to prevent database overflow (DECIMAL(10,2))
          if (mappedKey === 'variancePercentage' && numericValue !== null) {
            if (numericValue > 99999999.99) {
              Logger.log(`Capping variance_percentage from ${numericValue} to 99999999.99 for row ${rowIndex + 1}`);
              numericValue = 99999999.99;
            } else if (numericValue < -99999999.99) {
              Logger.log(`Capping variance_percentage from ${numericValue} to -99999999.99 for row ${rowIndex + 1}`);
              numericValue = -99999999.99;
            }
          }
          
          financialData[supabaseFieldKey] = numericValue;
          
          if (numericValue === null && (mappedKey === 'verifiedProduction' || mappedKey === 'estimatedProduction')) {
            Logger.log(`extractFinancialData_: Null numeric value for critical field '${mappedKey}' in '${monthTab}', row ${rowIndex + 1}. Original value: '${value}'`);
          }
          if (numericValue !== null && (mappedKey === 'estimatedProduction' || mappedKey === 'verifiedProduction')) {
            hasEssentialData = true;
          }
        } else if (mappedKey === 'uuid') {
          financialData.id = String(value || Utilities.getUuid());
        } else {
          financialData[supabaseFieldKey] = value;
        }
      } else {
        const supabaseFieldKey = mappedKey.replace(/([A-Z])/g, '_$1').toLowerCase();
        financialData[supabaseFieldKey] = null;
        if (columnIndex === -1) {
          Logger.log(`extractFinancialData_: Column for '${mappedKey}' was not found in sheet headers (mapping index -1) for '${monthTab}'. Setting to null.`);
        }
      }
    }
  }
  
  return { financialData, hasEssentialData };
}

/**
 * Build the final hygiene record
 * @param {object} data Combined data for the record
 * @return {object} Complete hygiene record
 */
function buildHygieneRecord_(data) {
  const record = {
    ...data.financialData,
    date: data.date,
    clinic_id: data.clinicId,
    provider_id: data.providerId,
    month_tab: data.monthTab,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Ensure 'id' is present
  if (!record.id) {
    record.id = Utilities.getUuid();
  }
  
  return record;
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
 * @param {string} timezone The spreadsheet timezone for date formatting.
 * @return {object|null} A structured object for the hygiene record or null if key data is missing.
 */
function parseHygieneRow_(row, mapping, monthTab, clinicId, providerId, rowIndex, timezone) {
  try {
    // Step 1: Extract and validate date
    const date = extractDateValue_(row, mapping, rowIndex, monthTab, timezone);
    if (!date) {
      return null;
    }
    
    // Step 2: Extract financial data
    const { financialData, hasEssentialData } = extractFinancialData_(row, mapping, rowIndex, monthTab);
    
    // Step 3: Check if we have essential data
    if (!hasEssentialData && !financialData.id) {
      Logger.log(`parseHygieneRow_: Skipped row ${rowIndex + 1} in '${monthTab}' due to no essential financial data (and no existing UUID).`);
      return null;
    }
    
    // Step 4: Validate clinic_id
    if (!clinicId) {
      Logger.log(`parseHygieneRow_: CRITICAL ERROR - clinic_id is null/undefined at parse time!`);
      Logger.log(`parseHygieneRow_: Row ${rowIndex + 1} in '${monthTab}' cannot be synced without clinic_id`);
      return null;
    }
    
    // Step 5: Build and return the record
    return buildHygieneRecord_({
      date,
      financialData,
      clinicId,
      providerId,
      monthTab
    });

  } catch (error) {
    Logger.log(`Error in parseHygieneRow_ for month tab "${monthTab}", providerId "${providerId}", row ${rowIndex !== undefined ? '#' + (rowIndex + 1) : '(unknown_row)'}, data "${row.join(',')}": ${error.message} (Stack: ${error.stack})`);
    return null;
  }
}

/**
 * Clean numeric values (remove $, commas, spaces, %)
 * Expects US-style number format: 1,234.56 (comma as thousands separator, period as decimal)
 * @param {any} value - Value to clean
 * @return {string} Cleaned numeric string
 */
function cleanNumeric_(value) {
  if (!value && value !== 0) return '0';
  
  // Handle edge cases
  if (typeof value === 'number') {
    return String(value);
  }
  
  let stringValue = String(value).trim();
  
  // Handle empty string after trimming
  if (stringValue === '') return '0';
  
  // Remove currency symbols, commas (thousands separators), spaces, and percentage signs
  // This assumes US format where comma is thousands separator and period is decimal
  stringValue = stringValue.replace(/[\$,\s%]/g, '');
  
  // Handle parentheses for negative numbers (accounting format)
  if (stringValue.startsWith('(') && stringValue.endsWith(')')) {
    stringValue = '-' + stringValue.slice(1, -1);
  }
  
  // Validate that result is a valid number format
  if (!/^-?\d*\.?\d*$/.test(stringValue)) {
    Logger.log(`cleanNumeric_: Warning - unusual number format detected: '${value}' -> '${stringValue}'`);
  }
  
  return stringValue;
}

/**
 * Parse date value into Supabase-compatible format
 * Supports multiple date formats including DD-MMM-YYYY, DD/MM/YYYY, MM/DD/YYYY
 * @param {any} dateValue - The date value to parse
 * @param {string} timeZone - The timezone to use for formatting
 * @return {string|null} A formatted date string in YYYY-MM-DD format or null if invalid
 */
function parseDateForSupabase_(dateValue, timeZone) {
  // Handle null, undefined, or empty values
  if (!dateValue || dateValue === '') {
    Logger.log(`parseDateForSupabase_: Empty or null date value provided`);
    return null;
  }

  // If already a Date object and valid
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    try {
      // Validate date is reasonable (not too far in past/future)
      const year = dateValue.getFullYear();
      if (year < 1900 || year > 2100) {
        Logger.log(`parseDateForSupabase_: Date year ${year} is outside reasonable range (1900-2100)`);
        return null;
      }
      return Utilities.formatDate(dateValue, timeZone, "yyyy-MM-dd");
    } catch (err) {
      Logger.log(`parseDateForSupabase_: Error formatting Date object: ${err.message}`);
      return null;
    }
  }

  // For string dates or other formats
  if (dateValue) {
    try {
      let dateObj;
      const originalValue = dateValue;
      
      if (typeof dateValue === 'string') {
        const trimmedValue = dateValue.trim();
        
        // Handle empty string after trimming
        if (trimmedValue === '') {
          Logger.log(`parseDateForSupabase_: Empty string after trimming`);
          return null;
        }

        // Try specific regex patterns for common formats first (more reliable than Date constructor)
        
        // DD-MMM-YYYY format (e.g., "15-Jan-2024", "03-Dec-2023")
        const ddMmmYyyyMatch = trimmedValue.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
        if (ddMmmYyyyMatch) {
          const day = parseInt(ddMmmYyyyMatch[1], 10);
          const monthAbbr = ddMmmYyyyMatch[2].toLowerCase();
          const year = parseInt(ddMmmYyyyMatch[3], 10);
          
          const monthMap = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          };
          
          if (monthMap.hasOwnProperty(monthAbbr)) {
            dateObj = new Date(year, monthMap[monthAbbr], day);
            Logger.log(`parseDateForSupabase_: Successfully parsed DD-MMM-YYYY format: ${trimmedValue}`);
          } else {
            Logger.log(`parseDateForSupabase_: Unknown month abbreviation in DD-MMM-YYYY format: ${monthAbbr}`);
            return null;
          }
        }
        
        // DD/MM/YYYY format (European style - be careful with ambiguous dates)
        else {
          const ddMmYyyyMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (ddMmYyyyMatch) {
            const first = parseInt(ddMmYyyyMatch[1], 10);
            const second = parseInt(ddMmYyyyMatch[2], 10);
            const year = parseInt(ddMmYyyyMatch[3], 10);
            
            // Heuristic: if first number > 12, it's likely DD/MM/YYYY
            // if second number > 12, it's likely MM/DD/YYYY
            // if both <= 12, assume MM/DD/YYYY (US format) unless configured otherwise
            if (first > 12 && second <= 12) {
              // DD/MM/YYYY format
              dateObj = new Date(year, second - 1, first);
              Logger.log(`parseDateForSupabase_: Parsed as DD/MM/YYYY format: ${trimmedValue}`);
            } else if (second > 12 && first <= 12) {
              // MM/DD/YYYY format
              dateObj = new Date(year, first - 1, second);
              Logger.log(`parseDateForSupabase_: Parsed as MM/DD/YYYY format: ${trimmedValue}`);
            } else {
              // Ambiguous - default to MM/DD/YYYY (US format)
              dateObj = new Date(year, first - 1, second);
              Logger.log(`parseDateForSupabase_: Ambiguous date format, defaulting to MM/DD/YYYY: ${trimmedValue}`);
            }
          }
          
          // Try JavaScript Date constructor as fallback
          else {
            dateObj = new Date(trimmedValue);
            if (!Number.isNaN(dateObj.getTime())) {
              Logger.log(`parseDateForSupabase_: Successfully parsed with Date constructor: ${trimmedValue}`);
            }
          }
        }

      } else {
        // For other types (numbers, etc.), try direct conversion
        dateObj = new Date(dateValue);
        Logger.log(`parseDateForSupabase_: Attempting to parse non-string value: ${dateValue} (type: ${typeof dateValue})`);
      }

      // Validate the resulting date object
      if (dateObj && !Number.isNaN(dateObj.getTime())) {
        // Additional validation: check if date is reasonable
        const year = dateObj.getFullYear();
        if (year < 1900 || year > 2100) {
          Logger.log(`parseDateForSupabase_: Parsed date year ${year} is outside reasonable range (1900-2100) for input: ${originalValue}`);
          return null;
        }
        
        // Check for invalid dates like February 30th
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
        const testDate = new Date(year, month, day);
        if (testDate.getFullYear() !== year || testDate.getMonth() !== month || testDate.getDate() !== day) {
          Logger.log(`parseDateForSupabase_: Invalid date detected (e.g., Feb 30th) for input: ${originalValue}`);
          return null;
        }
        
        return Utilities.formatDate(dateObj, timeZone, "yyyy-MM-dd");
      } else {
        Logger.log(`parseDateForSupabase_: Failed to parse date value: ${originalValue} (type: ${typeof originalValue})`);
        return null;
      }

    } catch (err) {
      Logger.log(`parseDateForSupabase_: Error parsing date value '${dateValue}': ${err.message}`);
      return null;
    }
  }

  Logger.log(`parseDateForSupabase_: No valid date value provided: ${dateValue}`);
  return null;
}
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
      return row.map(cell => String(cell).trim());
    }
  }
  
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
    variance: -1,
    bonus: -1,
    uuid: -1
  };

  headers.forEach((header, index) => {
    const cleanHeader = String(header).toLowerCase().trim();
    
    // Use exact matches first, then contains matches, and only set if not already mapped
    
    // Date column
    if (mapping.date === -1 && HYGIENE_COLUMN_HEADERS.DATE.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.date = index;
    }
    // Hours worked - exact match to avoid "Average Hours worked"
    else if (mapping.hoursWorked === -1 && cleanHeader === 'hours worked') {
      mapping.hoursWorked = index;
    }
    // Estimated production
    else if (mapping.estimatedProduction === -1 && HYGIENE_COLUMN_HEADERS.ESTIMATED_PRODUCTION.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.estimatedProduction = index;
    }
    // Verified production
    else if (mapping.verifiedProduction === -1 && HYGIENE_COLUMN_HEADERS.VERIFIED_PRODUCTION.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.verifiedProduction = index;
    }
    // Production goal - exact match to avoid "Over/Under Production Goal"
    else if (mapping.productionGoal === -1 && cleanHeader === 'production goal') {
      mapping.productionGoal = index;
    }
    // Variance - exact match to avoid longer variance column names
    else if (mapping.variance === -1 && cleanHeader === 'variance') {
      mapping.variance = index;
    }
    // Bonus - exact match
    else if (mapping.bonus === -1 && cleanHeader === 'bonus') {
      mapping.bonus = index;
    }
    // UUID
    else if (mapping.uuid === -1 && HYGIENE_COLUMN_HEADERS.UUID.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.uuid = index;
    }
  });

  // Debug logging to help troubleshoot missing columns
  Logger.log('=== HEADER MAPPING DEBUG ===');
  Logger.log('Sheet headers: ' + JSON.stringify(headers));
  Logger.log('Final mapping: ' + JSON.stringify(mapping));
  Logger.log('Missing mappings: ' + Object.keys(mapping).filter(key => mapping[key] === -1).join(', '));

  return mapping;
}

/**
 * Extract provider name from spreadsheet name - SIMPLE VERSION
 * @param {string} sheetName - The spreadsheet name
 * @return {string} The provider name (e.g., "Adriane")
 */
function extractProviderNameFromSheet_(sheetName) {
  // Remove common words and get the first name
  const cleanName = sheetName
    .replace(/hygiene/gi, '')
    .replace(/production/gi, '')
    .replace(/tracker/gi, '')
    .replace(/data/gi, '')
    .replace(/sheet/gi, '')
    .replace(/dashboard/gi, '')
    .replace(/dr\./gi, '')
    .replace(/\s*-\s*/g, ' ')
    .trim();
  
  // Get first word as provider name
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  return words.length > 0 ? words[0] : 'Unknown';
}

/**
 * Parse a row of hygiene data into a record object
 * @param {array} row - Array of cell values from the sheet
 * @param {object} mapping - Column mapping from mapHeaders_
 * @param {string} monthTab - Name of the month tab (e.g., "Dec-23")
 * @param {string} clinicId - Clinic ID
 * @return {object|null} Hygiene record object or null if invalid
 */
function parseHygieneRow_(row, mapping, monthTab, clinicId) {
  try {
    // Extract date
    const dateValue = mapping.date !== -1 ? row[mapping.date] : null;
    if (!dateValue) return null;

    const date = parseDateForSupabase_(dateValue, Session.getScriptTimeZone());
    if (!date) return null;

    // Extract numeric values, cleaning currency formatting
    const hoursWorked = mapping.hoursWorked !== -1 ? parseFloat(cleanNumeric_(row[mapping.hoursWorked])) || null : null;
    const estimatedProduction = mapping.estimatedProduction !== -1 ? parseFloat(cleanNumeric_(row[mapping.estimatedProduction])) || null : null;
    const verifiedProduction = mapping.verifiedProduction !== -1 ? parseFloat(cleanNumeric_(row[mapping.verifiedProduction])) || null : null;
    const productionGoal = mapping.productionGoal !== -1 ? parseFloat(cleanNumeric_(row[mapping.productionGoal])) || null : null;
    const bonus = mapping.bonus !== -1 ? parseFloat(cleanNumeric_(row[mapping.bonus])) || null : null;

    // Extract UUID or generate one
    let uuid = mapping.uuid !== -1 ? row[mapping.uuid] : null;
    if (!uuid || String(uuid).trim() === '') {
      uuid = Utilities.getUuid();
    }

    // Calculate variance if not provided directly
    let variancePercentage = null;
    if (mapping.variance !== -1) {
      const varianceValue = cleanNumeric_(row[mapping.variance]);
      variancePercentage = parseFloat(varianceValue) || null;
      // Convert percentage values like 85 to 0.85 if they seem to be in percentage format
      if (variancePercentage !== null && variancePercentage > 1) {
        variancePercentage = variancePercentage / 100;
      }
    } else if (productionGoal && productionGoal > 0 && verifiedProduction !== null) {
      variancePercentage = ((verifiedProduction - productionGoal) / productionGoal);
    }

    // Extract provider name from spreadsheet name
    const ss = SpreadsheetApp.openById(HYGIENE_SHEET_ID);
    const spreadsheetName = ss.getName();
    const providerName = extractProviderNameFromSheet_(spreadsheetName);

    return {
      id: String(uuid),
      clinic_id: clinicId,
      date: date,
      month_tab: monthTab,
      hours_worked: hoursWorked,
      estimated_production: estimatedProduction,
      verified_production: verifiedProduction,
      production_goal: productionGoal,
      variance_percentage: variancePercentage !== null ? Number(variancePercentage.toFixed(4)) : null,
      bonus_amount: bonus,
      provider_name: providerName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

  } catch (error) {
    Logger.log(`Error parsing hygiene row: ${error.message}`);
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
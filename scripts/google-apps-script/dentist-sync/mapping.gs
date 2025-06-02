/**
 * Get headers from a sheet (first row that contains data)
 * @param {Sheet} sheet - The Google Sheet
 * @return {array} Array of header strings
 */
function getSheetHeaders_(sheet) {
  const data = sheet.getDataRange().getValues();
  
  // Find header row (contains "Date", "Verified Production", etc.)
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
 * Map sheet headers to database columns for dentist production
 * @param {array} headers - Array of header strings from the sheet
 * @return {object} Object mapping field names to column indices
 */
function mapHeaders_(headers) {
  // Add extensive logging to verify column mapping is working:
  console.log('Raw headers:', headers);
  console.log('Clean header 0:', String(headers[0]).toLowerCase().trim());
  // Ensure DENTIST_COLUMN_HEADERS.DATE exists and is an array before calling .some
  if (typeof DENTIST_COLUMN_HEADERS !== 'undefined' && DENTIST_COLUMN_HEADERS && Array.isArray(DENTIST_COLUMN_HEADERS.DATE)) {
    console.log('Date pattern match:', DENTIST_COLUMN_HEADERS.DATE.some(pattern => String(headers[0]).toLowerCase().trim().includes(pattern)));
  } else {
    console.log('DENTIST_COLUMN_HEADERS.DATE is not defined or not an array');
  }

  const mapping = {
    date: -1,
    verifiedProductionHumble: -1,
    verifiedProductionBaytown: -1,
    totalProduction: -1,
    monthlyGoal: -1,
    productionPerHour: -1,
    avgDailyProduction: -1,
    uuid: -1
  };

  headers.forEach((header, index) => {
    const cleanHeader = String(header).toLowerCase().trim();
    
    // Use individual if statements instead of else-if chain to allow multiple matches
    
    // Date column
    if (mapping.date === -1 && DENTIST_COLUMN_HEADERS.DATE.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.date = index;
    }
    // Verified Production Humble - use pattern matching instead of exact match
    if (mapping.verifiedProductionHumble === -1 && cleanHeader.includes('verified production') && cleanHeader.includes('humble')) {
      mapping.verifiedProductionHumble = index;
    }
    // Verified Production Baytown - use pattern matching instead of exact match
    if (mapping.verifiedProductionBaytown === -1 && cleanHeader.includes('verified production') && cleanHeader.includes('baytown')) {
      mapping.verifiedProductionBaytown = index;
    }
    // Total Production
    if (mapping.totalProduction === -1 && DENTIST_COLUMN_HEADERS.TOTAL_PRODUCTION.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.totalProduction = index;
    }
    // Monthly Goal
    if (mapping.monthlyGoal === -1 && DENTIST_COLUMN_HEADERS.MONTHLY_GOAL.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.monthlyGoal = index;
    }
    // Production Per Hour
    if (mapping.productionPerHour === -1 && DENTIST_COLUMN_HEADERS.PRODUCTION_PER_HOUR.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.productionPerHour = index;
    }
    // Average Daily Production
    if (mapping.avgDailyProduction === -1 && DENTIST_COLUMN_HEADERS.AVG_DAILY_PRODUCTION.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.avgDailyProduction = index;
    }
    // UUID
    if (mapping.uuid === -1 && DENTIST_COLUMN_HEADERS.UUID.some(pattern => cleanHeader === pattern || cleanHeader.includes(pattern))) {
      mapping.uuid = index;
    }
  });

  // Debug logging to help troubleshoot missing columns
  Logger.log('=== DENTIST HEADER MAPPING DEBUG ===');
  Logger.log('Sheet headers: ' + JSON.stringify(headers));
  Logger.log('Final mapping: ' + JSON.stringify(mapping));
  Logger.log('Missing mappings: ' + Object.keys(mapping).filter(key => mapping[key] === -1).join(', '));

  return mapping;
}

/**
 * Extract provider name from spreadsheet name - DENTIST VERSION
 * @param {string} sheetName - The spreadsheet name
 * @return {string} The provider name (e.g., "Dr. Obi")
 */
function extractProviderNameFromSheet_(sheetName) {
  // Look for "Dr. [Name]" pattern first
  const drMatch = sheetName.match(/Dr\.?\s+(\w+)/i);
  if (drMatch) {
    return `Dr. ${drMatch[1]}`;
  }
  
  // Fallback: Remove common words and get the first name
  const cleanName = sheetName
    .replace(/associate/gi, '')
    .replace(/production/gi, '')
    .replace(/tracker/gi, '')
    .replace(/data/gi, '')
    .replace(/sheet/gi, '')
    .replace(/dashboard/gi, '')
    .replace(/\s*-\s*/g, ' ')
    .trim();
  
  // Get first word as provider name
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  return words.length > 0 ? words[0] : 'Unknown';
}

/**
 * Parse a row of dentist data into a record object
 * @param {array} row - Array of cell values from the sheet
 * @param {object} mapping - Column mapping from mapHeaders_
 * @param {string} monthTab - Name of the month tab (e.g., "Nov-24")
 * @param {string} clinicId - Clinic ID
 * @return {object|null} Dentist record object or null if invalid
 */
function parseDentistRow_(row, mapping, monthTab, clinicId) {
  try {
    // Extract date
    const dateValue = mapping.date !== -1 ? row[mapping.date] : null;
    if (!dateValue) return null;

    const date = parseDateForSupabase_(dateValue, Session.getScriptTimeZone());
    if (!date) return null;

    // Extract production values - dual locations
    const verifiedProductionHumble = mapping.verifiedProductionHumble !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.verifiedProductionHumble])) || 0 : 0;
    
    const verifiedProductionBaytown = mapping.verifiedProductionBaytown !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.verifiedProductionBaytown])) || 0 : 0;

    // Extract other numeric values
    const totalProduction = mapping.totalProduction !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.totalProduction])) || null : null;
    
    const monthlyGoal = mapping.monthlyGoal !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.monthlyGoal])) || null : null;
    
    const productionPerHour = mapping.productionPerHour !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.productionPerHour])) || null : null;
    
    const avgDailyProduction = mapping.avgDailyProduction !== -1 ? 
      parseFloat(cleanNumeric_(row[mapping.avgDailyProduction])) || null : null;

    // Extract UUID or generate one
    let uuid = mapping.uuid !== -1 ? row[mapping.uuid] : null;
    if (!uuid || String(uuid).trim() === '') {
      uuid = Utilities.getUuid();
    }

    // Extract provider name from spreadsheet name
    const ss = SpreadsheetApp.openById(DENTIST_SHEET_ID);
    const spreadsheetName = ss.getName();
    const providerName = extractProviderNameFromSheet_(spreadsheetName);

    return {
      id: String(uuid),
      clinic_id: clinicId,
      date: date,
      month_tab: monthTab,
      verified_production_humble: verifiedProductionHumble,
      verified_production_baytown: verifiedProductionBaytown,
      total_production: totalProduction,
      monthly_goal: monthlyGoal,
      production_per_hour: productionPerHour,
      avg_daily_production: avgDailyProduction,
      provider_name: providerName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

  } catch (error) {
    Logger.log(`Error parsing dentist row: ${error.message}`);
    return null;
  }
}

/**
 * Clean numeric values (remove $, commas, spaces, %, parentheses for negatives)
 * @param {any} value - Value to clean
 * @return {string} Cleaned numeric string
 */
function cleanNumeric_(value) {
  if (!value) return '0';
  
  let cleanValue = String(value).replace(/[\$,\s%]/g, '');
  
  // Handle negative values in quotes like "-1,296.00"
  if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
    cleanValue = cleanValue.slice(1, -1);
  }
  
  return cleanValue;
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
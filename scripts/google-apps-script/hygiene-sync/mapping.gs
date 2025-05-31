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
    
    // Date column
    if (HYGIENE_COLUMN_HEADERS.DATE.some(pattern => cleanHeader.includes(pattern))) {
      mapping.date = index;
    }
    // Hours worked
    else if (HYGIENE_COLUMN_HEADERS.HOURS_WORKED.some(pattern => cleanHeader.includes(pattern))) {
      mapping.hoursWorked = index;
    }
    // Estimated production
    else if (HYGIENE_COLUMN_HEADERS.ESTIMATED_PRODUCTION.some(pattern => cleanHeader.includes(pattern))) {
      mapping.estimatedProduction = index;
    }
    // Verified production
    else if (HYGIENE_COLUMN_HEADERS.VERIFIED_PRODUCTION.some(pattern => cleanHeader.includes(pattern))) {
      mapping.verifiedProduction = index;
    }
    // Production goal
    else if (HYGIENE_COLUMN_HEADERS.PRODUCTION_GOAL.some(pattern => cleanHeader.includes(pattern))) {
      mapping.productionGoal = index;
    }
    // Variance
    else if (HYGIENE_COLUMN_HEADERS.VARIANCE.some(pattern => cleanHeader.includes(pattern))) {
      mapping.variance = index;
    }
    // Bonus
    else if (HYGIENE_COLUMN_HEADERS.BONUS.some(pattern => cleanHeader.includes(pattern))) {
      mapping.bonus = index;
    }
    // UUID
    else if (HYGIENE_COLUMN_HEADERS.UUID.some(pattern => cleanHeader.includes(pattern))) {
      mapping.uuid = index;
    }
  });

  return mapping;
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

    // Get provider and data source info
    const providerInfo = getProviderInfo_();
    const providerId = providerInfo ? providerInfo.providerId : null;
    const dataSourceId = providerInfo ? providerInfo.dataSourceId : null;

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
      provider_id: providerId,
      data_source_id: dataSourceId,
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
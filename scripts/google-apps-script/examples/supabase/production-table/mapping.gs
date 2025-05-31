/**
 * Parse a date value into a Supabase-compatible format.
 * Handles various date formats and returns a formatted string or null if invalid.
 *
 * @param {any} dateValue - The date value to parse (Date object, string, etc.)
 * @param {string} timeZone - The timezone to use for formatting
 * @return {string|null} A formatted date string in YYYY-MM-DD format or null if invalid
 * @private
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
      // Try to convert to a Date object
      let dateObj;

      if (typeof dateValue === 'string') {
        // Common formats: MM/DD/YYYY, MM-DD-YYYY, DD/MM/YYYY, YYYY-MM-DD
        // Let JavaScript try to parse the string
        dateObj = new Date(dateValue);

        // If that failed, try some manual parsing for common formats
        if (Number.isNaN(dateObj.getTime())) {
          // Try US format MM/DD/YYYY
          const usParts = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (usParts) {
            dateObj = new Date(usParts[3], usParts[1] - 1, usParts[2]);
          } else {
            // Try other formats as needed
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
      }
    } catch (err) {
      Logger.log(`Error parsing date value ${dateValue}: ${err.message}`);
    }
  }

  // Return null for empty or invalid dates
  return null;
}

/**
 * Maps a row from the Google Sheet to a record suitable for Supabase.
 * Uses hardcoded column indices for mapping.
 *
 * @param {Array} rowData - The row data from the sheet
 * @param {string} timeZone - The timezone to use for date formatting
 * @return {Object} A record suitable for insertion into Supabase
 * @private
 */
function mapSheetRowToSupabaseRecord_(rowData, timeZone) {
  const record = {};

  // Date (Column A, Index 0)
  record.date = parseDateForSupabase_(rowData[0], timeZone);

  // Helper function to convert empty strings or invalid numbers to null
  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // Hours Worked (Column B, Index 1)
  record.hours_worked = toNumberOrNull(rowData[1]);

  // Location (Column C, Index 2)
  record.location = rowData[2];

  // Provider Name (Column D, Index 3)
  record.provider_name = rowData[3];

  // Provider Type (Column E, Index 4)
  record.provider_type = rowData[4];

  // Source Sheet (Column F, Index 5)
  record.source_sheet = rowData[5];

  // Production Goal Daily (Column G, Index 6)
  record.production_goal_daily = toNumberOrNull(rowData[6]);

  // Verified Production (Column H, Index 7)
  record.verified_production = toNumberOrNull(rowData[7]);

  // Bonus (Column I, Index 8)
  record.bonus = toNumberOrNull(rowData[8]);

  // Humble Production (Column J, Index 9)
  record.humble_production = toNumberOrNull(rowData[9]);

  // Baytown Production (Column K, Index 10)
  record.baytown_production = toNumberOrNull(rowData[10]);

  // Monthly Goal (Column L, Index 11)
  record.monthly_goal = toNumberOrNull(rowData[11]);

  // UUID (Column M, Index 12)
  record.uuid = rowData[12];

  // Enhanced UUID validation
  if (!record.uuid) {
    Logger.log('Skipping row: Missing UUID after mapping');
    return null;
  }

  // Validate UUID format (basic check)
  if (typeof record.uuid !== 'string' || record.uuid.length < 32) {
    Logger.log(`Skipping row: Invalid UUID format: ${record.uuid}`);
    return null;
  }

  // Ensure the UUID doesn't contain invalid characters
  const uuidRegex = /^[0-9a-f-]+$/i;
  if (!uuidRegex.test(record.uuid)) {
    Logger.log(`Skipping row: UUID contains invalid characters: ${record.uuid}`);
    return null;
  }

  return record;
}
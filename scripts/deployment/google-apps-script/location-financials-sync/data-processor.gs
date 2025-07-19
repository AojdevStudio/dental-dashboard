/**
 * ========================================
 * LOCATION FINANCIAL DATA PROCESSOR
 * ========================================
 * Handles data validation, transformation, and processing
 * for location-based financial data synchronization
 */

/**
 * Processes all location financial data from the spreadsheet
 * @returns {Array} Array of processing results for each location
 */
function processAllLocationFinancialData() {
  const results = [];
  
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    // Process each sheet that matches location patterns
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      const location = detectLocationFromSheetName(sheetName);
      
      if (location) {
        logLocationFinancialOperation('PROCESS_LOCATION', `Processing ${location} data from sheet: ${sheetName}`);
        
        try {
          const result = processLocationFinancialDataFromSheet(sheet, location);
          results.push({
            location: location,
            sheetName: sheetName,
            recordsProcessed: result.recordsProcessed,
            recordsSkipped: result.recordsSkipped,
            errors: result.errors.length,
            success: result.success
          });
          
        } catch (error) {
          logLocationFinancialError('PROCESS_LOCATION', `Failed to process ${location} data`, error);
          results.push({
            location: location,
            sheetName: sheetName,
            recordsProcessed: 0,
            recordsSkipped: 0,
            errors: 1,
            success: false,
            error: error.message
          });
        }
      }
    }
    
    return results;
    
  } catch (error) {
    logLocationFinancialError('PROCESS_ALL', 'Failed to process location financial data', error);
    throw error;
  }
}

/**
 * Processes financial data for a specific location
 * @param {string} locationName - Name of the location to process
 * @returns {Object} Processing result
 */
function processLocationFinancialData(locationName) {
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    // Find sheets that match the specified location
    const locationSheets = sheets.filter(sheet => {
      const sheetLocation = detectLocationFromSheetName(sheet.getName());
      return sheetLocation === locationName;
    });
    
    if (locationSheets.length === 0) {
      throw new Error(`No sheets found for location: ${locationName}`);
    }
    
    const results = [];
    
    for (const sheet of locationSheets) {
      logLocationFinancialOperation('PROCESS_LOCATION', `Processing ${locationName} data from sheet: ${sheet.getName()}`);
      
      const result = processLocationFinancialDataFromSheet(sheet, locationName);
      results.push({
        location: locationName,
        sheetName: sheet.getName(),
        recordsProcessed: result.recordsProcessed,
        recordsSkipped: result.recordsSkipped,
        errors: result.errors.length,
        success: result.success
      });
    }
    
    return results;
    
  } catch (error) {
    logLocationFinancialError('PROCESS_LOCATION', `Failed to process ${locationName} data`, error);
    throw error;
  }
}

/**
 * Processes financial data from a specific sheet
 * @param {Sheet} sheet - The Google Sheets sheet object
 * @param {string} locationName - Name of the location
 * @returns {Object} Processing result with counts and errors
 */
function processLocationFinancialDataFromSheet(sheet, locationName) {
  const result = {
    recordsProcessed: 0,
    recordsSkipped: 0,
    errors: [],
    success: false
  };
  
  try {
    // Get all data from the sheet
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length === 0) {
      result.success = true;
      return result;
    }
    
    // Find header row and column mappings
    const headerInfo = findLocationFinancialHeaders(values);
    
    if (!headerInfo.found) {
      throw new Error(`Could not find required headers in sheet: ${sheet.getName()}`);
    }
    
    // Validate required columns are present
    const validation = validateRequiredFinancialColumns(headerInfo.columnMapping);
    if (!validation.isValid) {
      throw new Error(`Missing required columns: ${validation.missingColumns.join(', ')}`);
    }
    
    // Process data rows
    const records = [];
    
    for (let i = headerInfo.headerRow + 1; i < values.length; i++) {
      const row = values[i];
      
      try {
        const record = transformLocationFinancialRow(row, headerInfo.columnMapping, locationName);
        
        if (record) {
          records.push(record);
          result.recordsProcessed++;
        } else {
          result.recordsSkipped++;
        }
        
      } catch (error) {
        result.errors.push(`Row ${i + 1}: ${error.message}`);
        result.recordsSkipped++;
      }
    }
    
    // Send data to API in batches if we have valid records
    if (records.length > 0) {
      const apiResult = sendLocationFinancialDataToAPI(records, locationName);
      
      if (!apiResult.success) {
        result.errors.push(`API Error: ${apiResult.error}`);
      }
    }
    
    result.success = result.errors.length === 0;
    return result;
    
  } catch (error) {
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Finds header row and creates column mapping for financial data
 * @param {Array} values - 2D array of sheet values
 * @returns {Object} Header information and column mapping
 */
function findLocationFinancialHeaders(values) {
  for (let rowIndex = 0; rowIndex < Math.min(values.length, 10); rowIndex++) {
    const row = values[rowIndex];
    const columnMapping = createLocationFinancialColumnMapping(row);
    
    // Check if we found required columns
    if (columnMapping.DATE !== -1 && columnMapping.PRODUCTION !== -1) {
      return {
        found: true,
        headerRow: rowIndex,
        columnMapping: columnMapping
      };
    }
  }
  
  return { found: false };
}

/**
 * Creates column mapping for financial data based on header row
 * @param {Array} headerRow - Array of header values
 * @returns {Object} Column mapping object
 */
function createLocationFinancialColumnMapping(headerRow) {
  const mapping = {};
  
  // Initialize all mappings to -1 (not found)
  Object.keys(FINANCIAL_COLUMN_HEADERS).forEach(key => {
    mapping[key] = -1;
  });
  
  // Search for each column type
  Object.keys(FINANCIAL_COLUMN_HEADERS).forEach(columnType => {
    const patterns = FINANCIAL_COLUMN_HEADERS[columnType];
    
    for (let colIndex = 0; colIndex < headerRow.length; colIndex++) {
      const header = (headerRow[colIndex] || '').toString().toLowerCase().trim();
      
      // Check if header matches any pattern for this column type
      if (patterns.some(pattern => header === pattern.toLowerCase())) {
        mapping[columnType] = colIndex;
        break;
      }
    }
  });
  
  return mapping;
}

/**
 * Validates that required financial columns are present
 * @param {Object} columnMapping - Column mapping object
 * @returns {Object} Validation result
 */
function validateRequiredFinancialColumns(columnMapping) {
  const missingColumns = [];
  
  REQUIRED_FINANCIAL_FIELDS.forEach(field => {
    if (columnMapping[field] === -1) {
      missingColumns.push(field);
    }
  });
  
  return {
    isValid: missingColumns.length === 0,
    missingColumns: missingColumns
  };
}

/**
 * Transforms a sheet row into a financial record object
 * @param {Array} row - Array of cell values
 * @param {Object} columnMapping - Column mapping object
 * @param {string} locationName - Name of the location
 * @param {number} rowNumber - Row number for error reporting
 * @returns {Object|null} Transformed record or null if row should be skipped
 */
function transformLocationFinancialRow(row, columnMapping, locationName) {
  // Get date value
  const dateValue = getCellValue(row, columnMapping.DATE);
  if (!dateValue) {
    return null; // Skip rows without dates
  }
  
  // Parse and validate date
  const date = parseLocationFinancialDate(dateValue);
  if (!date) {
    throw new Error(`Invalid date format: ${dateValue}`);
  }
  
  // Get financial values with defaults
  const production = parseLocationFinancialAmount(getCellValue(row, columnMapping.PRODUCTION));
  const adjustments = parseLocationFinancialAmount(getCellValue(row, columnMapping.ADJUSTMENTS)) || FINANCIAL_FIELD_DEFAULTS.ADJUSTMENTS;
  const writeOffs = parseLocationFinancialAmount(getCellValue(row, columnMapping.WRITE_OFFS)) || FINANCIAL_FIELD_DEFAULTS.WRITE_OFFS;
  const patientIncome = parseLocationFinancialAmount(getCellValue(row, columnMapping.PATIENT_INCOME)) || FINANCIAL_FIELD_DEFAULTS.PATIENT_INCOME;
  const insuranceIncome = parseLocationFinancialAmount(getCellValue(row, columnMapping.INSURANCE_INCOME)) || FINANCIAL_FIELD_DEFAULTS.INSURANCE_INCOME;
  const unearned = parseLocationFinancialAmount(getCellValue(row, columnMapping.UNEARNED)) || FINANCIAL_FIELD_DEFAULTS.UNEARNED;
  
  // Validate required production value
  if (production === null || production === undefined) {
    throw new Error('Production value is required');
  }
  
  // Validate financial amounts
  validateFinancialAmount('production', production, FINANCIAL_VALIDATION_RULES.MIN_PRODUCTION, FINANCIAL_VALIDATION_RULES.MAX_PRODUCTION);
  validateFinancialAmount('adjustments', adjustments, FINANCIAL_VALIDATION_RULES.MIN_ADJUSTMENT, FINANCIAL_VALIDATION_RULES.MAX_ADJUSTMENT);
  validateFinancialAmount('patientIncome', patientIncome, FINANCIAL_VALIDATION_RULES.MIN_INCOME, FINANCIAL_VALIDATION_RULES.MAX_INCOME);
  validateFinancialAmount('insuranceIncome', insuranceIncome, FINANCIAL_VALIDATION_RULES.MIN_INCOME, FINANCIAL_VALIDATION_RULES.MAX_INCOME);
  
  // Return transformed record
  return {
    date: formatLocationFinancialDate(date),
    locationName: locationName,
    production: production,
    adjustments: adjustments,
    writeOffs: writeOffs,
    patientIncome: patientIncome,
    insuranceIncome: insuranceIncome,
    unearned: unearned
  };
}

/**
 * Helper function to get cell value safely
 * @param {Array} row - Row array
 * @param {number} columnIndex - Column index (-1 if not found)
 * @returns {*} Cell value or null
 */
function getCellValue(row, columnIndex) {
  if (columnIndex === -1 || columnIndex >= row.length) {
    return null;
  }
  return row[columnIndex];
}

/**
 * Parses and validates a date value
 * @param {*} dateValue - Raw date value from sheet
 * @returns {Date|null} Parsed date or null if invalid
 */
function parseLocationFinancialDate(dateValue) {
  if (!dateValue) return null;
  
  // Handle Date objects
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Handle string dates
  const dateStr = dateValue.toString().trim();
  if (!dateStr) return null;
  
  // Try parsing with various formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

/**
 * Formats a date for API consumption
 * @param {Date} date - Date object
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
function formatLocationFinancialDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Parses and validates a financial amount
 * @param {*} value - Raw value from sheet
 * @param {string} fieldName - Field name for error reporting
 * @returns {number|null} Parsed amount or null
 */
function parseLocationFinancialAmount(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Convert to string and clean
  let cleanValue = value.toString().trim();
  
  // Remove currency symbols and commas
  cleanValue = cleanValue.replace(/[$,]/g, '');
  
  // Parse as float
  const amount = parseFloat(cleanValue);
  
  if (isNaN(amount)) {
    return null;
  }
  
  return amount;
}

/**
 * Validates a financial amount against rules
 * @param {string} fieldName - Field name
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @throws {Error} If validation fails
 */
function validateFinancialAmount(fieldName, amount, min, max) {
  if (amount < min || amount > max) {
    throw new Error(`${fieldName} amount ${amount} is outside valid range (${min} to ${max})`);
  }
}

/**
 * Detects location from sheet name
 * @param {string} sheetName - Name of the sheet
 * @returns {string|null} Location name or null if not detected
 */
function detectLocationFromSheetName(sheetName) {
  // Check against location patterns
  for (const pattern of LOCATION_TAB_PATTERNS) {
    if (pattern.test(sheetName)) {
      // Determine which location based on the pattern match
      if (/bt|baytown/i.test(sheetName)) {
        return 'Baytown';
      } else if (/hm|humble/i.test(sheetName)) {
        return 'Humble';
      }
    }
  }
  
  return null;
}

/**
 * Validates location financial sheet data without processing
 * @returns {Object} Validation result
 */
function validateLocationFinancialSheetData() {
  const validation = {
    isValid: false,
    validRecords: 0,
    errors: [],
    warnings: [],
    locations: [],
    dateRange: { start: null, end: null }
  };
  
  try {
    const spreadsheet = SpreadsheetApp.openById(LOCATION_FINANCIAL_SHEET_ID);
    const sheets = spreadsheet.getSheets();
    
    let allDates = [];
    
    for (const sheet of sheets) {
      const location = detectLocationFromSheetName(sheet.getName());
      
      if (location) {
        if (!validation.locations.includes(location)) {
          validation.locations.push(location);
        }
        
        try {
          const dataRange = sheet.getDataRange();
          const values = dataRange.getValues();
          
          if (values.length === 0) continue;
          
          const headerInfo = findLocationFinancialHeaders(values);
          
          if (!headerInfo.found) {
            validation.errors.push(`Sheet "${sheet.getName()}": Could not find required headers`);
            continue;
          }
          
          const columnValidation = validateRequiredFinancialColumns(headerInfo.columnMapping);
          if (!columnValidation.isValid) {
            validation.errors.push(`Sheet "${sheet.getName()}": Missing columns: ${columnValidation.missingColumns.join(', ')}`);
            continue;
          }
          
          // Validate data rows
          for (let i = headerInfo.headerRow + 1; i < values.length; i++) {
            const row = values[i];
            
            try {
              const record = transformLocationFinancialRow(row, headerInfo.columnMapping, location);
              
              if (record) {
                validation.validRecords++;
                allDates.push(new Date(record.date));
              }
              
            } catch (error) {
              validation.errors.push(`Sheet "${sheet.getName()}", Row ${i + 1}: ${error.message}`);
            }
          }
          
        } catch (error) {
          validation.errors.push(`Sheet "${sheet.getName()}": ${error.message}`);
        }
      }
    }
    
    // Calculate date range
    if (allDates.length > 0) {
      allDates.sort();
      validation.dateRange.start = formatLocationFinancialDate(allDates[0]);
      validation.dateRange.end = formatLocationFinancialDate(allDates[allDates.length - 1]);
    }
    
    validation.isValid = validation.errors.length === 0 && validation.validRecords > 0;
    
    return validation;
    
  } catch (error) {
    validation.errors.push(`Validation failed: ${error.message}`);
    return validation;
  }
}
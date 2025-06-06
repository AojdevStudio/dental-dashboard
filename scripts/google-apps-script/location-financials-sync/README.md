# 💰 Location Financial Data Sync

## Overview

A **comprehensive Google Apps Script** that synchronizes location-based financial data from Google Sheets directly to the Supabase database via the LocationFinancial API endpoints. Supports multi-location financial tracking with robust error handling, data validation, and both manual and automated synchronization capabilities.

## 🎯 **What This Does**

- **🏢 Multi-location sync** (Baytown, Humble) to LocationFinancial API automatically
- **🔄 Real-time sync** when you edit financial data in the sheet
- **⏰ Scheduled sync** daily at 6 AM
- **🎛️ GUI interface** with comprehensive menu in Google Sheets
- **📝 Complete logging** and error tracking with detailed diagnostics
- **✅ Smart column detection** (works with various financial data formats)
- **💰 Comprehensive financial data** (production, adjustments, write-offs, patient income, insurance income, unearned)
- **🔢 Automatic calculations** (net production, total collections)
- **🛡️ Data validation** with range checking and error handling

## 🚀 **Quick Setup (5 Minutes)**

### 1. **Update Configuration**

Edit `Config.gs` and set your Google Sheet ID:
```javascript
const LOCATION_FINANCIAL_SHEET_ID = 'your-actual-sheet-id-here';
```

### 2. **Deploy with clasp**

#### Option A: Using clasp (Recommended)

1. **Create new Apps Script project**:
   ```bash
   # In the location-financials-sync directory
   clasp create --type sheets --title "Location Financial Sync"
   ```

2. **Push to Google Apps Script**:
   ```bash
   clasp push
   ```

#### Option B: Manual Copy (Alternative)

1. Open your location financial Google Sheet
2. **Extensions → Apps Script**  
3. Delete the default `Code.gs` file
4. **Create new files** and copy the contents:
   - `Config.gs`, `LocationFinancialSync.gs`, `DataProcessor.gs`
   - `APIClient.gs`, `ErrorHandler.gs`, `Setup.gs`
5. **Copy `appsscript.json`** content to replace the manifest
6. **Save the project**

### 3. **Run Setup**

1. **Refresh your Google Sheet** (the custom menu should appear)
2. **💰 Location Financial Sync → 🔧 1. First Time Setup**
3. **Enter your credentials** when prompted (4 simple steps):
   - **Step 1/4**: Supabase Project URL (e.g., `https://yovbdmjwrrgardkgrenc.supabase.co`)
   - **Step 2/4**: Supabase Service Role Key 
   - **Step 3/4**: Clinic ID from your database
   - **Step 4/4**: Data Source ID (optional)
4. **Done!** The setup will automatically:
   - Test the API connection
   - Create triggers for auto-sync
   - Create a log sheet
   - Validate your data format

## 📊 **Supported Financial Data**

### **Required Fields**
- **Date**: Transaction/service date
- **Production**: Gross production amount

### **Optional Fields (with smart defaults)**
- **Adjustments**: Production adjustments
- **Write Offs**: Insurance write-offs
- **Patient Income**: Patient collections
- **Insurance Income**: Insurance collections  
- **Unearned**: Prepaid/advance payments

### **Calculated Fields (Automatic)**
- **Net Production**: Production - Adjustments - Write Offs
- **Total Collections**: Patient Income + Insurance Income

## 📋 **How It Works**

### **Automatic Column Detection**

The script automatically detects your columns with **flexible matching**:

| Data Type | Recognized Headers |
|-----------|-------------------|
| **Date** | date, transaction date, day, service date |
| **Production** | production, gross production, daily production, total production |
| **Adjustments** | adjustments, adjustment, adj, total adjustments |
| **Write Offs** | write offs, writeoffs, write-offs, insurance writeoffs |
| **Patient Income** | patient income, patient collections, patient pay, cash collections |
| **Insurance Income** | insurance income, insurance collections, insurance reimbursement |
| **Unearned** | unearned, unearned income, prepaid, advance payment |

### **Multi-Location Support**

Automatically detects and processes location-specific sheets:

- **Baytown**: Sheets named with "BT", "Baytown", "BAYTOWN"
- **Humble**: Sheets named with "HM", "Humble", "HUMBLE"
- **Pattern matching**: Works with various naming conventions

### **Smart Sync Logic**

- **Processes all location tabs** matching patterns
- **Skips empty rows** automatically
- **Handles currency formatting** ($1,234.56 → 1234.56)
- **Validates data ranges** (prevents impossible values)
- **Batches requests** for performance (100 records per batch)
- **Retry logic** for transient API failures
- **Upsert operations** (updates existing, creates new)

### **Built-in GUI Features**

Access via **💰 Location Financial Sync** menu:

#### **Core Operations**
- **🔧 1. First Time Setup** - Complete setup wizard
- **▶️ 2. Sync All Locations** - Sync all location data
- **🏢 3. Sync Baytown Only** - Baytown-specific sync
- **🏢 4. Sync Humble Only** - Humble-specific sync

#### **Validation & Testing**
- **🔍 5. Validate Data Format** - Check data without syncing
- **🧪 6. Test API Connection** - Verify credentials and connectivity

#### **View & Manage**
- **📋 View Sync Logs** - Detailed operation history
- **📈 Get Sync Statistics** - Performance and success metrics
- **🧹 Clear Old Logs** - Cleanup old log entries

#### **Advanced**
- **⏰ Setup Auto-Sync** - Configure automatic triggers
- **⏹️ Stop Auto-Sync** - Disable automatic sync
- **🔄 Reset Configuration** - Clear all settings
- **📤 Export Data Preview** - See what would be synced

## 🔧 **API Integration**

### **LocationFinancial Import Endpoint**

Integrates with: `/api/metrics/financial/locations/import`

**Request Format:**
```json
{
  "clinicId": "clinic-uuid",
  "dataSourceId": "google-sheets-location-financial-sync",
  "records": [
    {
      "date": "2024-06-05",
      "locationName": "Baytown",
      "production": 1234.56,
      "adjustments": 100.00,
      "writeOffs": 50.00,
      "patientIncome": 800.00,
      "insuranceIncome": 400.00,
      "unearned": null
    }
  ],
  "upsert": true,
  "dryRun": false
}
```

**Response Handling:**
- **Success**: Processes API response, logs results
- **Validation Errors**: Shows specific field issues
- **Rate Limiting**: Automatic retry with exponential backoff
- **Network Errors**: Comprehensive error reporting

### **Enhanced Error Handling**

- **API response validation** with detailed error messages
- **Retry logic** for transient failures (max 3 attempts)
- **Batch processing** to handle API limits
- **Comprehensive logging** with operation context
- **User-friendly notifications** for common issues

## 📊 **Database Integration**

Your data syncs to the `location_financial` table:

```sql
location_financial (
    id                  TEXT PRIMARY KEY,     -- Auto-generated
    clinic_id          TEXT NOT NULL,        -- Your clinic
    location_id        TEXT NOT NULL,        -- Location reference
    date               DATE NOT NULL,        -- 2024-06-05
    production         DECIMAL(10,2),        -- 1234.56
    adjustments        DECIMAL(10,2),        -- 100.00
    write_offs         DECIMAL(10,2),        -- 50.00
    net_production     DECIMAL(10,2),        -- 1084.56 (calculated)
    patient_income     DECIMAL(10,2),        -- 800.00
    insurance_income   DECIMAL(10,2),        -- 400.00
    total_collections  DECIMAL(10,2),        -- 1200.00 (calculated)
    unearned          DECIMAL(10,2),         -- NULL (optional)
    data_source_id    TEXT,                  -- Source tracking
    created_at        TIMESTAMPTZ,
    updated_at        TIMESTAMPTZ
)
```

**Key Features:**
- **Unique constraint** on clinic_id + location_id + date (prevents duplicates)
- **Calculated fields** automatically computed
- **Foreign key relationships** to clinic and location tables
- **Audit trail** with created/updated timestamps

## 🔍 **Data Validation**

### **Pre-Sync Validation**
- **Required field checking**: Date and Production must be present
- **Data type validation**: Dates, numbers properly formatted
- **Range validation**: Financial amounts within reasonable bounds
- **Location validation**: Sheet names match location patterns
- **Duplicate detection**: Prevents duplicate date/location combinations

### **Validation Rules**
```javascript
FINANCIAL_VALIDATION_RULES = {
  MIN_PRODUCTION: 0,           // Minimum production
  MAX_PRODUCTION: 100000,      // Maximum production (safety)
  MIN_ADJUSTMENT: -50000,      // Adjustments can be negative
  MAX_ADJUSTMENT: 50000,       // Maximum adjustment
  MIN_INCOME: 0,               // Income should be positive
  MAX_INCOME: 100000          // Maximum income
}
```

### **Error Reporting**
- **Row-level errors**: Specific issues with data validation
- **Sheet-level errors**: Missing headers, format problems
- **API errors**: Connection, authentication, server issues
- **User-friendly messages**: Clear explanations and solutions

## 🔒 **Security & Privacy**

### **Credential Management**
- **Service Role Key** stored securely in Google Apps Script properties
- **No sensitive data** in logs or visible outputs
- **Encrypted transmission** via HTTPS
- **Limited scope** permissions for Google Apps Script

### **Data Protection**
- **Row Level Security** enforced at Supabase level
- **Clinic isolation** ensures data separation
- **Audit logging** tracks all operations
- **No data storage** in Google Apps Script (processed in memory)

### **Access Control**
- **Script permissions** limited to spreadsheet and external requests
- **User authentication** via Google account
- **API authentication** via Supabase service role key

## 📈 **Performance & Reliability**

### **Batch Processing**
- **100 records per batch** to optimize performance
- **Automatic batching** for large datasets
- **Progress tracking** across batches
- **Partial failure handling** (some batches can succeed)

### **Error Recovery**
- **Exponential backoff** for rate limiting
- **Automatic retries** for transient failures
- **Detailed error logging** for troubleshooting
- **Graceful degradation** (continues processing after errors)

### **Monitoring**
- **Sync statistics** showing success rates and performance
- **Operation logging** with timestamps and duration
- **Error tracking** with categorization and context
- **Performance metrics** for optimization

## 🔧 **Troubleshooting**

### **Setup Issues**

1. **"Sheet ID not configured"**
   - Edit `Config.gs` and set your actual Google Sheet ID

2. **"Connection failed"**  
   - Check your Supabase URL format (`https://project.supabase.co`)
   - Verify your Service Role Key is correct
   - Ensure the LocationFinancial API endpoint exists

3. **"No credentials found"**
   - Run "🔧 1. First Time Setup" to enter credentials

### **Sync Issues**

1. **"No date column found"**
   - Check your sheet has a recognized date column header
   - Verify the header row is in the first 10 rows

2. **"Location not detected"**
   - Ensure sheet names contain "BT"/"Baytown" or "HM"/"Humble"
   - Check the `LOCATION_TAB_PATTERNS` in Config.gs

3. **"Rows not syncing"**
   - Check **📋 View Sync Logs** for detailed error information
   - Ensure rows have valid date values
   - Verify financial amounts are within valid ranges

4. **"API errors"**
   - Use **🧪 6. Test API Connection** to verify connectivity
   - Check Supabase project status and quotas
   - Verify clinic ID exists in database

### **Debugging Tools**

- **🔍 5. Validate Data Format** - Check data without syncing
- **📋 View Sync Logs** - Detailed operation history
- **📈 Get Sync Statistics** - Performance metrics
- **📤 Export Data Preview** - See exactly what would be synced
- **🧪 6. Test API Connection** - Verify API accessibility

## 💡 **Pro Tips**

1. **Test with validation first** - Use "🔍 5. Validate Data Format" before syncing
2. **Check logs regularly** - "📋 View Sync Logs" shows what's happening
3. **Monitor statistics** - "📈 Get Sync Statistics" shows sync health
4. **Use data preview** - "📤 Export Data Preview" shows transformed data
5. **Test API connection** - "🧪 6. Test API Connection" for troubleshooting

## 🛠️ **Extending for Other Locations**

To add support for additional locations:

1. **Update `LOCATION_MAP`** in Config.gs:
   ```javascript
   const LOCATION_MAP = {
     'BT': 'Baytown',
     'HM': 'Humble',
     'KT': 'Katy',        // New location
     'SU': 'Sugar Land'   // New location
   };
   ```

2. **Add patterns** to `LOCATION_TAB_PATTERNS`:
   ```javascript
   /^(KT|Katy|KATY)\s*-?\s*.*$/i,     // Katy patterns
   /^(SU|Sugar|SUGAR)\s*-?\s*.*$/i    // Sugar Land patterns
   ```

3. **Update detection logic** in `detectLocationFromSheetName()`

## 📞 **Support**

### **Common Solutions**
- **Reset everything**: Use "🔄 Reset Configuration" and start over
- **Clear logs**: Use "🧹 Clear Old Logs" if sheet becomes slow
- **Re-run setup**: Delete stored credentials and run setup again

### **Getting Help**
- Check the sync logs for detailed error information
- Use the validation tools to identify data issues
- Test API connection to verify credentials and connectivity
- Review the troubleshooting section above

---

## 🎉 **You're Ready!**

Once setup is complete, your location financial data will sync automatically to the dashboard database. The comprehensive menu system gives you full control, and the logging system keeps you informed of all operations.

**This provides the robust, enterprise-grade financial data synchronization you need!**
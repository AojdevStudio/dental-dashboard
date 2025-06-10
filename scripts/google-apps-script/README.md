# 🦷 Hygiene Production Sync

## Overview

A **simple, GUI-based Google Apps Script** that syncs hygiene production data from Google Sheets directly to Supabase. No complex OAuth flows or API complications - just straightforward sync with a user-friendly interface.

## 🎯 **What This Does**

- **📊 Syncs all month tabs** (Dec-23, Jan-24, etc.) to Supabase automatically
- **🔄 Real-time sync** when you edit the sheet
- **⏰ Scheduled sync** every 6 hours
- **🎛️ GUI interface** with custom menu in Google Sheets
- **📝 Complete logging** and error tracking
- **🆔 Auto-generates UUIDs** for missing records
- **✅ Smart column detection** (works with your existing headers)
- **👤 Provider name extraction** from spreadsheet names (e.g., "Adriane" from "Hygiene Production Tracker - Adriane - Dec-23")

## 🚀 **5-Minute Setup**

### 1. **Update Configuration**

Edit `config.gs` and set your Google Sheet ID:
```javascript
const HYGIENE_SHEET_ID = 'your-actual-sheet-id-here';
```

### 2. **Deploy with clasp**

#### Option A: Using clasp (Recommended)

1. **Create new Apps Script project**:
   ```bash
   # In the hygiene-sync directory
   clasp create --type sheets --title "Hygiene Production Sync"
   ```

2. **Update appsscript.json** with your script ID:
   ```json
   {
     "scriptId": "your-actual-script-id-here",
     ...
   }
   ```

3. **Copy the manifest**:
   ```bash
   cp appsscript-manifest.json appsscript.json
   ```

4. **Push to Google Apps Script**:
   ```bash
   clasp push
   ```

#### Option B: Manual Copy (Alternative)

1. Open your hygiene Google Sheet
2. **Extensions → Apps Script**  
3. Delete the default `Code.gs` file
4. **Create new files** and copy the contents:
   - `config.gs`, `main.gs`, `credentials.gs`, `setup.gs`
   - `mapping.gs`, `sync.gs`, `triggers.gs`, `logging.gs`, `utils.gs`
5. **Copy `appsscript-manifest.json`** content to replace the manifest
6. **Save the project**

### 3. **Run Setup**

1. **Refresh your Google Sheet** (the custom menu should appear)
2. **🦷 Hygiene Sync → 🔧 1. First Time Setup**
3. **Enter your credentials** when prompted (3 simple steps):
   - **Step 1/3**: Supabase Project URL (e.g., `https://abc123.supabase.co`)
   - **Step 2/3**: Supabase Service Role Key 
   - **Step 3/3**: Clinic ID from your database
4. **Done!** The setup will automatically:
   - Test the connection
   - Create triggers for auto-sync
   - Seed missing UUIDs
   - Create a log sheet
   - Extract provider name from spreadsheet title

## 📋 **How It Works**

### **Automatic Column Detection**

The script automatically detects your columns with **exact matching** to avoid conflicts:
- **Date**: "date" 
- **Hours Worked**: "hours worked" (exact match to avoid "Average Hours worked")
- **Estimated Production**: "estimated production"
- **Verified Production**: "verified production"
- **Production Goal**: "production goal" (exact match to avoid "Over/Under Production Goal")
- **Variance**: "variance" (exact match)
- **Bonus**: "bonus" (exact match)
- **UUID**: "uuid"

### **Provider Name Extraction**

The script automatically extracts provider names from spreadsheet titles:
- **"Hygiene Production Tracker - Adriane - Dec-23"** → **"Adriane"**
- **"Dr. Smith Hygiene Data"** → **"Smith"**
- **"Hygiene Dashboard - Jennifer"** → **"Jennifer"**

All records include the provider name automatically - no manual setup required!

### **Smart Sync Logic**

- **Processes all month tabs** matching patterns like `Dec-23`, `Jan-24`
- **Skips empty rows** automatically
- **Handles currency formatting** ($1,234.56 → 1234.56)
- **Calculates variance percentage** if not provided
- **Generates UUIDs** for tracking
- **Batches requests** for performance

### **Built-in GUI Features**

Access via **🦷 Hygiene Sync** menu:
- **🔧 1. First Time Setup** - Complete setup wizard
- **▶️ 2. Sync All Data Now** - Sync all month tabs  
- **🔍 3. Test Connection** - Verify Supabase connection
- **🧪 4. Test Provider Name** - Preview provider name extraction
- **🔍 5. Test Column Mapping** - Debug column detection
- **📊 View & Manage** - Statistics, logs, backups
- **⚙️ Advanced** - UUID seeding, validation, exports

## 📊 **Database Structure**

Your data syncs to the `hygiene_production` table:

```sql
hygiene_production (
    id                   TEXT PRIMARY KEY,  -- UUID from sheet
    clinic_id           TEXT,              -- Your clinic
    date                DATE,              -- 2023-12-04
    month_tab           TEXT,              -- "Dec-23"
    hours_worked        DECIMAL(4,2),      -- 5.49
    estimated_production DECIMAL(10,2),     -- 384.86
    verified_production  DECIMAL(10,2),     -- 177.12
    production_goal     DECIMAL(10,2),     -- 779.03
    variance_percentage DECIMAL(5,2),      -- -77.26
    bonus_amount        DECIMAL(8,2),      -- 0.00
    provider_name       TEXT,              -- "Adriane" (auto-extracted)
    created_at          TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ
)
```

## 🔧 **Troubleshooting**

### **Setup Issues**

1. **"HYGIENE_SHEET_ID not configured"**
   - Edit `config.gs` and set your actual Google Sheet ID

2. **"Connection failed"**  
   - Check your Supabase URL format (`https://project.supabase.co`)
   - Verify your Service Role Key is correct
   - Ensure the `hygiene_production` table exists

3. **"No credentials found"**
   - Run "1. 🔧 Setup Sync" to enter credentials

### **Sync Issues**

1. **"No date column found"**
   - Check your sheet has a "Date" column header
   - Verify the header row is in the first 5 rows

2. **"Rows not syncing"**
   - Check **🛠️ Utilities → View Sync Logs** for details
   - Ensure rows have date values
   - Verify clinic ID exists in your database

3. **"Triggers not working"**
   - Run **🛠️ Utilities → Check Trigger Status**
   - Re-run setup if triggers are missing

### **Debugging Tools**

- **🧪 4. Test Provider Name** - Preview what provider name will be extracted
- **🔍 5. Test Column Mapping** - See exactly which columns are detected
- **📋 View Sync Logs** - See detailed sync history in the "Hygiene-Sync-Log" tab
- **📊 Get Sync Statistics** - View synced data summary
- **💾 Create Data Backup** - Backup before major changes

## 🔒 **Security Notes**

- **Service Role Key** is stored securely in Google Apps Script properties
- **Row Level Security** enforced at Supabase level
- **Clinic isolation** ensures you only see your data
- **Audit logging** tracks all sync operations

## 📈 **What You Get**

### **Immediate Benefits:**
- ✅ **Real-time data sync** - Edit sheet, data syncs automatically
- ✅ **Reliable backups** - All data safely stored in Supabase
- ✅ **No manual exports** - Forget CSV downloads and uploads
- ✅ **Error tracking** - Know immediately if something breaks

### **Long-term Value:**
- 📊 **Dashboard integration** - Data ready for analytics
- 🔄 **Multi-user sync** - Team edits sync automatically  
- 📈 **Historical tracking** - Complete audit trail
- 🎯 **Goal monitoring** - Track performance automatically

## 💡 **Pro Tips**

1. **Test with one month tab first** - Use "📝 Sync Current Sheet Only"
2. **Check logs regularly** - "📋 View Sync Logs" shows what's happening
3. **Backup before major changes** - "💾 Create Data Backup" 
4. **Use the debug tools** - "🔍 Debug Sheet Headers" shows column mapping
5. **Monitor statistics** - "📊 Get Sync Statistics" shows sync health

## 🛠️ **Extending to Other Sheets**

To add more tracking sheets (provider production, patient metrics, etc.):

1. **Copy this folder** and rename (e.g., `provider-sync`)
2. **Update `config.gs`** with new sheet ID and table name
3. **Modify `mapping.gs`** for new column structure
4. **Deploy to the new sheet**

Each sheet type gets its own dedicated sync script.

---

## 🎉 **You're Done!**

Once setup is complete, your hygiene data will sync automatically. The custom menu gives you full control, and the logging system keeps you informed of what's happening.

**This is exactly the simple, reliable solution you needed!**
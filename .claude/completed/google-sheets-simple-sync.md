# Simple Google Sheets → Supabase Sync

## 🎯 **The Simple Way (What You Actually Need)**

Instead of complex OAuth/API integration, this uses **Google Apps Script** to directly sync your sheets to Supabase.

**Flow:** `Google Sheet → Apps Script → Supabase Database`

## 📋 **Setup Steps (5 minutes)**

### 1. **Apply Database Migration**

Run this to create the hygiene_production table:

```bash
# Apply the new migration
pnpm exec supabase db push

# Or manually run the SQL file
psql -h your-db-host -d your-db -f supabase/migrations/20250529100000_create_hygiene_production_table.sql
```

### 2. **Add Apps Script to Your Google Sheet**

1. Open your hygiene tracker Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete the default code
4. Copy/paste the entire contents of `scripts/google-apps-script/hygiene-sync.js`
5. Save the project (name it "Hygiene Sync")

### 3. **Configure Script Properties**

In Apps Script, go to **Project Settings → Script Properties** and add:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your_anon_key_here
CLINIC_ID = your_clinic_id_here
```

### 4. **Test & Setup Triggers**

In Apps Script:

1. Run `testConfiguration()` to verify setup
2. Run `setupTriggers()` to enable auto-sync
3. Run `syncAllHygieneData()` to sync all existing data

## ✅ **What This Gives You**

### **Automatic Sync:**
- **Real-time:** Syncs when you edit the sheet
- **Daily:** Full sync every day at 6 AM
- **Manual:** Run `syncAllHygieneData()` anytime

### **Smart Processing:**
- ✅ Handles all month tabs (Dec-23, Jan-24, etc.)
- ✅ Cleans currency formatting ($1,234.56 → 1234.56)
- ✅ Calculates variance percentage
- ✅ Uses existing UUIDs or generates new ones
- ✅ Skips empty rows automatically

### **Database Structure:**

```sql
hygiene_production (
    id,                    -- UUID from your sheet
    clinic_id,            -- Your clinic
    date,                 -- 2023-12-04
    month_tab,            -- "Dec-23"
    hours_worked,         -- 5.49
    estimated_production, -- 384.86
    verified_production,  -- 177.12
    production_goal,      -- 779.03
    variance_percentage,  -- -77.26
    bonus_amount         -- 0.00
)
```

## 🔍 **Testing Your Data**

Query your synced data in Supabase:

```sql
-- View recent hygiene data
SELECT * FROM hygiene_production 
ORDER BY date DESC 
LIMIT 10;

-- Monthly summary
SELECT 
    month_tab,
    COUNT(*) as days_worked,
    SUM(hours_worked) as total_hours,
    SUM(verified_production) as total_production,
    AVG(variance_percentage) as avg_variance
FROM hygiene_production 
GROUP BY month_tab 
ORDER BY month_tab DESC;

-- Use the summary view
SELECT * FROM hygiene_production_summary 
WHERE goal_status = 'Met'
ORDER BY date DESC;
```

## 🚀 **Scaling to Other Sheets**

For additional tracking sheets (provider production, patient metrics, etc.):

1. **Share the CSV** of the new sheet
2. **Create matching table** (5 min SQL)
3. **Copy/modify the Apps Script** (5 min)
4. **Done!**

Each sheet gets its own simple script and table.

## 🛠️ **Troubleshooting**

### **Script Not Syncing?**
- Check Script Properties are set correctly
- Look at Apps Script logs (Executions tab)
- Verify Supabase URL/key in browser Network tab

### **Data Not Appearing?**
- Check RLS policies (clinic_id must match)
- Verify date formatting in your sheet
- Look at Supabase logs

### **Permission Errors?**
- Make sure anon key has proper permissions
- Check that clinic_id exists in your clinics table

## 💡 **Benefits of This Approach**

✅ **Simple** - No OAuth complexity  
✅ **Real-time** - Syncs on every edit  
✅ **Reliable** - Direct database writes  
✅ **Scalable** - Easy to add more sheets  
✅ **Familiar** - Uses your existing Google Sheets  

This is **exactly** what you needed - simple, direct, and it works with your actual data structure!
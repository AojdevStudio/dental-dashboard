# 🔄 Multi-Clinic Migration Guide

## Overview

The Location Financial Sync script has been upgraded to support **separate clinic IDs** for Baytown and Humble locations. This provides better data isolation and follows the proper multi-tenant architecture.

## What Changed

### **Before (Single Clinic)**
- ❌ One clinic ID for all locations
- ❌ Mixed data in single clinic database
- ❌ Manual location differentiation required

### **After (Multi-Clinic)**
- ✅ Separate clinic ID for each location
- ✅ Isolated data per clinic
- ✅ Automatic clinic selection based on sheet names
- ✅ Better data security and organization

## Migration Steps

### **Step 1: Reset Current Configuration**
1. Open your Google Sheet with financial data
2. Go to **💰 Location Financial Sync → 🔄 Reset Configuration**
3. Confirm when prompted
4. This clears all stored credentials

### **Step 2: Get Your Clinic IDs**
You'll need both clinic IDs from your database:
- **Baytown Clinic ID**: `cmbk373hc0000i2uk8pel5elu`
- **Humble Clinic ID**: `cmbk373qi0001i2ukewr01bvz`

### **Step 3: Run New Setup**
1. Go to **💰 Location Financial Sync → 🔧 1. First Time Setup**
2. Enter credentials in the **6-step process**:
   - **Step 1/6**: Supabase Project URL (same as before)
   - **Step 2/6**: Supabase Service Role Key (same as before)
   - **Step 3/6**: **Baytown Clinic ID** → `cmbk373hc0000i2uk8pel5elu`
   - **Step 4/6**: **Humble Clinic ID** → `cmbk373qi0001i2ukewr01bvz`
   - **Step 5/6**: Data Source ID (optional, same as before)
3. The system will test **both clinic connections**
4. Setup auto-sync triggers when prompted

### **Step 4: Verify Migration**
1. Use **🧪 6. Test API Connection** to verify both clinics work
2. Run **🔍 5. Validate Data Format** to check your data
3. Test sync with **▶️ 2. Sync All Locations**
4. Check **📋 View Sync Logs** to confirm success

## What to Expect

### **During Sync**
- **Baytown sheets** (BT-*, Baytown-*, etc.) → Sync to Baytown clinic
- **Humble sheets** (HM-*, Humble-*, etc.) → Sync to Humble clinic
- **Automatic detection** - no manual intervention needed
- **Separate database entries** for each clinic

### **In the Logs**
You'll now see entries like:
```
✅ Sending 25 records for Baytown to API (Clinic: cmbk373hc0000i2uk8pel5elu)
✅ Sending 30 records for Humble to API (Clinic: cmbk373qi0001i2ukewr01bvz)
```

### **In the Database**
- **Baytown data** appears in KamDental Baytown clinic
- **Humble data** appears in KamDental Humble clinic
- **No data mixing** between clinics
- **Proper data isolation** maintained

## Troubleshooting

### **"Connection Failed for Baytown"**
- Double-check Baytown clinic ID: `cmbk373hc0000i2uk8pel5elu`
- Verify clinic exists in database
- Check Supabase permissions

### **"Connection Failed for Humble"**
- Double-check Humble clinic ID: `cmbk373qi0001i2ukewr01bvz`
- Verify clinic exists in database
- Check Supabase permissions

### **"Location not detected"**
- Ensure sheet names contain "Baytown", "BT", "Humble", or "HM"
- Check the location patterns in Config.gs
- Verify sheet naming conventions

### **"Mixed data syncing to wrong clinic"**
- Check sheet names match location patterns
- Review sync logs for clinic ID assignment
- Ensure location detection is working correctly

### **"Permissions not sufficient for ScriptApp.getProjectTriggers"**
- The updated script requires additional permissions
- **Solution**: Re-run setup to trigger re-authorization
- Or go to **Extensions → Apps Script** and grant permissions
- The updated `appsscript.json` includes required scopes

## Benefits After Migration

1. **🔒 Data Security**: Each clinic's data is properly isolated
2. **📊 Better Reporting**: Clinic-specific dashboards and metrics
3. **🎯 Accurate Analytics**: Location-based insights without data mixing
4. **🚀 Scalability**: Easy to add more locations/clinics in future
5. **🛡️ Compliance**: Proper multi-tenant data architecture

## Support

If you encounter issues during migration:

1. **Check the logs**: **📋 View Sync Logs** for detailed error information
2. **Test connections**: **🧪 6. Test API Connection** verifies both clinics
3. **Validate data**: **🔍 5. Validate Data Format** checks sheet structure
4. **Reset if needed**: **🔄 Reset Configuration** and start over

## Summary

The migration ensures your financial data is properly organized by clinic, providing better security, reporting, and scalability. The setup process is slightly longer (6 steps vs 4), but the automatic clinic detection makes ongoing usage seamless.

**Your sheet naming and data structure remain unchanged** - only the backend clinic assignment has been improved! 🎉
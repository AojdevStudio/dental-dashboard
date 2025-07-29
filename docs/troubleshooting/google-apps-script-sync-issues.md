# Google Apps Script Sync Issues - Troubleshooting Guide

## Critical Issue: Database Reseeding Changes Clinic IDs

### Problem
After database reseeding, Google Apps Script sync returns 500 errors with message:
```
"Database error: JSON object requested, multiple (or no) rows returned"
"code":"PGRST116","details":"The result contains 0 rows"
```

### Root Cause
**Database reseeding generates new clinic IDs**, but Google Apps Script properties still contain the old clinic IDs.

### Symptoms
- Sync functions return 500 errors instead of 200
- Error occurs during clinic lookup in edge function
- No data is synced despite correct payload structure

### Quick Diagnosis
1. Check current clinic IDs in database:
   ```sql
   SELECT id, name FROM clinics ORDER BY name;
   ```

2. Compare with Google Apps Script stored properties:
   - Check `LOCATION_FINANCIAL_BAYTOWN_CLINIC_ID` property
   - Check `LOCATION_FINANCIAL_HUMBLE_CLINIC_ID` property

### Solution
Update Google Apps Script properties with current clinic IDs:

1. **Get current clinic IDs from database:**
   ```sql
   SELECT id, name FROM clinics WHERE name IN ('KamDental Baytown', 'KamDental Humble');
   ```

2. **Update Google Apps Script properties:**
   - Open Google Apps Script project
   - Go to Properties Service settings
   - Update `LOCATION_FINANCIAL_BAYTOWN_CLINIC_ID` with current Baytown ID
   - Update `LOCATION_FINANCIAL_HUMBLE_CLINIC_ID` with current Humble ID

3. **Or run setup wizard again:**
   - Use "Reset Configuration" from the Advanced menu
   - Run the setup wizard with new clinic IDs

### Prevention
- **Always update Google Apps Script clinic IDs after database reseeding**
- Consider using clinic names instead of IDs for more stability
- Document when reseeding occurs and include GAS update in the process

## Debugging Steps for Future 500 Errors

### Step 1: Validate Basic Data Relationships
```sql
-- Check if clinic exists
SELECT id, name FROM clinics WHERE id = 'YOUR_CLINIC_ID';

-- Check if locations exist for clinic
SELECT id, name, clinic_id FROM locations WHERE clinic_id = 'YOUR_CLINIC_ID';
```

### Step 2: Test Edge Function with Simple Payload
```javascript
// Use this test payload to isolate the issue
{
  "clinicId": "CURRENT_CLINIC_ID",
  "dataSourceId": "test-connection",
  "records": [{
    "date": "2024-01-15",
    "locationName": "Baytown",
    "production": 100.00,
    "adjustments": 0,
    "writeOffs": 0,
    "patientIncome": 50.00,
    "insuranceIncome": 50.00,
    "unearned": 0
  }],
  "dryRun": true
}
```

### Step 3: Check Edge Function Logs
```bash
# Get recent edge function logs
supabase functions logs location-financial-import --project-ref yovbdmjwrrgardkgrenc
```

### Step 4: Validate Payload Structure
Only after confirming basic data relationships, check:
- Required fields present
- Data types correct
- Metadata completeness

## Common Mistakes in Debugging

### ❌ What NOT to do:
- Assume payload structure is the issue without validating data relationships
- Focus on complex metadata before checking basic IDs
- Make multiple changes without testing each one
- Skip validation of database state

### ✅ What TO do:
- Start with the simplest possible test
- Validate database state first
- Test one change at a time
- Use dry-run mode for testing
- Check logs systematically

## Quick Reference: Current Clinic IDs

After database reseeding, current clinic IDs are:
- **Baytown**: `cmc3jcrs20001i2ht5sn89v66`
- **Humble**: `cmc3jcrhe0000i2ht9ymqtmzb`

*Note: These IDs change with each database reseed. Always verify current IDs before troubleshooting.*

## Test Script for Validation

Use this script to quickly test edge function with current clinic IDs:

```javascript
// File: test-gas-sync.js
const SUPABASE_URL = 'https://yovbdmjwrrgardkgrenc.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/location-financial-import`;

async function testSync(clinicId, locationName) {
  const payload = {
    clinicId: clinicId,
    dataSourceId: `test-${Date.now()}`,
    records: [{
      date: '2024-01-15',
      locationName: locationName,
      production: 1500.00,
      adjustments: 50.00,
      writeOffs: 25.00,
      patientIncome: 750.00,
      insuranceIncome: 675.00,
      unearned: 0
    }],
    dryRun: true
  };

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log(`${locationName}: ${response.status}`);
  return response.status === 200;
}

// Test both locations
testSync('cmc3jcrs20001i2ht5sn89v66', 'Baytown');
testSync('cmc3jcrhe0000i2ht9ymqtmzb', 'Humble');
```
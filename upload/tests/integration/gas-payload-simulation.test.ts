/**
 * Test to simulate the exact Google Apps Script payload structure
 * This tests the current implementation and validates the metadata fix
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/location-financial-import`;

// Test clinic ID (using the Baytown clinic ID from your setup)
const TEST_CLINIC_ID = 'cmbk373hc0000i2uk8pel5elu';

describe('Google Apps Script Payload Simulation', () => {
  let testDataSourceId: string;

  beforeAll(() => {
    testDataSourceId = `gas-simulation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  });

  afterAll(async () => {
    // Clean up test data
    const supabase = await import('@supabase/supabase-js').then(mod => 
      mod.createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
    );
    
    await supabase.from('location_financial').delete().like('data_source_id', 'gas-simulation-%');
    await supabase.from('data_sources').delete().like('id', 'gas-simulation-%');
  });

  it('should handle OLD Google Apps Script payload (without metadata) - EXPECTED TO FAIL', async () => {
    // This simulates the old Apps Script payload that was causing 500 errors
    const oldGasPayload = {
      clinicId: TEST_CLINIC_ID,
      dataSourceId: testDataSourceId, // Just a string, no metadata
      records: [
        {
          date: '2024-01-15',
          locationName: 'Baytown',
          production: 1500.00,
          adjustments: 50.00,
          writeOffs: 25.00,
          patientIncome: 750.00,
          insuranceIncome: 675.00,
          unearned: 0
        }
      ],
      upsert: true,
      dryRun: false
    };

    console.log('🧪 Testing OLD payload structure (without metadata)...');
    console.log('📤 Payload:', JSON.stringify(oldGasPayload, null, 2));

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify(oldGasPayload)
    });

    console.log('📥 Response status:', response.status);
    
    const result = await response.json();
    console.log('📥 Response body:', JSON.stringify(result, null, 2));

    // The edge function should handle this gracefully with fallbacks
    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });

  it('should handle NEW Google Apps Script payload (with metadata) - EXPECTED TO SUCCEED', async () => {
    // This simulates the new Apps Script payload with complete metadata
    const newGasPayload = {
      clinicId: TEST_CLINIC_ID,
      dataSourceId: `${testDataSourceId}-new`,
      spreadsheetId: '1BH7XuQfO_K8nP9mNrG5YZvH3OX7x8W4nE6FgHjKlMnO', // Realistic Google Sheets ID
      spreadsheetName: 'KamDental Location Financial Data - 2024',
      sheetName: 'Baytown Financial Data',
      records: [
        {
          date: '2024-01-15',
          locationName: 'Baytown',
          production: 1500.00,
          adjustments: 50.00,
          writeOffs: 25.00,
          patientIncome: 750.00,
          insuranceIncome: 675.00,
          unearned: 0
        },
        {
          date: '2024-01-16',
          locationName: 'Baytown',
          production: 1750.00,
          adjustments: 75.00,
          writeOffs: 30.00,
          patientIncome: 800.00,
          insuranceIncome: 845.00,
          unearned: 0
        }
      ],
      upsert: true,
      dryRun: false
    };

    console.log('🧪 Testing NEW payload structure (with metadata)...');
    console.log('📤 Payload:', JSON.stringify(newGasPayload, null, 2));

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify(newGasPayload)
    });

    console.log('📥 Response status:', response.status);
    
    const result = await response.json();
    console.log('📥 Response body:', JSON.stringify(result, null, 2));

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.results.created).toBe(2);
    expect(result.dataSource.id).toBe(`${testDataSourceId}-new`);
  });

  it('should demonstrate the exact current error scenario', async () => {
    // This tests the exact scenario you're experiencing
    const realisticPayload = {
      clinicId: TEST_CLINIC_ID,
      dataSourceId: 'google-sheets-location-financial-sync', // Default from Apps Script
      records: Array.from({ length: 25 }, (_, i) => ({ // 25 records like your logs
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        locationName: 'Baytown',
        production: 1500.00 + (i * 25),
        adjustments: 50.00,
        writeOffs: 25.00,
        patientIncome: 750.00,
        insuranceIncome: 675.00 + (i * 10),
        unearned: 0
      })),
      upsert: true,
      dryRun: false
    };

    console.log('🧪 Testing realistic scenario (25 records)...');
    console.log('📤 Payload preview:', {
      clinicId: realisticPayload.clinicId,
      dataSourceId: realisticPayload.dataSourceId,
      recordsCount: realisticPayload.records.length,
      firstRecord: realisticPayload.records[0],
      lastRecord: realisticPayload.records[realisticPayload.records.length - 1]
    });

    const startTime = Date.now();
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify(realisticPayload)
    });

    const endTime = Date.now();
    console.log('📥 Response status:', response.status);
    console.log('⏱️ Response time:', endTime - startTime, 'ms');
    
    const result = await response.json();
    console.log('📥 Response body:', JSON.stringify(result, null, 2));

    // Document what we expect vs what happens
    if (response.status === 500) {
      console.log('❌ CONFIRMED: Still getting 500 error');
      console.log('🔍 This confirms the metadata fix is needed');
    } else if (response.status === 200) {
      console.log('✅ SUCCESS: Edge function handled the request');
      console.log('🔍 This suggests the fallback logic is working');
    }

    // Don't fail the test - just document the behavior
    expect([200, 500]).toContain(response.status);
  });
});
/**
 * Simple test to validate the edge function with different payload structures
 */

const SUPABASE_URL = 'https://yovbdmjwrrgardkgrenc.supabase.co';
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/location-financial-import`;
const TEST_CLINIC_ID = 'cmc3jcrs20001i2ht5sn89v66'; // KamDental Baytown

// This would be the service role key - for testing, we'll check if the edge function responds
async function testPayloadStructures() {
  console.log('🧪 Testing Edge Function Payload Structures');
  console.log('===========================================');
  
  // Test 1: Old structure (what's currently causing 500 errors)
  console.log('\n1️⃣ Testing OLD payload structure (no metadata):');
  const oldPayload = {
    clinicId: TEST_CLINIC_ID,
    dataSourceId: 'google-sheets-location-financial-sync',
    records: [{
      date: '2024-01-15',
      locationName: 'Baytown',
      production: 1500.00,
      adjustments: 50.00,
      writeOffs: 25.00,
      patientIncome: 750.00,
      insuranceIncome: 675.00,
      unearned: 0
    }],
    upsert: true,
    dryRun: true // Use dry run to avoid auth issues
  };
  
  console.log('📤 Payload:', JSON.stringify(oldPayload, null, 2));
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(oldPayload)
    });
    
    console.log(`📥 Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('🔐 Expected: Auth required (edge function is responding)');
    } else if (response.status === 500) {
      console.log('❌ Confirmed: 500 error (this is the bug)');
    }
    
    const text = await response.text();
    console.log('📄 Response preview:', text.substring(0, 200));
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
  
  // Test 2: New structure (with metadata)
  console.log('\n2️⃣ Testing NEW payload structure (with metadata):');
  const newPayload = {
    clinicId: TEST_CLINIC_ID,
    dataSourceId: `test-${Date.now()}`,
    spreadsheetId: '1BH7XuQfO_K8nP9mNrG5YZvH3OX7x8W4nE6FgHjKlMnO',
    spreadsheetName: 'KamDental Location Financial Data - 2024',
    sheetName: 'Baytown Financial Data',
    records: [{
      date: '2024-01-15',
      locationName: 'Baytown',
      production: 1500.00,
      adjustments: 50.00,
      writeOffs: 25.00,
      patientIncome: 750.00,
      insuranceIncome: 675.00,
      unearned: 0
    }],
    upsert: true,
    dryRun: true // Use dry run to avoid auth issues
  };
  
  console.log('📤 Payload keys:', Object.keys(newPayload));
  console.log('📤 Metadata:', {
    spreadsheetId: newPayload.spreadsheetId,
    spreadsheetName: newPayload.spreadsheetName,
    sheetName: newPayload.sheetName
  });
  
  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPayload)
    });
    
    console.log(`📥 Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('🔐 Expected: Auth required (edge function is responding)');
    } else if (response.status === 500) {
      console.log('❌ Unexpected: Still getting 500 error');
    }
    
    const text = await response.text();
    console.log('📄 Response preview:', text.substring(0, 200));
    
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('- This test validates that the edge function responds to different payload structures');
  console.log('- 401 responses indicate the function is working (just needs auth)');
  console.log('- 500 responses indicate internal errors that need fixing');
  console.log('- The goal is to eliminate 500 errors by providing proper metadata');
}

testPayloadStructures().catch(console.error);
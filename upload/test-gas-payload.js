/**
 * Simple Node.js script to test Google Apps Script payload interaction with Edge Function
 * This simulates the exact scenario you're experiencing
 */

const SUPABASE_URL = 'https://yovbdmjwrrgardkgrenc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/location-financial-import`;
const TEST_CLINIC_ID = 'cmbk373hc0000i2uk8pel5elu'; // Your Baytown clinic ID

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

async function testOldPayload() {
  console.log('\n🧪 TESTING OLD PAYLOAD (without metadata)');
  console.log('===============================================');
  
  const oldPayload = {
    clinicId: TEST_CLINIC_ID,
    dataSourceId: 'google-sheets-location-financial-sync',
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

  console.log('📤 Payload Structure:');
  console.log(JSON.stringify(oldPayload, null, 2));

  try {
    const startTime = Date.now();
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify(oldPayload)
    });

    const endTime = Date.now();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`⏱️ Response Time: ${endTime - startTime}ms`);
    
    const result = await response.json();
    console.log('📥 Response Body:');
    console.log(JSON.stringify(result, null, 2));
    
    if (response.status === 500) {
      console.log('\n❌ CONFIRMED: 500 error reproduced');
      console.log('🔍 This is the issue you were experiencing');
    } else if (response.status === 200) {
      console.log('\n✅ SUCCESS: Edge function handled the request');
      console.log('🔍 Fallback logic is working');
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

async function testNewPayload() {
  console.log('\n🧪 TESTING NEW PAYLOAD (with metadata)');
  console.log('===============================================');
  
  const newPayload = {
    clinicId: TEST_CLINIC_ID,
    dataSourceId: `gas-test-${Date.now()}`,
    spreadsheetId: '1BH7XuQfO_K8nP9mNrG5YZvH3OX7x8W4nE6FgHjKlMnO',
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

  console.log('📤 Payload Structure:');
  console.log(JSON.stringify(newPayload, null, 2));

  try {
    const startTime = Date.now();
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify(newPayload)
    });

    const endTime = Date.now();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`⏱️ Response Time: ${endTime - startTime}ms`);
    
    const result = await response.json();
    console.log('📥 Response Body:');
    console.log(JSON.stringify(result, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS: New payload structure works');
      console.log('🔍 Metadata enables proper data source creation');
    } else {
      console.log('\n❌ UNEXPECTED: New payload still failing');
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

async function testRealisticBatch() {
  console.log('\n🧪 TESTING REALISTIC BATCH (25 records like your logs)');
  console.log('=======================================================');
  
  // Generate 25 records like your actual sync
  const records = Array.from({ length: 25 }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    locationName: 'Baytown',
    production: 1500.00 + (i * 25),
    adjustments: 50.00,
    writeOffs: 25.00,
    patientIncome: 750.00,
    insuranceIncome: 675.00 + (i * 10),
    unearned: 0
  }));

  const realisticPayload = {
    clinicId: TEST_CLINIC_ID,
    dataSourceId: `gas-realistic-${Date.now()}`,
    spreadsheetId: '1BH7XuQfO_K8nP9mNrG5YZvH3OX7x8W4nE6FgHjKlMnO',
    spreadsheetName: 'KamDental Location Financial Data - 2024',
    sheetName: 'Baytown Financial Data',
    records: records,
    upsert: true,
    dryRun: false
  };

  console.log('📤 Payload Summary:');
  console.log(`   Records: ${realisticPayload.records.length}`);
  console.log(`   Clinic ID: ${realisticPayload.clinicId}`);
  console.log(`   Data Source: ${realisticPayload.dataSourceId}`);
  console.log(`   First Record: ${JSON.stringify(realisticPayload.records[0])}`);
  console.log(`   Last Record: ${JSON.stringify(realisticPayload.records[24])}`);

  try {
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
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`⏱️ Response Time: ${endTime - startTime}ms`);
    
    const result = await response.json();
    console.log('📥 Response Body:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

async function main() {
  console.log('🔬 GOOGLE APPS SCRIPT PAYLOAD TESTING');
  console.log('=====================================');
  console.log(`🎯 Target: ${EDGE_FUNCTION_URL}`);
  console.log(`🏥 Clinic: ${TEST_CLINIC_ID}`);
  console.log(`🔐 Auth: ${SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing'}`);

  await testOldPayload();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  await testNewPayload();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  await testRealisticBatch();
  
  console.log('\n🏁 TESTING COMPLETE');
  console.log('===================');
}

main().catch(console.error);
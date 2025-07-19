#!/usr/bin/env node
/**
 * Test script to validate the execute_sql RPC endpoint works correctly
 * This simulates what the Google Apps Script would do
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

async function testExecuteSqlEndpoint() {
  const testQuery = `
    SELECT 
      p.id,
      p.provider_code as external_id,
      p.first_name,
      p.last_name,
      p.email,
      p.provider_type as title,
      p.position as specialization,
      p.created_at,
      p.updated_at,
      array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as clinic_names,
      array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) as clinic_ids
    FROM providers p
    LEFT JOIN provider_locations pl ON p.id = pl.provider_id
    LEFT JOIN locations l ON pl.location_id = l.id
    LEFT JOIN clinics c ON l.clinic_id = c.id
    WHERE p.status != 'deleted' OR p.status IS NULL
    GROUP BY p.id, p.provider_code, p.first_name, p.last_name, p.email, p.provider_type, p.position, p.created_at, p.updated_at
    ORDER BY p.last_name, p.first_name
  `.trim().replace(/\s+/g, ' ');

  console.log('🧪 Testing execute_sql RPC endpoint...');
  console.log(`📍 URL: ${SUPABASE_URL}/rest/v1/rpc/execute_sql`);
  
  // Test with both keys to see which one works
  const keysToTest = [
    { name: 'Service Role Key', key: SUPABASE_SERVICE_KEY },
    { name: 'Anonymous Key', key: SUPABASE_ANON_KEY }
  ];
  
  for (const { name, key } of keysToTest) {
    console.log(`\n🔑 Testing with ${name}...`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'apikey': key
        },
        body: JSON.stringify({
          query: testQuery
        })
      });

      console.log(`📊 Response Status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error: ${response.status}`);
        console.error(`❌ Error Response:`, errorText);
        continue; // Try next key
      }

      const result = await response.json();
      console.log(`✅ ${name} worked successfully!`);
      console.log(`📦 Response type: ${Array.isArray(result) ? 'array' : typeof result}`);
      console.log(`📝 Response length: ${Array.isArray(result) ? result.length : 'N/A'}`);
      
      if (Array.isArray(result) && result.length > 0) {
        console.log('🎯 Sample provider data:');
        console.log(`   • ID: ${result[0].id}`);
        console.log(`   • Name: ${result[0].first_name} ${result[0].last_name}`);
        console.log(`   • External ID: ${result[0].external_id}`);
        console.log(`   • Title: ${result[0].title}`);
        console.log(`   • Clinics: ${result[0].clinic_names || 'None'}`);
      }
      
      return true;
      
    } catch (error) {
      console.error(`❌ Network Error with ${name}:`, error.message);
    }
  }
  
  return false;
}

// Run the test
testExecuteSqlEndpoint()
  .then(success => {
    if (success) {
      console.log('\n🎉 execute_sql endpoint test PASSED!');
      console.log('✅ Google Apps Script should now be able to query providers successfully.');
    } else {
      console.log('\n💥 execute_sql endpoint test FAILED!');
      console.log('❌ Google Apps Script will continue to encounter errors.');
    }
  })
  .catch(error => {
    console.error('\n💥 Test script error:', error);
  });
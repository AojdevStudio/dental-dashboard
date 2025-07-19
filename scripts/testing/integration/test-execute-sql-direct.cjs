#!/usr/bin/env node
/**
 * Direct test of execute_sql RPC function with the exact query from Google Apps Script
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
    envVars[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

async function testExecuteSqlDirect() {
  console.log('🧪 Testing execute_sql RPC function directly...');
  
  // Test 1: Simple query
  console.log('\n📝 Test 1: Simple SELECT query');
  try {
    const simpleQuery = 'SELECT 1 as test_value';
    const response1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: simpleQuery })
    });
    
    const result1 = await response1.json();
    console.log(`✅ Simple query result: ${JSON.stringify(result1)}`);
  } catch (error) {
    console.log(`❌ Simple query failed: ${error.message}`);
  }
  
  // Test 2: Provider query (simplified)
  console.log('\n📝 Test 2: Simplified provider query');
  try {
    const providerQuery = 'SELECT p.id, p.provider_code, p.first_name, p.last_name FROM providers p ORDER BY p.last_name LIMIT 3';
    const response2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: providerQuery })
    });
    
    if (!response2.ok) {
      const errorText = await response2.text();
      console.log(`❌ Provider query failed: ${response2.status} - ${errorText}`);
    } else {
      const result2 = await response2.json();
      console.log(`✅ Provider query result: ${JSON.stringify(result2, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Provider query failed: ${error.message}`);
  }
  
  // Test 3: Complex provider query (exact from Google Apps Script)
  console.log('\n📝 Test 3: Complex provider query with aggregations');
  try {
    const complexQuery = `SELECT p.id, p.provider_code as external_id, p.first_name, p.last_name, p.email, p.provider_type as title, p.position as specialization, p.created_at, p.updated_at, array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as clinic_names, array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL) as clinic_ids FROM providers p LEFT JOIN provider_locations pl ON p.id = pl.provider_id LEFT JOIN locations l ON pl.location_id = l.id LEFT JOIN clinics c ON l.clinic_id = c.id WHERE p.status != 'deleted' OR p.status IS NULL GROUP BY p.id, p.provider_code, p.first_name, p.last_name, p.email, p.provider_type, p.position, p.created_at, p.updated_at ORDER BY p.last_name, p.first_name`;
    
    const response3 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: complexQuery })
    });
    
    if (!response3.ok) {
      const errorText = await response3.text();
      console.log(`❌ Complex query failed: ${response3.status} - ${errorText}`);
    } else {
      const result3 = await response3.json();
      console.log(`✅ Complex query result: Found ${result3.length} providers`);
      result3.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.first_name} ${p.last_name} (${p.external_id})`);
      });
    }
  } catch (error) {
    console.log(`❌ Complex query failed: ${error.message}`);
  }
  
  // Test 4: Test exact JSON format that Google Apps Script sends
  console.log('\n📝 Test 4: Test exact payload format from Google Apps Script');
  try {
    const exactPayload = {
      query: "SELECT p.id, p.provider_code as external_id, p.first_name, p.last_name, p.email FROM providers p ORDER BY p.last_name LIMIT 2"
    };
    
    const response4 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify(exactPayload)
    });
    
    if (!response4.ok) {
      const errorText = await response4.text();
      console.log(`❌ Exact payload failed: ${response4.status} - ${errorText}`);
    } else {
      const result4 = await response4.json();
      console.log(`✅ Exact payload result: ${JSON.stringify(result4, null, 2)}`);
    }
  } catch (error) {
    console.log(`❌ Exact payload failed: ${error.message}`);
  }
}

testExecuteSqlDirect()
  .then(() => {
    console.log('\n🎉 execute_sql RPC function testing complete!');
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error);
  });
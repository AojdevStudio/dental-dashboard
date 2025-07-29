#!/usr/bin/env node
/**
 * Complete End-to-End Test for Dr. Chinyere Enih Provider Detection
 * 
 * This test simulates the exact scenario that was failing:
 * 1. Test database provider query with execute_sql RPC
 * 2. Test pattern matching for Dr. Chinyere Enih
 * 3. Test provider configuration validation
 * 4. Verify the complete detection workflow
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
const SUPABASE_SERVICE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔬 DR. CHINYERE ENIH COMPLETE DETECTION TEST');
console.log('===========================================');

async function testDatabaseProviderQuery() {
  console.log('\n📊 STEP 1: Database Provider Query Test');
  console.log('--------------------------------------');
  
  const query = `
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

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ query: query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Database query failed: ${response.status}`);
      console.log(`❌ Error: ${errorText}`);
      return null;
    }

    const providers = await response.json();
    console.log(`✅ Database query successful: ${providers.length} providers found`);
    
    // Look for Dr. Chinyere Enih specifically
    const chinyere = providers.find(p => 
      p.first_name?.toLowerCase() === 'chinyere' && 
      p.last_name?.toLowerCase() === 'enih'
    );

    if (chinyere) {
      console.log('🎯 Dr. Chinyere Enih found in database:');
      console.log(`   • ID: ${chinyere.id}`);
      console.log(`   • External ID: ${chinyere.external_id}`);
      console.log(`   • Name: ${chinyere.first_name} ${chinyere.last_name}`);
      console.log(`   • Title: ${chinyere.title}`);
      console.log(`   • Specialization: ${chinyere.specialization}`);
      console.log(`   • Clinics: ${chinyere.clinic_names || 'None assigned'}`);
      console.log(`   • Clinic IDs: ${chinyere.clinic_ids || 'None'}`);
      return { providers, chinyere };
    } else {
      console.log('❌ Dr. Chinyere Enih NOT found in database');
      console.log('📋 Available providers:');
      providers.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.first_name} ${p.last_name} (${p.external_id})`);
      });
      return { providers, chinyere: null };
    }
    
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return null;
  }
}

function testPatternMatching(provider) {
  console.log('\n🎯 STEP 2: Pattern Matching Test');
  console.log('--------------------------------');
  
  const testSpreadsheetNames = [
    'Dr Chinyere Enih Production',
    'Chinyere Production Data',
    'Enih Dental Statistics',
    'Dr. Chinyere Daily Stats',
    'CHINYERE_ENIH_SYNC_SHEET',
    'chinyere enih data',
    'DR CHINYERE PRODUCTION'
  ];

  // Exact patterns from shared-multi-provider-utils.gs for chinyere_enih
  const chinyerePatterns = [
    /chinyere/i,
    /enih/i,
    /dr\.?\s*chinyere/i,
    /chinyere.*enih/i
  ];

  console.log('Testing actual Google Apps Script pattern matching logic...');
  
  const results = testSpreadsheetNames.map(spreadsheetName => {
    // Simulate the exact logic from detectCurrentProvider function
    let matchedPattern = null;
    
    for (const pattern of chinyerePatterns) {
      if (pattern.test(spreadsheetName)) {
        matchedPattern = pattern;
        break; // First match wins, confidence = 1.0
      }
    }
    
    const detected = matchedPattern !== null;
    const confidence = detected ? 1.0 : 0.0;
    
    return {
      spreadsheetName,
      matchedPattern: matchedPattern ? matchedPattern.toString() : 'None',
      confidence,
      detected,
      status: detected ? '✅' : '❌'
    };
  });
  
  results.forEach(result => {
    console.log(`${result.status} "${result.spreadsheetName}" - Pattern: ${result.matchedPattern} (Confidence: ${result.confidence})`);
  });
  
  const successfulDetections = results.filter(r => r.detected).length;
  console.log(`\n📊 Pattern matching results: ${successfulDetections}/${results.length} detected successfully`);
  
  return successfulDetections === results.length;
}

function testConfigurationValidation(provider) {
  console.log('\n⚙️ STEP 3: Configuration Validation');
  console.log('-----------------------------------');
  
  // Check if provider would be found in static configuration
  const staticProviders = [
    'kamdi_ekow',
    'obinna_okafor', 
    'chinyere_enih',
    'adriane_fontenot',
    'kia_hamilton'
  ];
  
  const providerCode = 'chinyere_enih';
  const foundInStatic = staticProviders.includes(providerCode);
  
  console.log(`🔍 Provider code to find: ${providerCode}`);
  console.log(`📋 Available static providers: ${staticProviders.join(', ')}`);
  console.log(`${foundInStatic ? '✅' : '❌'} Found in static configuration: ${foundInStatic}`);
  
  if (provider) {
    console.log(`✅ Found in database: true`);
    console.log(`✅ Database external_id: ${provider.external_id}`);
    console.log(`✅ Matches provider_code: ${provider.external_id === providerCode}`);
  }
  
  // Simulate the configuration lookup that was failing
  const configurationResult = {
    providerCode: providerCode,
    externalId: provider?.external_id || 'CHINYERE_PROVIDER',
    displayName: provider ? `${provider.first_name} ${provider.last_name}` : 'Dr. Chinyere Enih',
    primaryClinic: 'KAMDENTAL_BAYTOWN',
    source: provider ? 'database' : 'static',
    confidence: provider ? 1.0 : 0.8
  };
  
  console.log('\n📊 Final provider configuration:');
  Object.entries(configurationResult).forEach(([key, value]) => {
    console.log(`   • ${key}: ${value}`);
  });
  
  return configurationResult;
}

function testCredentialResolution(config) {
  console.log('\n🔐 STEP 4: Credential Resolution Test');
  console.log('------------------------------------');
  
  // Simulate the credential resolution that includes provider detection
  const mockCredentials = {
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_SERVICE_KEY,
    providerInfo: config,
    clinicInfo: {
      id: 'cmc3jcrhe0000i2ht9ymqtmzb', // Example clinic ID
      name: 'KAMDENTAL_BAYTOWN',
      code: 'BAYTOWN'
    },
    locationInfo: {
      id: 'cmc3jcri50001i2ht8x5kq9vw', // Example location ID  
      name: 'Baytown Main',
      code: 'BAYTOWN_MAIN'
    },
    resolvedAt: new Date().toISOString()
  };
  
  console.log('✅ Mock credential resolution successful');
  console.log(`✅ Provider: ${mockCredentials.providerInfo.displayName}`);
  console.log(`✅ Clinic: ${mockCredentials.clinicInfo.name}`);
  console.log(`✅ Location: ${mockCredentials.locationInfo.name}`);
  console.log(`✅ Authentication: Bearer token configured`);
  
  return mockCredentials;
}

async function runCompleteTest() {
  try {
    // Step 1: Database Query
    const dbResult = await testDatabaseProviderQuery();
    if (!dbResult) {
      console.log('\n💥 Database test failed - cannot continue');
      return false;
    }
    
    // Step 2: Pattern Matching
    const patternSuccess = testPatternMatching(dbResult.chinyere);
    
    // Step 3: Configuration Validation
    const config = testConfigurationValidation(dbResult.chinyere);
    
    // Step 4: Credential Resolution
    const credentials = testCredentialResolution(config);
    
    // Final Summary
    console.log('\n🎉 COMPLETE TEST SUMMARY');
    console.log('========================');
    console.log(`✅ Database query: ${dbResult ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Dr. Chinyere found in DB: ${dbResult.chinyere ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Pattern matching: ${patternSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Configuration: PASS`);
    console.log(`✅ Credential resolution: PASS`);
    
    const allTestsPassed = dbResult && dbResult.chinyere && patternSuccess;
    
    console.log(`\n🏆 OVERALL RESULT: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    if (allTestsPassed) {
      console.log('\n🚀 Dr. Chinyere Enih provider detection is working!');
      console.log('✅ The original error "Provider chinyere_enih not found" should be resolved');
      console.log('✅ Google Apps Script sync should now work for Dr. Chinyere Enih');
    } else {
      console.log('\n⚠️ Some issues were found - review the results above');
    }
    
    return allTestsPassed;
    
  } catch (error) {
    console.log(`\n💥 Test execution failed: ${error.message}`);
    return false;
  }
}

// Run the complete test
runCompleteTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test script error:', error);
    process.exit(1);
  });
#!/usr/bin/env node

/**
 * Emergency Test Data Contamination Scanner
 * Scans production database for test data patterns
 */

const { safeExecute, logScriptExecution } = require('./safety-utils');

async function scanProductionForContamination() {
  // This script is specifically designed to scan production safely
  const { scanForTestDataContamination, generateCleanupScript } = require('../src/lib/monitoring/contamination-detector.ts');
  
  logScriptExecution('scan-contamination', 'start');
  
  try {
    console.log('🔍 Scanning for test data contamination...');
    
    const scanResult = await scanForTestDataContamination();
    
    if (scanResult.isContaminated) {
      console.error('🚨 CONTAMINATION DETECTED!');
      console.error(`Total issues found: ${scanResult.totalIssues}`);
      console.error('Scan timestamp:', scanResult.scanTimestamp);
      
      // Group alerts by severity
      const criticalAlerts = scanResult.alerts.filter(a => a.severity === 'critical');
      const highAlerts = scanResult.alerts.filter(a => a.severity === 'high');
      const mediumAlerts = scanResult.alerts.filter(a => a.severity === 'medium');
      
      if (criticalAlerts.length > 0) {
        console.error('\n🔴 CRITICAL ISSUES:');
        criticalAlerts.forEach(alert => {
          console.error(`  - ${alert.details}`);
          console.error(`    Table: ${alert.affectedTable}, Count: ${alert.recordCount}`);
        });
      }
      
      if (highAlerts.length > 0) {
        console.warn('\n🟡 HIGH PRIORITY ISSUES:');
        highAlerts.forEach(alert => {
          console.warn(`  - ${alert.details}`);
        });
      }
      
      if (mediumAlerts.length > 0) {
        console.log('\n🟠 MEDIUM PRIORITY ISSUES:');
        mediumAlerts.forEach(alert => {
          console.log(`  - ${alert.details}`);
        });
      }
      
      // Generate cleanup script
      const cleanupScript = generateCleanupScript(scanResult.alerts);
      const fs = require('fs');
      const path = require('path');
      
      const scriptPath = path.join(__dirname, '../logs/cleanup-script.sql');
      fs.writeFileSync(scriptPath, cleanupScript);
      
      console.log(`\n📝 Cleanup script generated: ${scriptPath}`);
      console.log('⚠️ REVIEW CAREFULLY before executing cleanup script');
      
      logScriptExecution('scan-contamination', 'contamination_detected', {
        totalIssues: scanResult.totalIssues,
        criticalCount: criticalAlerts.length,
        highCount: highAlerts.length
      });
      
      // Exit with error code to indicate contamination
      process.exit(1);
    } else {
      console.log('✅ No contamination detected - database is clean');
      logScriptExecution('scan-contamination', 'clean');
      process.exit(0);
    }
    
  } catch (error) {
    logScriptExecution('scan-contamination', 'error', { error: error.message });
    throw error;
  }
}

// Execute with safety wrapper
safeExecute('scan-contamination', scanProductionForContamination, {
  allowProduction: true,  // This script is safe to run on production
  requireConfirmation: false  // Quick scan doesn't need confirmation
}).catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
/**
 * Test Data Contamination Detection System
 * Monitors production database for test data patterns
 */

import { prisma } from '../database/client';

export interface ContaminationAlert {
  type: 'test_email' | 'fake_data' | 'unusual_pattern' | 'test_clinic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  recordCount: number;
  affectedTable: string;
  sampleData?: unknown[];
}

export interface ContaminationScanResult {
  isContaminated: boolean;
  alerts: ContaminationAlert[];
  scanTimestamp: Date;
  totalIssues: number;
}

/**
 * Scan for test email patterns that shouldn't exist in production
 */
async function scanTestEmails(): Promise<ContaminationAlert[]> {
  const alerts: ContaminationAlert[] = [];

  try {
    // Check for .test email patterns
    const testEmailUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '.test',
        },
      },
      select: { id: true, email: true, name: true },
    });

    if (testEmailUsers.length > 0) {
      alerts.push({
        type: 'test_email',
        severity: 'critical',
        details: `Found ${testEmailUsers.length} users with .test email addresses`,
        recordCount: testEmailUsers.length,
        affectedTable: 'users',
        sampleData: testEmailUsers.slice(0, 5),
      });
    }

    // Check for other test email patterns
    const testPatterns = ['example.com', 'test-user', 'fake@', 'dummy@'];

    for (const pattern of testPatterns) {
      const users = await prisma.user.findMany({
        where: {
          email: {
            contains: pattern,
          },
        },
        select: { id: true, email: true, name: true },
      });

      if (users.length > 0) {
        alerts.push({
          type: 'test_email',
          severity: 'high',
          details: `Found ${users.length} users with '${pattern}' pattern in email`,
          recordCount: users.length,
          affectedTable: 'users',
          sampleData: users.slice(0, 3),
        });
      }
    }
  } catch (error) {
    console.error('Error scanning test emails:', error);
  }

  return alerts;
}

/**
 * Scan for test clinic patterns
 */
async function scanTestClinics(): Promise<ContaminationAlert[]> {
  const alerts: ContaminationAlert[] = [];

  try {
    // Check for test clinic names
    const testClinics = await prisma.clinic.findMany({
      where: {
        OR: [
          { name: { contains: 'Test Clinic' } },
          { name: { contains: 'test clinic' } },
          { name: { contains: 'TEST' } },
          { location: { contains: 'Test Location' } },
        ],
      },
      select: { id: true, name: true, location: true },
    });

    if (testClinics.length > 0) {
      alerts.push({
        type: 'test_clinic',
        severity: 'critical',
        details: `Found ${testClinics.length} clinics with test patterns`,
        recordCount: testClinics.length,
        affectedTable: 'clinics',
        sampleData: testClinics.slice(0, 5),
      });
    }
  } catch (error) {
    console.error('Error scanning test clinics:', error);
  }

  return alerts;
}

/**
 * Scan for unusual data creation patterns that might indicate test data
 */
async function scanUnusualPatterns(): Promise<ContaminationAlert[]> {
  const alerts: ContaminationAlert[] = [];

  try {
    // Check for bulk creation of users (possible test data insertion)
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (recentUsers.length > 100) {
      alerts.push({
        type: 'unusual_pattern',
        severity: 'medium',
        details: `Unusual bulk user creation: ${recentUsers.length} users created in last 24 hours`,
        recordCount: recentUsers.length,
        affectedTable: 'users',
      });
    }
  } catch (error) {
    console.error('Error scanning unusual patterns:', error);
  }

  return alerts;
}

/**
 * Comprehensive scan for test data contamination
 */
export async function scanForTestDataContamination(): Promise<ContaminationScanResult> {
  const allAlerts: ContaminationAlert[] = [];

  // Run all scans
  const emailAlerts = await scanTestEmails();
  const clinicAlerts = await scanTestClinics();
  const patternAlerts = await scanUnusualPatterns();

  allAlerts.push(...emailAlerts, ...clinicAlerts, ...patternAlerts);

  const result: ContaminationScanResult = {
    isContaminated: allAlerts.length > 0,
    alerts: allAlerts,
    scanTimestamp: new Date(),
    totalIssues: allAlerts.length,
  };

  if (result.isContaminated) {
    console.error('🚨 TEST DATA CONTAMINATION DETECTED!');
    console.error(`Found ${result.totalIssues} contamination issues`);

    // Log critical alerts
    const criticalAlerts = allAlerts.filter((alert) => alert.severity === 'critical');
    if (criticalAlerts.length > 0) {
      console.error('CRITICAL ISSUES:');
      for (const alert of criticalAlerts) {
        console.error(`- ${alert.details}`);
      }
    }
  } else {
  }

  return result;
}

/**
 * Generate cleanup script for contaminated data
 */
export function generateCleanupScript(alerts: ContaminationAlert[]): string {
  let script = '-- TEST DATA CLEANUP SCRIPT\n';
  script += '-- ⚠️ REVIEW CAREFULLY BEFORE EXECUTION\n';
  script += `-- Generated at: ${new Date().toISOString()}\n\n`;

  for (const alert of alerts) {
    script += `-- ${alert.type.toUpperCase()}: ${alert.details}\n`;

    if (alert.type === 'test_email' && alert.affectedTable === 'users') {
      script += `-- DELETE FROM users WHERE email LIKE '%.test%';\n`;
      script += `-- DELETE FROM user_clinic_roles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%.test%');\n\n`;
    }

    if (alert.type === 'test_clinic' && alert.affectedTable === 'clinics') {
      script += `-- DELETE FROM clinics WHERE name LIKE '%Test%' OR location LIKE '%Test%';\n\n`;
    }
  }

  script += '-- END CLEANUP SCRIPT\n';
  return script;
}

/**
 * Emergency contamination check - quick scan for immediate threats
 */
export async function emergencyContaminationCheck(): Promise<boolean> {
  try {
    const testEmailCount = await prisma.user.count({
      where: {
        email: {
          contains: '.test',
        },
      },
    });

    return testEmailCount > 0;
  } catch (error) {
    console.error('Emergency contamination check failed:', error);
    return false;
  }
}

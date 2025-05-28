/**
 * Rollback Script for UUID Migration
 * Reverts UUID changes and restores original IDs
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs/promises'
import * as path from 'path'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

interface RollbackReport {
  startedAt: Date
  completedAt?: Date
  status: 'success' | 'failed' | 'partial'
  tables: {
    [key: string]: {
      total: number
      rolledBack: number
      failed: number
    }
  }
  errors: Array<{ table: string; id: string; error: string }>
}

class MigrationRollback {
  private report: RollbackReport

  constructor() {
    this.report = {
      startedAt: new Date(),
      status: 'success',
      tables: {},
      errors: [],
    }
  }

  async rollbackUsers() {
    console.log('\n=== Rolling Back User UUIDs ===')
    const table = 'users'
    
    try {
      // Get all users with UUIDs
      const usersWithUuid = await prisma.user.count({
        where: { uuidId: { not: null } },
      })

      if (usersWithUuid === 0) {
        console.log('No users to rollback')
        return
      }

      let processedCount = 0
      let failedCount = 0

      // Get ID mappings for users
      const userMappings = await prisma.idMapping.findMany({
        where: { tableName: 'users' },
      })

      // Process rollback in transaction
      for (const mapping of userMappings) {
        try {
          await prisma.$transaction(async (tx) => {
            // Clear UUID fields
            await tx.user.update({
              where: { id: mapping.oldId },
              data: { 
                uuidId: null,
                authId: null, // Also clear auth integration
              },
            })

            // Remove ID mapping
            await tx.idMapping.delete({
              where: {
                tableName_oldId: {
                  tableName: 'users',
                  oldId: mapping.oldId,
                },
              },
            })

            processedCount++
          })
        } catch (error) {
          failedCount++
          const errorMsg = error instanceof Error ? error.message : String(error)
          this.report.errors.push({
            table: 'users',
            id: mapping.oldId,
            error: errorMsg,
          })
        }
      }

      this.report.tables[table] = {
        total: userMappings.length,
        rolledBack: processedCount,
        failed: failedCount,
      }

      console.log(`✓ Rolled back ${processedCount}/${userMappings.length} users`)
    } catch (error) {
      console.error('User rollback failed:', error)
      this.report.status = 'failed'
      throw error
    }
  }

  async rollbackClinics() {
    console.log('\n=== Rolling Back Clinic UUIDs ===')
    const table = 'clinics'
    
    try {
      const clinicsWithUuid = await prisma.clinic.count({
        where: { uuidId: { not: null } },
      })

      if (clinicsWithUuid === 0) {
        console.log('No clinics to rollback')
        return
      }

      let processedCount = 0
      let failedCount = 0

      const clinicMappings = await prisma.idMapping.findMany({
        where: { tableName: 'clinics' },
      })

      for (const mapping of clinicMappings) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.clinic.update({
              where: { id: mapping.oldId },
              data: { uuidId: null },
            })

            await tx.idMapping.delete({
              where: {
                tableName_oldId: {
                  tableName: 'clinics',
                  oldId: mapping.oldId,
                },
              },
            })

            processedCount++
          })
        } catch (error) {
          failedCount++
          const errorMsg = error instanceof Error ? error.message : String(error)
          this.report.errors.push({
            table: 'clinics',
            id: mapping.oldId,
            error: errorMsg,
          })
        }
      }

      this.report.tables[table] = {
        total: clinicMappings.length,
        rolledBack: processedCount,
        failed: failedCount,
      }

      console.log(`✓ Rolled back ${processedCount}/${clinicMappings.length} clinics`)
    } catch (error) {
      console.error('Clinic rollback failed:', error)
      this.report.status = 'failed'
      throw error
    }
  }

  async rollbackDashboards() {
    console.log('\n=== Rolling Back Dashboard UUIDs ===')
    const table = 'dashboards'
    
    try {
      const dashboardsWithUuid = await prisma.dashboard.count({
        where: { uuidId: { not: null } },
      })

      if (dashboardsWithUuid === 0) {
        console.log('No dashboards to rollback')
        return
      }

      let processedCount = 0
      let failedCount = 0

      const dashboardMappings = await prisma.idMapping.findMany({
        where: { tableName: 'dashboards' },
      })

      for (const mapping of dashboardMappings) {
        try {
          await prisma.$transaction(async (tx) => {
            await tx.dashboard.update({
              where: { id: mapping.oldId },
              data: { 
                uuidId: null,
                userUuidId: null,
              },
            })

            await tx.idMapping.delete({
              where: {
                tableName_oldId: {
                  tableName: 'dashboards',
                  oldId: mapping.oldId,
                },
              },
            })

            processedCount++
          })
        } catch (error) {
          failedCount++
          const errorMsg = error instanceof Error ? error.message : String(error)
          this.report.errors.push({
            table: 'dashboards',
            id: mapping.oldId,
            error: errorMsg,
          })
        }
      }

      this.report.tables[table] = {
        total: dashboardMappings.length,
        rolledBack: processedCount,
        failed: failedCount,
      }

      console.log(`✓ Rolled back ${processedCount}/${dashboardMappings.length} dashboards`)
    } catch (error) {
      console.error('Dashboard rollback failed:', error)
      this.report.status = 'failed'
      throw error
    }
  }

  async cleanupMappings() {
    console.log('\n=== Cleaning Up Remaining ID Mappings ===')
    
    try {
      const remainingMappings = await prisma.idMapping.count()
      
      if (remainingMappings > 0) {
        await prisma.idMapping.deleteMany()
        console.log(`✓ Deleted ${remainingMappings} remaining ID mappings`)
      } else {
        console.log('No remaining ID mappings to clean up')
      }
    } catch (error) {
      console.error('Mapping cleanup failed:', error)
      this.report.status = 'partial'
    }
  }

  async validateRollback() {
    console.log('\n=== Validating Rollback ===')
    const issues: string[] = []

    // Check for any remaining UUIDs
    const usersWithUuid = await prisma.user.count({
      where: { uuidId: { not: null } },
    })
    if (usersWithUuid > 0) {
      issues.push(`${usersWithUuid} users still have UUIDs`)
    }

    const clinicsWithUuid = await prisma.clinic.count({
      where: { uuidId: { not: null } },
    })
    if (clinicsWithUuid > 0) {
      issues.push(`${clinicsWithUuid} clinics still have UUIDs`)
    }

    const dashboardsWithUuid = await prisma.dashboard.count({
      where: { uuidId: { not: null } },
    })
    if (dashboardsWithUuid > 0) {
      issues.push(`${dashboardsWithUuid} dashboards still have UUIDs`)
    }

    // Check for remaining ID mappings
    const remainingMappings = await prisma.idMapping.count()
    if (remainingMappings > 0) {
      issues.push(`${remainingMappings} ID mappings still exist`)
    }

    if (issues.length > 0) {
      console.error('Rollback validation failed:')
      issues.forEach(issue => console.error(`  - ${issue}`))
      this.report.status = 'partial'
    } else {
      console.log('✓ Rollback validation passed')
    }
  }

  async generateReport() {
    this.report.completedAt = new Date()
    
    const reportDir = path.join(process.cwd(), 'migration-logs')
    await fs.mkdir(reportDir, { recursive: true })
    
    const reportPath = path.join(
      reportDir,
      `rollback-report-${this.report.startedAt.toISOString().replace(/[:.]/g, '-')}.json`
    )
    
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2))
    
    console.log('\n=== Rollback Report ===')
    console.log(`Status: ${this.report.status}`)
    console.log(`Started: ${this.report.startedAt.toISOString()}`)
    console.log(`Completed: ${this.report.completedAt.toISOString()}`)
    console.log('\nTable Summary:')
    
    Object.entries(this.report.tables).forEach(([table, stats]) => {
      console.log(`  ${table}:`)
      console.log(`    Total: ${stats.total}`)
      console.log(`    Rolled Back: ${stats.rolledBack}`)
      console.log(`    Failed: ${stats.failed}`)
    })
    
    if (this.report.errors.length > 0) {
      console.log(`\nErrors: ${this.report.errors.length}`)
      this.report.errors.slice(0, 10).forEach(error => {
        console.log(`  - ${error.table} ${error.id}: ${error.error}`)
      })
      if (this.report.errors.length > 10) {
        console.log(`  ... and ${this.report.errors.length - 10} more`)
      }
    }
    
    console.log(`\nFull report saved to: ${reportPath}`)
  }

  async run() {
    try {
      console.log('Starting UUID migration rollback...')
      console.log('WARNING: This will remove all UUID fields and ID mappings!')
      
      // Add confirmation prompt in production
      if (process.env.NODE_ENV === 'production') {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout,
        })
        
        const confirm = await new Promise<string>((resolve) => {
          readline.question('Are you sure you want to continue? (yes/no): ', resolve)
        })
        
        readline.close()
        
        if (confirm !== 'yes') {
          console.log('Rollback cancelled')
          return
        }
      }

      // Run rollbacks in reverse order
      await this.rollbackDashboards()
      await this.rollbackClinics()
      await this.rollbackUsers()
      
      // Clean up any remaining mappings
      await this.cleanupMappings()
      
      // Validate rollback
      await this.validateRollback()
      
      // Generate report
      await this.generateReport()
      
    } catch (error) {
      console.error('Rollback failed:', error)
      this.report.status = 'failed'
      await this.generateReport()
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }
}

// Run rollback if called directly
if (require.main === module) {
  const rollback = new MigrationRollback()
  rollback.run().catch(error => {
    console.error('Fatal rollback error:', error)
    process.exit(1)
  })
}

export { MigrationRollback }
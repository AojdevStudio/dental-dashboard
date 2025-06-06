import { type NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/database/client'

interface ImportRecord {
  date: string
  locationName: string
  production?: number
  adjustments?: number
  writeOffs?: number
  patientIncome?: number
  insuranceIncome?: number
  unearned?: number
}

interface ImportRequest {
  clinicId: string
  dataSourceId?: string
  records: ImportRecord[]
  upsert?: boolean // Whether to update existing records
  dryRun?: boolean // Test import without saving
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json()
    const { 
      clinicId, 
      dataSourceId, 
      records, 
      upsert = true, 
      dryRun = false 
    } = body

    // Validate required fields
    if (!clinicId || !records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: clinicId and records array are required'
      }, { status: 400 })
    }

    // Verify clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        locations: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    if (!clinic) {
      return NextResponse.json({
        success: false,
        error: 'Clinic not found'
      }, { status: 404 })
    }

    // Create location name to ID mapping
    const locationMap = new Map(
      clinic.locations.map(loc => [loc.name.toLowerCase(), loc])
    )

    // Validate and process records
    const validRecords: any[] = []
    const errors: string[] = []
    const warnings: string[] = []

    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const recordIndex = i + 1

      try {
        // Validate required fields
        if (!record.date || !record.locationName) {
          errors.push(`Record ${recordIndex}: date and locationName are required`)
          continue
        }

        // Validate date
        const recordDate = new Date(record.date)
        if (isNaN(recordDate.getTime())) {
          errors.push(`Record ${recordIndex}: invalid date format`)
          continue
        }

        // Find location
        const locationKey = record.locationName.toLowerCase().trim()
        const location = locationMap.get(locationKey)
        
        if (!location) {
          errors.push(`Record ${recordIndex}: location "${record.locationName}" not found`)
          continue
        }

        if (!location.isActive) {
          warnings.push(`Record ${recordIndex}: location "${record.locationName}" is inactive`)
        }

        // Validate numeric fields
        const production = Number.parseFloat(record.production?.toString() || '0')
        const adjustments = Number.parseFloat(record.adjustments?.toString() || '0')
        const writeOffs = Number.parseFloat(record.writeOffs?.toString() || '0')
        const patientIncome = Number.parseFloat(record.patientIncome?.toString() || '0')
        const insuranceIncome = Number.parseFloat(record.insuranceIncome?.toString() || '0')
        const unearned = record.unearned ? Number.parseFloat(record.unearned.toString()) : null

        if (isNaN(production) || production < 0) {
          errors.push(`Record ${recordIndex}: invalid production value`)
          continue
        }

        // Calculate derived fields
        const netProduction = production - adjustments - writeOffs
        const totalCollections = patientIncome + insuranceIncome

        // Check for existing record if not upsert mode
        if (!upsert) {
          const existingRecord = await prisma.locationFinancial.findFirst({
            where: {
              clinicId,
              locationId: location.id,
              date: recordDate
            }
          })

          if (existingRecord) {
            warnings.push(`Record ${recordIndex}: data already exists for ${record.locationName} on ${record.date}`)
            continue
          }
        }

        validRecords.push({
          clinicId,
          locationId: location.id,
          locationName: record.locationName,
          date: recordDate,
          production,
          adjustments,
          writeOffs,
          netProduction,
          patientIncome,
          insuranceIncome,
          totalCollections,
          unearned,
          dataSourceId: dataSourceId || null
        })

      } catch (error) {
        errors.push(`Record ${recordIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Return validation results if there are errors or in dry run mode
    if (errors.length > 0 || dryRun) {
      return NextResponse.json({
        success: errors.length === 0,
        dryRun,
        validation: {
          totalRecords: records.length,
          validRecords: validRecords.length,
          errors: errors.length,
          warnings: warnings.length
        },
        errors,
        warnings,
        ...(dryRun && { previewRecords: validRecords.slice(0, 5) }) // Show first 5 records in preview
      })
    }

    // Process valid records
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0
    }

    const processedRecords = []

    for (const record of validRecords) {
      try {
        if (upsert) {
          const result = await prisma.locationFinancial.upsert({
            where: {
              clinicId_locationId_date: {
                clinicId: record.clinicId,
                locationId: record.locationId,
                date: record.date
              }
            },
            update: {
              production: record.production,
              adjustments: record.adjustments,
              writeOffs: record.writeOffs,
              netProduction: record.netProduction,
              patientIncome: record.patientIncome,
              insuranceIncome: record.insuranceIncome,
              totalCollections: record.totalCollections,
              unearned: record.unearned,
              dataSourceId: record.dataSourceId
            },
            create: {
              clinicId: record.clinicId,
              locationId: record.locationId,
              date: record.date,
              production: record.production,
              adjustments: record.adjustments,
              writeOffs: record.writeOffs,
              netProduction: record.netProduction,
              patientIncome: record.patientIncome,
              insuranceIncome: record.insuranceIncome,
              totalCollections: record.totalCollections,
              unearned: record.unearned,
              dataSourceId: record.dataSourceId
            },
            include: {
              location: {
                select: {
                  name: true
                }
              }
            }
          })

          // Check if this was an update or create (Prisma doesn't tell us directly)
          const existingCheck = await prisma.locationFinancial.findFirst({
            where: {
              clinicId: record.clinicId,
              locationId: record.locationId,
              date: record.date
            },
            select: { updatedAt: true, createdAt: true }
          })

          if (existingCheck && existingCheck.updatedAt > existingCheck.createdAt) {
            results.updated++
          } else {
            results.created++
          }

          processedRecords.push({
            locationName: record.locationName,
            date: record.date.toISOString().split('T')[0],
            production: record.production,
            status: 'success'
          })

        } else {
          const result = await prisma.locationFinancial.create({
            data: {
              clinicId: record.clinicId,
              locationId: record.locationId,
              date: record.date,
              production: record.production,
              adjustments: record.adjustments,
              writeOffs: record.writeOffs,
              netProduction: record.netProduction,
              patientIncome: record.patientIncome,
              insuranceIncome: record.insuranceIncome,
              totalCollections: record.totalCollections,
              unearned: record.unearned,
              dataSourceId: record.dataSourceId
            }
          })

          results.created++
          processedRecords.push({
            locationName: record.locationName,
            date: record.date.toISOString().split('T')[0],
            production: record.production,
            status: 'created'
          })
        }

      } catch (error) {
        results.failed++
        console.error(`Failed to process record for ${record.locationName} on ${record.date}:`, error)
      }
    }

    // Update data source sync timestamp if provided
    if (dataSourceId && results.created + results.updated > 0) {
      try {
        await prisma.dataSource.update({
          where: { id: dataSourceId },
          data: { lastSyncedAt: new Date() }
        })
      } catch (error) {
        console.warn('Failed to update data source sync timestamp:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed successfully`,
      results,
      warnings,
      processedRecords: processedRecords.slice(0, 10), // Return first 10 for confirmation
      totalProcessed: processedRecords.length
    })

  } catch (error) {
    console.error('Error importing location financial data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to import location financial data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
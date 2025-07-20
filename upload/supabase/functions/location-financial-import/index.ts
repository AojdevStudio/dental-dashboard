import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Simple CUID generation function (compatible with Prisma's cuid())
function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 8);
  return `c${timestamp}${randomPart}`;
}

// Types for the import request
interface ImportRecord {
  date: string;
  locationName: string;
  production?: number;
  adjustments?: number;
  writeOffs?: number;
  patientIncome?: number;
  insuranceIncome?: number;
  unearned?: number;
}

interface ImportRequest {
  clinicId: string;
  dataSourceId?: string;
  records: ImportRecord[];
  upsert?: boolean;
  dryRun?: boolean;
}

interface ValidatedFinancialData {
  clinicId: string;
  locationId: string;
  locationName: string;
  date: Date;
  production: number;
  adjustments: number;
  writeOffs: number;
  netProduction: number;
  patientIncome: number;
  insuranceIncome: number;
  totalCollections: number;
  unearned: number | null;
  dataSourceId?: string;
}

interface Location {
  id: string;
  name: string;
  isActive: boolean;
}

interface ProcessedRecord {
  locationName: string;
  date: string;
  production: number;
  status: string;
}

Deno.serve(async (req: Request) => {
  console.log('🚀 FUNCTION START: Edge function invoked at', new Date().toISOString());
  console.log('📥 REQUEST METHOD:', req.method);
  console.log('📥 REQUEST URL:', req.url);
  
  const startTime = Date.now();

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS: Handling OPTIONS preflight request');
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
      },
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ METHOD: Invalid method', req.method, 'expected POST');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
  
  console.log('✅ METHOD: POST request confirmed');

  try {
    console.log('🔧 ENV: Reading environment variables...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('🔧 ENV: SUPABASE_URL present:', !!supabaseUrl);
    console.log('🔧 ENV: SERVICE_ROLE_KEY present:', !!supabaseServiceRoleKey);

    if (!(supabaseUrl && supabaseServiceRoleKey)) {
      console.log('❌ ENV: Missing environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    console.log('✅ ENV: Environment variables validated');

    console.log('🔗 CLIENT: Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('✅ CLIENT: Supabase client created');
    
    console.log('📦 BODY: Reading request body...');
    let body: ImportRequest;
    try {
      body = await req.json();
      console.log('📦 BODY: Request body parsed successfully');
    } catch (jsonError) {
      console.error('💥 JSON: Failed to parse request body');
      console.error('💥 JSON ERROR:', jsonError);
      throw new Error(`Invalid JSON in request body: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
    }
    
    const { clinicId, dataSourceId, records, upsert = true, dryRun = false } = body;
    console.log('📦 BODY: Extracted variables - clinicId:', !!clinicId, 'dataSourceId:', !!dataSourceId, 'records:', records?.length || 0);

    // DEBUG: Log received request details
    try {
      console.log('🔍 DEBUG: Attempting to log request body...');
      console.log('Received request body:', JSON.stringify(body, null, 2));
      console.log('🔍 DEBUG: Request body logged successfully');
    } catch (jsonError) {
      console.error('💥 DEBUG: Failed to stringify body:', jsonError);
      console.log('🔍 DEBUG: Body type:', typeof body);
      console.log('🔍 DEBUG: Body keys:', Object.keys(body || {}));
    }
    
    console.log('clinicId:', clinicId, 'records length:', records?.length);

    // DETAILED VALIDATION DEBUGGING
    console.log('🔍 VALIDATION: Starting request validation...');
    
    try {
      console.log('🔍 VALIDATION: clinicId present:', !!clinicId);
      console.log('🔍 VALIDATION: clinicId type:', typeof clinicId);
      console.log('🔍 VALIDATION: clinicId value:', clinicId);
      
      console.log('🔍 VALIDATION: records present:', !!records);
      console.log('🔍 VALIDATION: records type:', typeof records);
      console.log('🔍 VALIDATION: records is array:', Array.isArray(records));
      console.log('🔍 VALIDATION: records length:', records?.length);
      console.log('🔍 VALIDATION: records length > 0:', (records?.length || 0) > 0);
    } catch (validationError) {
      console.error('💥 VALIDATION: Error during validation debugging:', validationError);
    }

    // Validate required fields and request size limits
    if (!(clinicId && records && Array.isArray(records)) || records.length === 0) {
      console.log('❌ VALIDATION: Validation failed');
      console.log('❌ VALIDATION: Failing condition - clinicId && records && Array.isArray(records):', !!(clinicId && records && Array.isArray(records)));
      console.log('❌ VALIDATION: Failing condition - records.length === 0:', records?.length === 0);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: clinicId and records array are required',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    console.log('✅ VALIDATION: Request validation passed');

    // SECURITY: Limit request size to prevent abuse
    if (records.length > 5000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Request too large: maximum 5000 records per batch',
        }),
        {
          status: 413,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Edge function uses service role - no RLS context needed for clinic validation

    const clinicQueryStart = Date.now();
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select(`
        id,
        name,
        locations:locations(
          id,
          name,
          isActive:is_active
        )
      `)
      .eq('id', clinicId)
      .single();

    const _clinicQueryTime = Date.now() - clinicQueryStart;

    if (clinicError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${clinicError.message}`,
          details: clinicError,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (!clinic) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Clinic not found',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // PHASE 1: DATA SOURCE MANAGEMENT
    // Ensure data source exists or create it
    let resolvedDataSourceId: string | null = null;
    
    if (dataSourceId) {
      console.log('Managing data source:', dataSourceId);
      
      try {
        // Check if data source already exists
        const { data: existingDataSource, error: dsQueryError } = await supabase
          .from('data_sources')
          .select('id, name, connection_status')
          .eq('id', dataSourceId)
          .maybeSingle();

        if (dsQueryError) {
          console.error('Error querying data source:', dsQueryError);
          // Continue without data source if query fails
        } else if (existingDataSource) {
          console.log('Found existing data source:', existingDataSource.name);
          resolvedDataSourceId = existingDataSource.id;
        } else {
          // Create new data source
          console.log('Creating new data source:', dataSourceId);
          
          // Use provided metadata or sensible defaults
          const spreadsheetId = body.spreadsheetId || `unknown-spreadsheet-${Date.now()}`;
          const sheetName = body.sheetName || 'Financial Data';
          const spreadsheetName = body.spreadsheetName || 'Location Financial Data';
          
          const newDataSource = {
            id: dataSourceId,
            name: spreadsheetName,
            spreadsheet_id: spreadsheetId,
            sheet_name: sheetName,
            clinic_id: clinicId,
            sync_frequency: 'manual',
            connection_status: 'active',
            access_token: 'service-role-access', // Using service role for edge function
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          console.log('🔍 DATA_SOURCE: Creating with metadata:', {
            spreadsheetId,
            sheetName,
            spreadsheetName,
            clinicId
          });

          const { data: createdDataSource, error: dsCreateError } = await supabase
            .from('data_sources')
            .insert(newDataSource)
            .select('id')
            .single();

          if (dsCreateError) {
            console.error('Failed to create data source:', dsCreateError);
            console.log('Continuing without data source reference...');
            // Continue processing without data source - set to null
            resolvedDataSourceId = null;
          } else {
            console.log('Successfully created data source:', createdDataSource.id);
            resolvedDataSourceId = createdDataSource.id;
          }
        }
      } catch (error) {
        console.error('Data source management error:', error);
        // Continue processing without data source
        resolvedDataSourceId = null;
      }
    }
    
    console.log('Resolved data source ID:', resolvedDataSourceId);

    // Create location name to ID mapping
    const locationMap = new Map<string, Location>();
    clinic.locations?.forEach((loc: any) => {
      locationMap.set(loc.name.toLowerCase().trim(), {
        id: loc.id,
        name: loc.name,
        isActive: loc.isActive,
      });
    });
    const validRecords: ValidatedFinancialData[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const _validationStart = Date.now();
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordIndex = i + 1;

      // Check for timeout every 10 records
      if (i % 10 === 0) {
        const elapsed = Date.now() - startTime;
        if (elapsed > 120000) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Processing timeout - too many records or slow processing',
              processedRecords: i,
              totalRecords: records.length,
            }),
            {
              status: 408,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }
      }

      try {
        // Validate required fields
        if (!(record.date && record.locationName)) {
          errors.push(`Record ${recordIndex}: date and locationName are required`);
          continue;
        }

        // Validate date
        const recordDate = new Date(record.date);
        if (Number.isNaN(recordDate.getTime())) {
          errors.push(`Record ${recordIndex}: invalid date format`);
          continue;
        }

        // Find location
        const locationKey = record.locationName.toLowerCase().trim();
        const location = locationMap.get(locationKey);

        if (!location) {
          errors.push(`Record ${recordIndex}: location "${record.locationName}" not found`);
          continue;
        }

        if (!location.isActive) {
          warnings.push(`Record ${recordIndex}: location "${record.locationName}" is inactive`);
        }

        // Validate numeric fields
        const production = Number.parseFloat(record.production?.toString() || '0');
        const adjustments = Number.parseFloat(record.adjustments?.toString() || '0');
        const writeOffs = Number.parseFloat(record.writeOffs?.toString() || '0');
        const patientIncome = Number.parseFloat(record.patientIncome?.toString() || '0');
        const insuranceIncome = Number.parseFloat(record.insuranceIncome?.toString() || '0');
        const unearned = record.unearned ? Number.parseFloat(record.unearned.toString()) : null;

        if (Number.isNaN(production) || production < 0) {
          errors.push(`Record ${recordIndex}: invalid production value`);
          continue;
        }

        // BUSINESS RULE VALIDATION
        if (production > 100000) {
          warnings.push(`Record ${recordIndex}: unusually high production value $${production}`);
        }

        // All financial values can be positive or negative depending on business scenarios
        // No hard constraints on positive/negative values

        // Calculate derived fields
        const netProduction = production - adjustments - writeOffs;
        const totalCollections = patientIncome + insuranceIncome;

        // Validate calculated relationships
        const calculatedNet = production - adjustments - writeOffs;
        if (Math.abs(netProduction - calculatedNet) > 0.01) {
          errors.push(`Record ${recordIndex}: netProduction calculation mismatch`);
          continue;
        }

        const calculatedTotal = patientIncome + insuranceIncome;
        if (Math.abs(totalCollections - calculatedTotal) > 0.01) {
          errors.push(`Record ${recordIndex}: totalCollections calculation mismatch`);
          continue;
        }

        // Business logic validation - collections can legitimately exceed production
        // due to timing differences, payment plans, insurance delays, etc.
        // Only flag extremely unusual ratios as potential data entry errors
        if (totalCollections > production * 2 && production > 0) {
          warnings.push(
            `Record ${recordIndex}: collections ($${totalCollections}) are more than 2x production ($${production}) - please verify data entry`
          );
        }

        // Check for existing record if not upsert mode
        if (!upsert) {
          const { data: existingRecord } = await supabase
            .from('location_financial')
            .select('id')
            .eq('clinic_id', clinicId)
            .eq('location_id', location.id)
            .eq('date', recordDate.toISOString().split('T')[0])
            .maybeSingle();

          if (existingRecord) {
            warnings.push(
              `Record ${recordIndex}: data already exists for ${record.locationName} on ${record.date}`
            );
            continue;
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
          dataSourceId: resolvedDataSourceId,
        });
      } catch (error) {
        errors.push(
          `Record ${recordIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Return validation results if there are errors or in dry run mode
    if (errors.length > 0 || dryRun) {
      return new Response(
        JSON.stringify({
          success: errors.length === 0,
          dryRun,
          validation: {
            totalRecords: records.length,
            validRecords: validRecords.length,
            errors: errors.length,
            warnings: warnings.length,
          },
          errors,
          warnings,
          ...(dryRun && { previewRecords: validRecords.slice(0, 5) }),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Process valid records with optimized batch checking
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    };

    const processedRecords: ProcessedRecord[] = [];

    if (upsert && validRecords.length > 0) {
      // PERFORMANCE FIX: Batch check for existing records
      const dateStrings = validRecords.map((item) => item.date.toISOString().split('T')[0]);
      const locationIds = [...new Set(validRecords.map((item) => item.locationId))];
      const { data: existingRecords } = await supabase
        .from('location_financial')
        .select('id,clinic_id,location_id,date')
        .eq('clinic_id', clinicId)
        .in('location_id', locationIds)
        .in('date', dateStrings);

      // Create lookup map for existing records
      const existingMap = new Map<string, string>();
      existingRecords?.forEach((record: any) => {
        // Normalize database date to YYYY-MM-DD format for consistent lookup
        const dbDate = new Date(record.date).toISOString().split('T')[0];
        const key = `${record.clinic_id}-${record.location_id}-${dbDate}`;
        existingMap.set(key, record.id);
      });

      // Process each record with batch info
      for (const item of validRecords) {
        try {
          const dateStr = item.date.toISOString().split('T')[0];
          const recordKey = `${item.clinicId}-${item.locationId}-${dateStr}`;

          const recordData = {
            clinic_id: item.clinicId,
            location_id: item.locationId,
            date: dateStr,
            production: item.production,
            adjustments: item.adjustments,
            writeOffs: item.writeOffs,
            netProduction: item.netProduction,
            patientIncome: item.patientIncome,
            insuranceIncome: item.insuranceIncome,
            totalCollections: item.totalCollections,
            unearned: item.unearned,
            data_source_id: item.dataSourceId, // Now using resolved data source ID
          };

          const existingId = existingMap.get(recordKey);

          if (existingId) {
            // Update existing record
            const { error } = await supabase
              .from('location_financial')
              .update(recordData)
              .eq('id', existingId);

            if (error) {
              console.error('Database update error:', error);
              console.error('Failed record data:', JSON.stringify(recordData, null, 2));
              throw error;
            }
            results.updated++;
          } else {
            // Insert new record - add generated ID
            const { error } = await supabase.from('location_financial').insert({
              ...recordData,
              id: generateCuid(),
              updated_at: new Date().toISOString(),
            });

            if (error) {
              console.error('Database insert error:', error);
              console.error('Failed record data:', JSON.stringify(recordData, null, 2));
              throw error;
            }
            results.created++;
          }

          processedRecords.push({
            locationName: item.locationName,
            date: item.date.toISOString().split('T')[0],
            production: item.production,
            status: 'success',
          });
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to process record for ${item.locationName} on ${item.date.toISOString().split('T')[0]}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;

          // Add error to warnings so user can see it
          warnings.push(errorMsg);
        }
      }
    } else {
      // Non-upsert mode: simple batch insert
      for (const item of validRecords) {
        try {
          const recordData = {
            clinic_id: item.clinicId,
            location_id: item.locationId,
            date: item.date.toISOString().split('T')[0],
            production: item.production,
            adjustments: item.adjustments,
            writeOffs: item.writeOffs,
            netProduction: item.netProduction,
            patientIncome: item.patientIncome,
            insuranceIncome: item.insuranceIncome,
            totalCollections: item.totalCollections,
            unearned: item.unearned,
            data_source_id: item.dataSourceId, // Now using resolved data source ID
          };

          const { error } = await supabase.from('location_financial').insert({
            ...recordData,
            id: generateCuid(),
            updated_at: new Date().toISOString(),
          });

          if (error) {
            console.error('Database insert error (non-upsert):', error);
            console.error('Failed record data:', JSON.stringify(recordData, null, 2));
            throw error;
          }

          results.created++;

          processedRecords.push({
            locationName: item.locationName,
            date: item.date.toISOString().split('T')[0],
            production: item.production,
            status: 'success',
          });
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to process record for ${item.locationName} on ${item.date.toISOString().split('T')[0]}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;

          // Add error to warnings so user can see it
          warnings.push(errorMsg);
        }
      }
    }

    // PHASE 3: UPDATE DATA SOURCE SYNC METADATA
    if (resolvedDataSourceId && results.created + results.updated > 0) {
      try {
        console.log('Updating data source sync timestamp:', resolvedDataSourceId);
        const { error: syncUpdateError } = await supabase
          .from('data_sources')
          .update({ 
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', resolvedDataSourceId);
          
        if (syncUpdateError) {
          console.error('Failed to update data source sync timestamp:', syncUpdateError);
        } else {
          console.log('Successfully updated data source sync timestamp');
        }
      } catch (error) {
        console.error('Error updating data source metadata:', error);
      }
    }

    const totalTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Import completed successfully',
        results,
        warnings,
        processedRecords: processedRecords.slice(0, 10),
        totalProcessed: processedRecords.length,
        executionTime: totalTime,
        dataSource: {
          id: resolvedDataSourceId,
          name: resolvedDataSourceId ? 'Google Sheets Location Financial Sync' : null,
          status: resolvedDataSourceId ? 'active' : 'not_configured',
        },
        audit: {
          clinicId,
          syncedAt: new Date().toISOString(),
          recordsProcessed: processedRecords.length,
          dataSourceUsed: !!resolvedDataSourceId,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error('💥 FATAL ERROR: Unhandled exception in edge function');
    console.error('💥 ERROR TYPE:', typeof error);
    console.error('💥 ERROR INSTANCEOF Error:', error instanceof Error);
    console.error('💥 ERROR MESSAGE:', error instanceof Error ? error.message : String(error));
    console.error('💥 ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('💥 ERROR FULL OBJECT:', JSON.stringify(error, null, 2));
    console.error('💥 EXECUTION TIME:', totalTime, 'ms');

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to import location financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        executionTime: totalTime,
        debugInfo: {
          errorType: typeof error,
          errorString: String(error),
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

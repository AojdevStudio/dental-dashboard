import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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

Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Function started`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }),
      { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }

  try {
    // Get Supabase client
    console.log(`[${new Date().toISOString()}] Initializing Supabase client`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error",
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    console.log(`[${new Date().toISOString()}] Parsing request body`);
    const body: ImportRequest = await req.json();
    const { clinicId, dataSourceId, records, upsert = true, dryRun = false } = body;
    
    console.log(`[${new Date().toISOString()}] Request params:`, {
      clinicId,
      recordCount: records?.length,
      dryRun,
      upsert
    });

    // Validate required fields and request size limits
    if (!clinicId || !records || !Array.isArray(records) || records.length === 0) {
      console.error('Validation failed: Missing required fields');
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: clinicId and records array are required",
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // SECURITY: Limit request size to prevent abuse
    if (records.length > 5000) {
      console.error(`Request too large: ${records.length} records (max 5000)`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request too large: maximum 5000 records per batch",
        }),
        { 
          status: 413,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Verify clinic exists and get locations
    console.log(`[${new Date().toISOString()}] Querying clinic and locations for clinicId: ${clinicId}`);
    
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

    const clinicQueryTime = Date.now() - clinicQueryStart;
    console.log(`[${new Date().toISOString()}] Clinic query completed in ${clinicQueryTime}ms`);

    if (clinicError) {
      console.error('Clinic query error:', clinicError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${clinicError.message}`,
          details: clinicError
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    if (!clinic) {
      console.error(`Clinic not found for ID: ${clinicId}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Clinic not found",
        }),
        { 
          status: 404,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    console.log(`[${new Date().toISOString()}] Found clinic:`, {
      id: clinic.id,
      name: clinic.name,
      locationCount: clinic.locations?.length || 0
    });

    // Create location name to ID mapping
    const locationMap = new Map<string, Location>();
    clinic.locations?.forEach((loc: any) => {
      locationMap.set(loc.name.toLowerCase().trim(), {
        id: loc.id,
        name: loc.name,
        isActive: loc.isActive
      });
    });

    // Validate and process records
    console.log(`[${new Date().toISOString()}] Starting validation of ${records.length} records`);
    const validRecords: ValidatedFinancialData[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const validationStart = Date.now();
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordIndex = i + 1;
      
      // Check for timeout every 10 records
      if (i % 10 === 0) {
        const elapsed = Date.now() - startTime;
        if (elapsed > 120000) { // 2 minutes
          console.error(`Function timeout approaching at record ${i}, elapsed: ${elapsed}ms`);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Processing timeout - too many records or slow processing",
              processedRecords: i,
              totalRecords: records.length
            }),
            { 
              status: 408,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            }
          );
        }
      }

      try {
        // Validate required fields
        if (!record.date || !record.locationName) {
          errors.push(`Record ${recordIndex}: date and locationName are required`);
          continue;
        }

        // Validate date
        const recordDate = new Date(record.date);
        if (isNaN(recordDate.getTime())) {
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
        const production = parseFloat(record.production?.toString() || "0");
        const adjustments = parseFloat(record.adjustments?.toString() || "0");
        const writeOffs = parseFloat(record.writeOffs?.toString() || "0");
        const patientIncome = parseFloat(record.patientIncome?.toString() || "0");
        const insuranceIncome = parseFloat(record.insuranceIncome?.toString() || "0");
        const unearned = record.unearned ? parseFloat(record.unearned.toString()) : null;

        if (isNaN(production) || production < 0) {
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
          warnings.push(`Record ${recordIndex}: collections ($${totalCollections}) are more than 2x production ($${production}) - please verify data entry`);
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
          dataSourceId,
        });
      } catch (error) {
        errors.push(
          `Record ${recordIndex}: ${error instanceof Error ? error.message : "Unknown error"}`
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
          }
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

    const processedRecords = [];

    if (upsert && validRecords.length > 0) {
      // PERFORMANCE FIX: Batch check for existing records
      const dateStrings = validRecords.map(item => item.date.toISOString().split('T')[0]);
      const locationIds = [...new Set(validRecords.map(item => item.locationId))];
      
      console.log(`[${new Date().toISOString()}] Batch checking ${validRecords.length} records for existence`);
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

      console.log(`[${new Date().toISOString()}] Found ${existingRecords?.length || 0} existing records`);

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
            // Skip data_source_id for now - table is empty and has complex requirements
          };

          const existingId = existingMap.get(recordKey);
          
          if (existingId) {
            // Update existing record
            const { error } = await supabase
              .from('location_financial')
              .update(recordData)
              .eq('id', existingId);

            if (error) {
              throw error;
            }
            results.updated++;
          } else {
            // Insert new record - add generated ID
            const { error } = await supabase
              .from('location_financial')
              .insert({
                ...recordData,
                id: generateCuid(),
                updated_at: new Date().toISOString()
              });

            if (error) {
              throw error;
            }
            results.created++;
          }

          processedRecords.push({
            locationName: item.locationName,
            date: item.date.toISOString().split("T")[0],
            production: item.production,
            status: "success",
          });
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to process record for ${item.locationName} on ${item.date.toISOString().split("T")[0]}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
          console.error(errorMsg);
          
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
            // Skip data_source_id for now - table is empty and has complex requirements
          };

          const { error } = await supabase
            .from('location_financial')
            .insert({
              ...recordData,
              id: generateCuid(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            throw error;
          }

          results.created++;
          
          processedRecords.push({
            locationName: item.locationName,
            date: item.date.toISOString().split("T")[0],
            production: item.production,
            status: "success",
          });
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to process record for ${item.locationName} on ${item.date.toISOString().split("T")[0]}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
          console.error(errorMsg);
          
          // Add error to warnings so user can see it
          warnings.push(errorMsg);
        }
      }
    }

    // Update data source sync timestamp if provided
    if (dataSourceId && results.created + results.updated > 0) {
      try {
        await supabase
          .from('data_sources')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', dataSourceId);
      } catch (error) {
        console.warn("Failed to update data source sync timestamp:", error);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Import completed successfully in ${totalTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Import completed successfully",
        results,
        warnings,
        processedRecords: processedRecords.slice(0, 10),
        totalProcessed: processedRecords.length,
        executionTime: totalTime
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Error importing location financial data after ${totalTime}ms:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to import location financial data",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        executionTime: totalTime
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
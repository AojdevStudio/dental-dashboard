import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request body
    const body: ImportRequest = await req.json();
    const { clinicId, dataSourceId, records, upsert = true, dryRun = false } = body;

    // Validate required fields
    if (!clinicId || !records || !Array.isArray(records) || records.length === 0) {
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

    // Verify clinic exists and get locations
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

    if (clinicError || !clinic) {
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

    // Create location name to ID mapping
    const locationMap = new Map<string, Location>();
    clinic.locations?.forEach((loc: any) => {
      locationMap.set(loc.name.toLowerCase(), {
        id: loc.id,
        name: loc.name,
        isActive: loc.isActive
      });
    });

    // Validate and process records
    const validRecords: ValidatedFinancialData[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const recordIndex = i + 1;

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

        // Calculate derived fields
        const netProduction = production - adjustments - writeOffs;
        const totalCollections = patientIncome + insuranceIncome;

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

    // Process valid records
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    };

    const processedRecords = [];

    for (const item of validRecords) {
      try {
        const recordData = {
          clinic_id: item.clinicId,
          location_id: item.locationId,
          date: item.date.toISOString().split('T')[0],
          production: item.production,
          adjustments: item.adjustments,
          write_offs: item.writeOffs,
          net_production: item.netProduction,
          patient_income: item.patientIncome,
          insurance_income: item.insuranceIncome,
          total_collections: item.totalCollections,
          unearned: item.unearned,
          ...(item.dataSourceId && { data_source_id: item.dataSourceId }),
        };

        if (upsert) {
          // Use upsert functionality
          const { data: result, error } = await supabase
            .from('location_financial')
            .upsert(recordData, {
              onConflict: 'clinic_id,location_id,date',
              ignoreDuplicates: false
            })
            .select('created_at, updated_at')
            .single();

          if (error) {
            throw error;
          }

          // Determine if this was a create or update
          // This is a simplified check - in a real scenario you might want more sophisticated logic
          const timeDiff = result ? Math.abs(new Date(result.updated_at).getTime() - new Date(result.created_at).getTime()) : 0;
          if (timeDiff <= 1000) {
            results.created++;
          } else {
            results.updated++;
          }
        } else {
          const { error } = await supabase
            .from('location_financial')
            .insert(recordData);

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
        console.error(
          `Failed to process record for ${item.locationName} on ${item.date.toISOString().split("T")[0]}:`,
          error
        );
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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Import completed successfully",
        results,
        warnings,
        processedRecords: processedRecords.slice(0, 10),
        totalProcessed: processedRecords.length,
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
    console.error("Error importing location financial data:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to import location financial data",
        details: error instanceof Error ? error.message : "Unknown error",
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
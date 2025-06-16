import type { ImportRecord } from '@/lib/services/financial/financial-validator';
import {
  FinancialImportPipeline,
  type ImportOptions,
} from '@/lib/services/financial/import-pipeline';
import { type NextRequest, NextResponse } from 'next/server';

interface ImportRequest {
  clinicId: string;
  dataSourceId?: string;
  records: ImportRecord[];
  upsert?: boolean; // Whether to update existing records
  dryRun?: boolean; // Test import without saving
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json();
    const { clinicId, dataSourceId, records, upsert = true, dryRun = false } = body;

    // Basic validation
    if (!(clinicId && records && Array.isArray(records)) || records.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: clinicId and records array are required',
        },
        { status: 400 }
      );
    }

    // Set up import options
    const options: ImportOptions = {
      clinicId,
      dataSourceId,
      upsert,
      dryRun,
    };

    // Execute import pipeline
    const importPipeline = new FinancialImportPipeline();
    const result = await importPipeline.execute(records, options);

    // Build response based on result
    if (result.dryRun) {
      return NextResponse.json({
        success: result.success,
        dryRun: true,
        validation: {
          totalRecords: result.validation.totalRecords,
          validRecords: result.validation.validCount,
          errors: result.validation.errors.length,
          warnings: result.validation.warnings.length,
        },
        errors: result.validation.errors,
        warnings: result.validation.warnings,
        previewRecords: result.validation.validRecords.slice(0, 5), // Show first 5 records in preview
      });
    }

    // If validation failed, return errors
    if (!result.validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: result.validation.errors,
          warnings: result.validation.warnings,
        },
        { status: 400 }
      );
    }

    // Return success result
    return NextResponse.json({
      success: true,
      message: result.message,
      results: result.processing,
      warnings: result.validation.warnings,
      processedRecords: result.processing?.processedRecords.slice(0, 10), // Return first 10 for confirmation
      totalProcessed: result.processing?.processedRecords.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import location financial data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

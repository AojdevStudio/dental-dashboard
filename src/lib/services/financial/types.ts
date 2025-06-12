import type { Clinic, DataSource, Location, LocationFinancial } from '@prisma/client';

export interface CreateFinancialData {
  clinicId: string;
  locationId: string;
  date: Date;
  production: number;
  adjustments: number;
  writeOffs: number;
  patientIncome: number;
  insuranceIncome: number;
  unearned?: number | null;
  dataSourceId?: string;
}

export interface UpdateFinancialData {
  production?: number;
  adjustments?: number;
  writeOffs?: number;
  patientIncome?: number;
  insuranceIncome?: number;
  unearned?: number | null;
  dataSourceId?: string;
}

export interface UpsertFinancialData extends CreateFinancialData {}

export interface FinancialFilters {
  clinicId?: string;
  locationId?: string;
  locationIds?: string[];
  startDate?: Date;
  endDate?: Date;
  dataSourceId?: string;
}

export interface DerivedFields {
  netProduction: number;
  totalCollections: number;
  collectionRate?: number;
  adjustmentRate?: number;
  writeOffRate?: number;
}

export interface FinancialRecordWithDetails extends LocationFinancial {
  location: Location & {
    clinic: Pick<Clinic, 'id' | 'name'>;
  };
  dataSource?: Pick<DataSource, 'id' | 'name' | 'lastSyncedAt'> | null;
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SummaryData {
  totalProduction: number;
  totalCollections: number;
  totalAdjustments: number;
  totalWriteOffs: number;
  netProduction: number;
  collectionRate: number;
  recordCount: number;
  dateRange: DateRange;
}

export interface AggregatedFinancialData {
  period: string;
  production: number;
  collections: number;
  adjustments: number;
  writeOffs: number;
  netProduction: number;
  collectionRate: number;
  recordCount: number;
}

export interface ProcessingResult {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

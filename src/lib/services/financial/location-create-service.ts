import { prisma } from '@/lib/database/client';

export interface CreateLocationFinancialData {
  clinicId: string;
  locationId: string;
  date: string;
  production: number | string;
  adjustments?: number | string;
  writeOffs?: number | string;
  patientIncome?: number | string;
  insuranceIncome?: number | string;
  unearned?: number | string;
  dataSourceId?: string;
  createdBy?: string;
}

export class LocationFinancialCreateService {
  async create(data: CreateLocationFinancialData) {
    // Validate required fields
    this.validateRequiredFields(data);

    // Verify clinic and location
    await this.verifyClinicAndLocation(data.clinicId, data.locationId);

    // Check for existing record
    await this.checkExistingRecord(data.clinicId, data.locationId, data.date);

    // Calculate derived fields
    const financialMetrics = this.calculateFinancialMetrics(data);

    // Create the record
    return this.createFinancialRecord(data, financialMetrics);
  }

  private validateRequiredFields(data: CreateLocationFinancialData): void {
    if (!(data.clinicId && data.locationId && data.date) || data.production === undefined) {
      throw new Error(
        'Missing required fields: clinicId, locationId, date, and production are required'
      );
    }
  }

  private async verifyClinicAndLocation(clinicId: string, locationId: string): Promise<void> {
    const [clinic, location] = await Promise.all([
      prisma.clinic.findUnique({ where: { id: clinicId } }),
      prisma.location.findUnique({ where: { id: locationId } }),
    ]);

    if (!clinic) {
      throw new Error('Clinic not found');
    }

    if (!location) {
      throw new Error('Location not found');
    }

    if (location.clinicId !== clinicId) {
      throw new Error('Location does not belong to the specified clinic');
    }
  }

  private async checkExistingRecord(
    clinicId: string,
    locationId: string,
    date: string
  ): Promise<void> {
    const existingRecord = await prisma.locationFinancial.findFirst({
      where: {
        clinicId,
        locationId,
        date: new Date(date),
      },
    });

    if (existingRecord) {
      throw new Error(
        'Financial data already exists for this location and date. Use PUT to update.'
      );
    }
  }

  private calculateFinancialMetrics(data: CreateLocationFinancialData) {
    const production = Number.parseFloat(data.production.toString());
    const adjustments = Number.parseFloat((data.adjustments || '0').toString());
    const writeOffs = Number.parseFloat((data.writeOffs || '0').toString());
    const patientIncome = Number.parseFloat((data.patientIncome || '0').toString());
    const insuranceIncome = Number.parseFloat((data.insuranceIncome || '0').toString());

    return {
      production,
      adjustments,
      writeOffs,
      netProduction: production - adjustments - writeOffs,
      patientIncome,
      insuranceIncome,
      totalCollections: patientIncome + insuranceIncome,
      unearned: data.unearned ? Number.parseFloat(data.unearned.toString()) : null,
    };
  }

  private async createFinancialRecord(
    data: CreateLocationFinancialData,
    metrics: ReturnType<typeof this.calculateFinancialMetrics>
  ) {
    return await prisma.locationFinancial.create({
      data: {
        clinicId: data.clinicId,
        locationId: data.locationId,
        date: new Date(data.date),
        production: metrics.production,
        adjustments: metrics.adjustments,
        writeOffs: metrics.writeOffs,
        netProduction: metrics.netProduction,
        patientIncome: metrics.patientIncome,
        insuranceIncome: metrics.insuranceIncome,
        totalCollections: metrics.totalCollections,
        unearned: metrics.unearned,
        dataSourceId: data.dataSourceId || null,
        createdBy: data.createdBy || null,
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }
}

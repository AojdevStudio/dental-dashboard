import { useMemo } from 'react';
import type { ChartDataPoint } from '../lib/types/charts';
import type { KPIData } from '../lib/types/kpi';
import { calculateTrend, formatCurrency } from '../lib/utils/chart-helpers';

interface UseDashboardKPIParams {
  revenueData: ChartDataPoint[];
  appointmentsData: ChartDataPoint[];
  patientsData: ChartDataPoint[];
  goals?: {
    weeklyRevenue?: number;
    weeklyPatients?: number;
  };
}

export function useDashboardKPI({
  revenueData,
  appointmentsData,
  patientsData,
  goals = {},
}: UseDashboardKPIParams): KPIData[] {
  return useMemo(() => {
    // Revenue calculations
    const currentRevenue = revenueData.slice(-7).reduce((sum, d) => sum + d.value, 0);
    const previousRevenue = revenueData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
    const revenueTrend = calculateTrend(currentRevenue, previousRevenue);

    // Appointments calculations
    const currentAppointments = appointmentsData.slice(-7).reduce((sum, d) => sum + d.value, 0);
    const previousAppointments = appointmentsData
      .slice(-14, -7)
      .reduce((sum, d) => sum + d.value, 0);
    const appointmentsTrend = calculateTrend(currentAppointments, previousAppointments);

    // Patients calculations
    const currentPatients = patientsData.slice(-7).reduce((sum, d) => sum + d.value, 0);
    const previousPatients = patientsData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
    const patientsTrend = calculateTrend(currentPatients, previousPatients);

    // Default goal values
    const weeklyRevenueTarget = goals.weeklyRevenue || 100000;
    const weeklyPatientsTarget = goals.weeklyPatients || 150;

    return [
      {
        id: 'revenue',
        title: 'Weekly Revenue',
        value: formatCurrency(currentRevenue),
        trend: {
          direction: revenueTrend.direction,
          value: currentRevenue - previousRevenue,
          percentage: revenueTrend.percentage,
        },
        comparison: {
          period: 'week',
          previousValue: formatCurrency(previousRevenue),
        },
        goal: {
          value: weeklyRevenueTarget,
          progress: Math.min((currentRevenue / weeklyRevenueTarget) * 100, 100),
          label: 'Weekly Target',
        },
      },
      {
        id: 'appointments',
        title: 'Weekly Appointments',
        value: currentAppointments,
        unit: 'appointments',
        trend: {
          direction: appointmentsTrend.direction,
          value: currentAppointments - previousAppointments,
          percentage: appointmentsTrend.percentage,
        },
        comparison: {
          period: 'week',
          previousValue: previousAppointments,
        },
      },
      {
        id: 'patients',
        title: 'New Patients',
        value: currentPatients,
        unit: 'patients',
        trend: {
          direction: patientsTrend.direction,
          value: currentPatients - previousPatients,
          percentage: patientsTrend.percentage,
        },
        comparison: {
          period: 'week',
          previousValue: previousPatients,
        },
        goal: {
          value: weeklyPatientsTarget,
          progress: Math.min((currentPatients / weeklyPatientsTarget) * 100, 100),
          label: 'Weekly Target',
        },
      },
      {
        id: 'utilization',
        title: 'Chair Utilization',
        value: '78%',
        trend: {
          direction: 'up',
          value: 5,
          percentage: 6.8,
        },
        comparison: {
          period: 'week',
          previousValue: '73%',
        },
      },
    ];
  }, [revenueData, appointmentsData, patientsData, goals]);
}

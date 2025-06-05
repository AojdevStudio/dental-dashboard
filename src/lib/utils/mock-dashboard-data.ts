/**
 * Generates mock data for the dashboard
 * @returns Object containing mock data for revenue, appointments, patients, and treatments
 */
import { generateMockChartData } from "@/hooks/use-chart-data";
import type { ChartDataPoint } from "@/lib/types/charts";

export interface DashboardMockData {
  revenueData: ChartDataPoint[];
  appointmentsData: ChartDataPoint[];
  patientsData: ChartDataPoint[];
  treatmentsData: ChartDataPoint[];
}

export function generateDashboardMockData(): DashboardMockData {
  return {
    revenueData: generateMockChartData("revenue", 30),
    appointmentsData: generateMockChartData("appointments", 30),
    patientsData: generateMockChartData("patients", 30),
    treatmentsData: generateMockChartData("treatments", 7),
  };
}

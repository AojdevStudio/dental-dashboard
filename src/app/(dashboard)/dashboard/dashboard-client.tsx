"use client";

import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/generated/prisma";
import { generateMockChartData, useChartData } from "@/hooks/use-chart-data";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import type { ChartConfig } from "@/lib/types/charts";
import type { DashboardComponent } from "@/lib/types/dashboard";
import type { KPIData } from "@/lib/types/kpi";
import { calculateTrend, formatCurrency } from "@/lib/utils/chart-helpers";
import { Plus, RefreshCw, Settings } from "lucide-react";
import { useEffect, useState } from "react";

// Type for clinic with counts
type ClinicWithCounts = Prisma.ClinicGetPayload<{
  select: {
    id: true;
    name: true;
    location: true;
    _count: {
      select: {
        users: true;
        providers: true;
        metrics: true;
      };
    };
  };
}>;

interface DashboardClientProps {
  initialData: {
    clinic: ClinicWithCounts | null;
    isSystemAdmin: boolean;
    selectedClinicId: string;
    userId: string;
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { clinic } = initialData;
  const [refreshing, setRefreshing] = useState(false);

  // Mock data generation for demonstration
  const revenueData = generateMockChartData("revenue", 30);
  const appointmentsData = generateMockChartData("appointments", 30);
  const patientsData = generateMockChartData("patients", 30);
  const treatmentsData = generateMockChartData("treatments", 7);

  // Calculate KPI values from mock data
  const currentRevenue = revenueData.slice(-7).reduce((sum, d) => sum + d.value, 0);
  const previousRevenue = revenueData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
  const revenueTrend = calculateTrend(currentRevenue, previousRevenue);

  const currentAppointments = appointmentsData.slice(-7).reduce((sum, d) => sum + d.value, 0);
  const previousAppointments = appointmentsData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
  const appointmentsTrend = calculateTrend(currentAppointments, previousAppointments);

  const currentPatients = patientsData.slice(-7).reduce((sum, d) => sum + d.value, 0);
  const previousPatients = patientsData.slice(-14, -7).reduce((sum, d) => sum + d.value, 0);
  const patientsTrend = calculateTrend(currentPatients, previousPatients);

  // KPI Data
  const kpiData: KPIData[] = [
    {
      id: "revenue",
      title: "Weekly Revenue",
      value: formatCurrency(currentRevenue),
      trend: {
        direction: revenueTrend.direction,
        value: currentRevenue - previousRevenue,
        percentage: revenueTrend.percentage,
      },
      comparison: {
        period: "week",
        previousValue: formatCurrency(previousRevenue),
      },
      goal: {
        value: 100000,
        progress: Math.min((currentRevenue / 100000) * 100, 100),
        label: "Weekly Target",
      },
    },
    {
      id: "appointments",
      title: "Weekly Appointments",
      value: currentAppointments,
      unit: "appointments",
      trend: {
        direction: appointmentsTrend.direction,
        value: currentAppointments - previousAppointments,
        percentage: appointmentsTrend.percentage,
      },
      comparison: {
        period: "week",
        previousValue: previousAppointments,
      },
    },
    {
      id: "patients",
      title: "New Patients",
      value: currentPatients,
      unit: "patients",
      trend: {
        direction: patientsTrend.direction,
        value: currentPatients - previousPatients,
        percentage: patientsTrend.percentage,
      },
      comparison: {
        period: "week",
        previousValue: previousPatients,
      },
      goal: {
        value: 150,
        progress: Math.min((currentPatients / 150) * 100, 100),
        label: "Weekly Target",
      },
    },
    {
      id: "utilization",
      title: "Chair Utilization",
      value: "78%",
      trend: {
        direction: "up",
        value: 5,
        percentage: 6.8,
      },
      comparison: {
        period: "week",
        previousValue: "73%",
      },
    },
  ];

  // Chart configurations
  const revenueChartConfig: ChartConfig = {
    type: "line",
    data: revenueData,
    series: [{ dataKey: "value", name: "Revenue", color: "#3B82F6" }],
    xAxisKey: "date",
    height: 300,
  };

  const appointmentsChartConfig: ChartConfig = {
    type: "bar",
    data: appointmentsData.slice(-7),
    series: [{ dataKey: "value", name: "Appointments", color: "#10B981" }],
    xAxisKey: "name",
    height: 300,
  };

  const treatmentMixConfig: ChartConfig = {
    type: "pie",
    data: [
      { name: "Cleanings", value: 35 },
      { name: "Fillings", value: 25 },
      { name: "Crowns", value: 20 },
      { name: "Extractions", value: 12 },
      { name: "Other", value: 8 },
    ],
    height: 300,
  };

  const patientGrowthConfig: ChartConfig = {
    type: "area",
    data: patientsData,
    series: [{ dataKey: "value", name: "Total Patients", color: "#8B5CF6" }],
    xAxisKey: "date",
    height: 300,
  };

  // Dashboard components
  const dashboardComponents: DashboardComponent[] = [
    // KPI Cards
    ...kpiData.map((kpi, index) => ({
      id: `kpi-${kpi.id}`,
      type: "kpi" as const,
      title: kpi.title,
      size: "small" as const,
      data: kpi,
      visible: true,
    })),
    // Charts
    {
      id: "revenue-chart",
      type: "chart",
      title: "Revenue Trend",
      description: "Daily revenue over the last 30 days",
      size: "large",
      data: revenueChartConfig,
      visible: true,
    },
    {
      id: "appointments-chart",
      type: "chart",
      title: "Weekly Appointments",
      description: "Appointment volume by day",
      size: "medium",
      data: appointmentsChartConfig,
      visible: true,
    },
    {
      id: "treatment-mix",
      type: "chart",
      title: "Treatment Mix",
      description: "Distribution of treatments performed",
      size: "medium",
      data: treatmentMixConfig,
      visible: true,
    },
    {
      id: "patient-growth",
      type: "chart",
      title: "Patient Growth",
      description: "New patient acquisition trend",
      size: "full",
      data: patientGrowthConfig,
      visible: true,
    },
  ];

  // Initialize dashboard layout
  const layout = useDashboardLayout({
    initialLayout: {
      id: "default",
      name: "Default Dashboard",
      description: "Standard dashboard layout",
      components: dashboardComponents,
      gridCols: { xs: 1, sm: 2, md: 3, lg: 4 },
      rowHeight: 100,
      compactType: "vertical",
      preventCollision: false,
      isResizable: true,
      isDraggable: true,
      margin: [16, 16],
      containerPadding: [0, 0],
      useCSSTransforms: true,
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would refetch data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={layout.toggleEditMode}>
            <Settings className="h-4 w-4 mr-2" />
            {layout.isEditing ? "Done Editing" : "Edit Layout"}
          </Button>
        </div>
        {layout.isEditing && (
          <Button
            size="sm"
            onClick={() => {
              // In a real app, this would open a modal to add components
              console.log("Add component");
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        )}
      </div>

      {/* Dashboard Grid */}
      <DashboardGrid
        layout={layout.activeLayout!}
        onLayoutChange={layout.updateLayout}
        onComponentRemove={layout.removeComponent}
        editMode={layout.isEditing}
      />
    </div>
  );
}

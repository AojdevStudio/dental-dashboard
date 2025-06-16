'use client';

import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { Button } from '@/components/ui/button';
import { useDashboardKPI } from '@/hooks/use-dashboard-kpi';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import type { ChartConfig } from '@/lib/types/charts';
import type { DashboardComponent } from '@/lib/types/dashboard';
import { generateDashboardMockData } from '@/lib/utils/mock-dashboard-data';
import type { Prisma } from '@prisma/client';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { useState } from 'react';

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
  const { clinic: _clinic } = initialData;
  const [refreshing, setRefreshing] = useState(false);

  // Generate mock data
  const {
    revenueData,
    appointmentsData,
    patientsData,
    treatmentsData: _treatmentsData,
  } = generateDashboardMockData();

  // Calculate KPI data using custom hook
  const kpiData = useDashboardKPI({
    revenueData,
    appointmentsData,
    patientsData,
    goals: {
      weeklyRevenue: 100000,
      weeklyPatients: 150,
    },
  });

  // Chart configurations
  const revenueChartConfig: ChartConfig = {
    type: 'line',
    data: revenueData,
    series: [{ dataKey: 'value', name: 'Revenue', color: '#3B82F6' }],
    xAxisKey: 'date',
    height: 300,
  };

  const appointmentsChartConfig: ChartConfig = {
    type: 'bar',
    data: appointmentsData.slice(-7),
    series: [{ dataKey: 'value', name: 'Appointments', color: '#10B981' }],
    xAxisKey: 'name',
    height: 300,
  };

  const treatmentMixConfig: ChartConfig = {
    type: 'pie',
    data: [
      { name: 'Cleanings', value: 35 },
      { name: 'Fillings', value: 25 },
      { name: 'Crowns', value: 20 },
      { name: 'Extractions', value: 12 },
      { name: 'Other', value: 8 },
    ],
    height: 300,
  };

  const patientGrowthConfig: ChartConfig = {
    type: 'area',
    data: patientsData,
    series: [{ dataKey: 'value', name: 'Total Patients', color: '#8B5CF6' }],
    xAxisKey: 'date',
    height: 300,
  };

  // Dashboard components
  const dashboardComponents: DashboardComponent[] = [
    // KPI Cards
    ...kpiData.map((kpi, _index) => ({
      id: `kpi-${kpi.id}`,
      type: 'kpi' as const,
      title: kpi.title,
      size: 'medium' as const,
      data: kpi,
      visible: true,
    })),
    // Charts
    {
      id: 'revenue-chart',
      type: 'chart',
      title: 'Revenue Trend',
      description: 'Daily revenue over the last 30 days',
      size: 'large',
      data: revenueChartConfig,
      visible: true,
    },
    {
      id: 'appointments-chart',
      type: 'chart',
      title: 'Weekly Appointments',
      description: 'Appointment volume by day',
      size: 'medium',
      data: appointmentsChartConfig,
      visible: true,
    },
    {
      id: 'treatment-mix',
      type: 'chart',
      title: 'Treatment Mix',
      description: 'Distribution of treatments performed',
      size: 'medium',
      data: treatmentMixConfig,
      visible: true,
    },
    {
      id: 'patient-growth',
      type: 'chart',
      title: 'Patient Growth',
      description: 'New patient acquisition trend',
      size: 'full',
      data: patientGrowthConfig,
      visible: true,
    },
  ];

  // Initialize dashboard layout
  const layout = useDashboardLayout({
    initialLayout: {
      id: 'default',
      name: 'Default Dashboard',
      description: 'Standard dashboard layout',
      components: dashboardComponents,
      gridCols: { xs: 1, sm: 2, md: 4, lg: 4 },
      rowHeight: 200,
      compactType: 'vertical',
      preventCollision: false,
      isResizable: true,
      isDraggable: true,
      margin: [24, 24],
      containerPadding: [16, 16],
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
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={layout.toggleEditMode}>
            <Settings className="h-4 w-4 mr-2" />
            {layout.isEditing ? 'Done Editing' : 'Edit Layout'}
          </Button>
        </div>
        {layout.isEditing && (
          <Button size="sm" onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        )}
      </div>

      {/* Dashboard Grid */}
      {layout.activeLayout && (
        <DashboardGrid
          layout={layout.activeLayout}
          onLayoutChange={layout.updateLayout}
          onComponentRemove={layout.removeComponent}
          editMode={layout.isEditing}
        />
      )}
    </div>
  );
}

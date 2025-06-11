'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardComponent, DashboardGridProps } from '@/lib/types/dashboard';
import { cn } from '@/lib/utils';
import {
  getResponsiveValue,
  isMobile,
  isTablet,
  useBreakpoint,
} from '@/lib/utils/responsive-helpers';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Grip, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AreaChart } from './charts/area-chart';
import { BarChart } from './charts/bar-chart';
import { LineChart } from './charts/line-chart';
import { PieChart } from './charts/pie-chart';
import { KPICard } from './kpi-card';

export function DashboardGrid({
  layout,
  onLayoutChange,
  onComponentResize,
  onComponentRemove,
  onComponentAdd,
  loading = false,
  error = null,
  className,
  editMode = false,
}: DashboardGridProps) {
  const breakpoint = useBreakpoint();
  const mobile = isMobile(breakpoint);
  const _tablet = isTablet(breakpoint);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getComponentSize = (component: DashboardComponent): { width: number; height: number } => {
    const gridCols =
      typeof layout.gridCols === 'number'
        ? layout.gridCols
        : getResponsiveValue(breakpoint, layout.gridCols, 12);

    const sizeMap = {
      small: { w: mobile ? gridCols : Math.floor(gridCols / 4), h: 2 },
      medium: { w: mobile ? gridCols : Math.floor(gridCols / 2), h: 3 },
      large: { w: mobile ? gridCols : Math.floor(gridCols * 0.75), h: 4 },
      full: { w: gridCols, h: 4 },
    };

    const size = sizeMap[component.size];
    return {
      width: size.w,
      height: size.h,
    };
  };

  const renderComponent = (component: DashboardComponent) => {
    if (!component.visible) {
      return null;
    }

    const componentContent = () => {
      switch (component.type) {
        case 'chart': {
          const chartConfig = component.data;
          if (!chartConfig) {
            return null;
          }

          switch (chartConfig.type) {
            case 'line':
              return (
                <LineChart
                  config={chartConfig}
                  title={component.title}
                  subtitle={component.description}
                />
              );
            case 'bar':
              return (
                <BarChart
                  config={chartConfig}
                  title={component.title}
                  subtitle={component.description}
                />
              );
            case 'pie':
            case 'doughnut':
              return (
                <PieChart
                  config={chartConfig}
                  title={component.title}
                  subtitle={component.description}
                  isDoughnut={chartConfig.type === 'doughnut'}
                />
              );
            case 'area':
              return (
                <AreaChart
                  config={chartConfig}
                  title={component.title}
                  subtitle={component.description}
                />
              );
            default:
              return null;
          }
        }

        case 'kpi': {
          return <KPICard data={component.data} />;
        }

        case 'custom': {
          // Placeholder for custom components
          return (
            <div class="flex items-center justify-center h-full bg-muted/10 rounded-lg">
              <p class="text-muted-foreground">Custom Component</p>
            </div>
          );
        }

        default: {
          return null;
        }
      }
    };

    return (
      <motion.div
        key={component.id}
        layout={true}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        class={cn('relative group', editMode && 'cursor-move')}
        style={{
          gridColumn: `span ${getComponentSize(component).width}`,
          gridRow: `span ${getComponentSize(component).height}`,
        }}
      >
        {editMode && (
          <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              class="h-6 w-6"
              onClick={() => onComponentRemove?.(component.id)}
            >
              <X class="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" class="h-6 w-6 cursor-move">
              <Grip class="h-3 w-3" />
            </Button>
          </div>
        )}
        {componentContent()}
      </motion.div>
    );
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div class={cn('p-4', className)}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...new Array(6)].map((_, i) => (
            <Skeleton key={i} class="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class={cn('p-4', className)}>
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{error.message || 'Failed to load dashboard'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const gridCols =
    typeof layout.gridCols === 'number'
      ? layout.gridCols
      : getResponsiveValue(breakpoint, layout.gridCols, 12);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gridAutoRows: `${layout.rowHeight}px`,
    gap: '64px',
    padding: '24px',
  };

  return (
    <div class={cn('w-full h-full', className)}>
      <div style={gridStyle}>
        <AnimatePresence>
          {layout.components.filter((c) => c.visible !== false).map(renderComponent)}
        </AnimatePresence>
      </div>
    </div>
  );
}

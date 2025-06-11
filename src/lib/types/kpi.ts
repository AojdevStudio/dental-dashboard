export type TrendDirection = 'up' | 'down' | 'neutral';
export type ComparisonPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface KPIData {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: {
    direction: TrendDirection;
    value: number;
    percentage: number;
  };
  comparison?: {
    period: ComparisonPeriod;
    previousValue: number | string;
    customPeriodLabel?: string;
  };
  goal?: {
    value: number;
    progress: number;
    label?: string;
  };
  lastUpdated?: Date | string;
  dataSource?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface KPICardProps {
  data: KPIData;
  variant?: 'default' | 'compact' | 'detailed';
  colorScheme?: 'default' | 'success' | 'warning' | 'error';
  loading?: boolean;
  error?: Error | null;
  className?: string;
  onClick?: () => void;
  showTrend?: boolean;
  showComparison?: boolean;
  showGoal?: boolean;
  formatValue?: (value: number | string) => string;
}

export interface KPIGroup {
  id: string;
  title: string;
  description?: string;
  kpis: KPIData[];
  layout?: 'grid' | 'list';
  columns?: number;
}

export interface KPICardStyleConfig {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  trendColors?: {
    up: string;
    down: string;
    neutral: string;
  };
  goalColors?: {
    achieved: string;
    inProgress: string;
    notStarted: string;
  };
}

import type { ChartConfig } from "./charts";
import type { KPIData } from "./kpi";

export type ComponentSize = "small" | "medium" | "large" | "full";
export type ComponentType = "chart" | "kpi" | "table" | "custom";

export interface GridBreakpoint {
  xs?: number; // Mobile
  sm?: number; // Tablet
  md?: number; // Desktop
  lg?: number; // Large desktop
  xl?: number; // Extra large
}

export interface GridItemLayout {
  i: string; // Unique identifier
  x: number; // X position in grid units
  y: number; // Y position in grid units
  w: number; // Width in grid units
  h: number; // Height in grid units
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean; // Prevent drag/resize
}

export interface DashboardComponent {
  id: string;
  type: ComponentType;
  title: string;
  description?: string;
  size: ComponentSize;
  data?: ChartConfig | KPIData | any;
  layout?: GridItemLayout;
  refreshInterval?: number; // in seconds
  lastRefreshed?: Date | string;
  permissions?: string[];
  visible?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  components: DashboardComponent[];
  gridCols: GridBreakpoint | number;
  rowHeight: number;
  compactType?: "vertical" | "horizontal" | null;
  preventCollision?: boolean;
  isResizable?: boolean;
  isDraggable?: boolean;
  margin?: [number, number];
  containerPadding?: [number, number];
  useCSSTransforms?: boolean;
}

export interface DashboardGridProps {
  layout: DashboardLayout;
  onLayoutChange?: (newLayout: GridItemLayout[]) => void;
  onComponentResize?: (componentId: string, size: ComponentSize) => void;
  onComponentRemove?: (componentId: string) => void;
  onComponentAdd?: (component: DashboardComponent) => void;
  loading?: boolean;
  error?: Error | null;
  className?: string;
  editMode?: boolean;
}

export interface DashboardState {
  activeLayout: DashboardLayout | null;
  layouts: DashboardLayout[];
  selectedComponents: string[];
  isEditing: boolean;
  refreshStatus: Record<string, boolean>;
}

export interface DashboardExportConfig {
  format: "pdf" | "png" | "csv";
  components?: string[]; // Component IDs to export, all if not specified
  includeTitle?: boolean;
  includeTimestamp?: boolean;
  orientation?: "portrait" | "landscape";
}

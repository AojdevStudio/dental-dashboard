/**
 * @fileoverview Custom database type definitions for the dental dashboard application.
 *
 * This file contains type definitions that extend or complement the auto-generated
 * Prisma types. It includes enums for various status types, roles, and time periods
 * used throughout the application, as well as utility types for working with
 * metrics and data analysis.
 */

/**
 * Status values for clinics
 *
 * Represents the operational status of a dental clinic.
 * Used for filtering and display purposes.
 *
 * @enum {string}
 */
export enum ClinicStatus {
  /** Clinic is fully operational and accepting patients */
  ACTIVE = "active",

  /** Clinic is not currently operational */
  INACTIVE = "inactive",
}

/**
 * Status values for providers
 *
 * Represents the working status of a dental provider.
 * Used for filtering and display purposes.
 *
 * @enum {string}
 */
export enum ProviderStatus {
  /** Provider is currently working and accepting patients */
  ACTIVE = "active",

  /** Provider is not currently working */
  INACTIVE = "inactive",
}

/**
 * Types of providers in the system
 *
 * Categorizes providers by their specialty or role.
 *
 * @enum {string}
 */
export enum ProviderType {
  /** General dentist */
  DENTIST = "dentist",

  /** Dental hygienist */
  HYGIENIST = "hygienist",

  /** Specialized dental professional */
  SPECIALIST = "specialist",
}

/**
 * User roles in the system
 *
 * Defines the permission levels and responsibilities of different user types.
 *
 * @enum {string}
 */
export enum UserRole {
  /** Clinic administrator with full access */
  ADMIN = "admin",

  /** Dentist with clinical access */
  DENTIST = "dentist",

  /** Front desk staff with limited access */
  FRONT_DESK = "front_desk",

  /** Office manager with administrative access */
  OFFICE_MANAGER = "office_manager",
}

/**
 * Data types for metrics
 *
 * Defines the data type format for metric values.
 *
 * @enum {string}
 */
export enum MetricDataType {
  /** Monetary values */
  CURRENCY = "currency",

  /** Percentage values */
  PERCENTAGE = "percentage",

  /** Whole number values */
  INTEGER = "integer",

  /** Date values */
  DATE = "date",
}

/**
 * Metric categories
 *
 * Groups metrics into logical categories for organization and filtering.
 *
 * @enum {string}
 */
export enum MetricCategory {
  /** Financial metrics like revenue and expenses */
  FINANCIAL = "financial",

  /** Patient-related metrics like new patients or recalls */
  PATIENT = "patient",

  /** Appointment-related metrics like scheduling rate or no-shows */
  APPOINTMENT = "appointment",

  /** Provider-specific metrics like productivity */
  PROVIDER = "provider",

  /** Treatment-related metrics like procedure counts */
  TREATMENT = "treatment",
}

/**
 * Time periods for reporting and goals
 *
 * Defines standard time increments for data analysis and goal setting.
 *
 * @enum {string}
 */
export enum TimePeriod {
  /** Daily data points */
  DAILY = "daily",

  /** Weekly data aggregation */
  WEEKLY = "weekly",

  /** Monthly data aggregation */
  MONTHLY = "monthly",

  /** Quarterly data aggregation */
  QUARTERLY = "quarterly",

  /** Annual data aggregation */
  ANNUAL = "annual",

  /** Custom date range */
  CUSTOM = "custom",
}

/**
 * Widget types for dashboard displays
 *
 * Defines the visual representation types for dashboard widgets.
 *
 * @enum {string}
 */
export enum WidgetType {
  /** Graph or chart visualization */
  CHART = "chart",

  /** Single numeric value display */
  COUNTER = "counter",

  /** Tabular data display */
  TABLE = "table",
}

/**
 * Chart types for data visualization
 *
 * Defines the visualization styles for chart widgets.
 *
 * @enum {string}
 */
export enum ChartType {
  /** Line chart for time series data */
  LINE = "line",

  /** Bar chart for category comparisons */
  BAR = "bar",

  /** Pie chart for proportional data */
  PIE = "pie",

  /** Area chart for cumulative data */
  AREA = "area",

  /** Scatter plot for correlation data */
  SCATTER = "scatter",
}

/**
 * Frequency options for data source synchronization
 *
 * Defines how often data sources should sync with external data.
 *
 * @enum {string}
 */
export enum SyncFrequency {
  /** Sync hourly */
  HOURLY = "hourly",

  /** Sync daily */
  DAILY = "daily",

  /** Sync weekly */
  WEEKLY = "weekly",

  /** Sync monthly */
  MONTHLY = "monthly",

  /** Manual sync only */
  MANUAL = "manual",
}

/**
 * Connection status for data sources
 *
 * Indicates the current connection state of external data sources.
 *
 * @enum {string}
 */
export enum ConnectionStatus {
  /** Successfully connected */
  CONNECTED = "connected",

  /** Connection pending or in progress */
  PENDING = "pending",

  /** Connection failed or errored */
  ERROR = "error",

  /** Connection deliberately disconnected */
  DISCONNECTED = "disconnected",
}

/**
 * Metric with temporal data for trend analysis
 *
 * A utility type that associates metric values with time periods
 * for tracking changes over time.
 *
 * @typedef {Object} MetricTrend
 * @property {string} metricId - ID of the metric definition
 * @property {string} metricName - Display name of the metric
 * @property {MetricDataType} dataType - Data type of the metric
 * @property {Array<MetricDataPoint>} dataPoints - Collection of data points over time
 */
export type MetricTrend = {
  metricId: string;
  metricName: string;
  dataType: MetricDataType;
  dataPoints: MetricDataPoint[];
};

/**
 * Individual data point for a metric at a specific time
 *
 * Represents a single measurement of a metric value at a specific point in time.
 *
 * @typedef {Object} MetricDataPoint
 * @property {Date} date - The date of the measurement
 * @property {string|number} value - The metric value (stored as string for flexibility)
 * @property {string} [providerId] - Optional provider ID if the metric is provider-specific
 */
export type MetricDataPoint = {
  date: Date;
  value: string | number;
  providerId?: string;
};

/**
 * Goal progress tracking type
 *
 * Combines goal definition with current progress for tracking and visualization.
 *
 * @typedef {Object} GoalProgress
 * @property {string} goalId - ID of the goal
 * @property {string} metricId - ID of the associated metric
 * @property {string} metricName - Name of the associated metric
 * @property {string|number} targetValue - The goal's target value
 * @property {string|number} currentValue - The current value achieved
 * @property {number} progressPercentage - Percentage of goal completion (0-100)
 * @property {Date} startDate - When the goal period started
 * @property {Date} endDate - When the goal period ends
 */
export type GoalProgress = {
  goalId: string;
  metricId: string;
  metricName: string;
  targetValue: string | number;
  currentValue: string | number;
  progressPercentage: number;
  startDate: Date;
  endDate: Date;
};

/**
 * Dashboard configuration with widgets
 *
 * Extended dashboard type that includes the full widget configurations.
 *
 * @typedef {Object} DashboardWithWidgets
 * @property {string} id - Dashboard ID
 * @property {string} name - Dashboard name
 * @property {boolean} isDefault - Whether this is the default dashboard
 * @property {Object} layoutConfig - Layout configuration JSON
 * @property {Array<WidgetWithMetric>} widgets - Fully populated widgets with metric data
 */
export type DashboardWithWidgets = {
  id: string;
  name: string;
  isDefault: boolean;
  layoutConfig: Record<string, unknown>;
  widgets: WidgetWithMetric[];
};

/**
 * Widget with associated metric data
 *
 * Extended widget type that includes the full metric definition and current data.
 *
 * @typedef {Object} WidgetWithMetric
 * @property {string} id - Widget ID
 * @property {WidgetType} widgetType - Type of widget (chart, counter, table)
 * @property {ChartType} [chartType] - Type of chart if widget is a chart
 * @property {number} positionX - Horizontal grid position
 * @property {number} positionY - Vertical grid position
 * @property {number} width - Widget width in grid units
 * @property {number} height - Widget height in grid units
 * @property {Object} config - Widget configuration JSON
 * @property {Object} [metricDefinition] - Associated metric definition
 * @property {Array<MetricDataPoint>} [metricData] - Current metric data points
 */
export type WidgetWithMetric = {
  id: string;
  widgetType: WidgetType;
  chartType?: ChartType;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  config: Record<string, unknown>;
  metricDefinition?: Record<string, unknown>;
  metricData?: MetricDataPoint[];
};

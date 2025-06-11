export const defaultColorPalette = {
  primary: [
    '#3B82F6', // Blue 500
    '#2563EB', // Blue 600
    '#1D4ED8', // Blue 700
    '#1E40AF', // Blue 800
    '#1E3A8A', // Blue 900
  ],
  secondary: [
    '#8B5CF6', // Violet 500
    '#7C3AED', // Violet 600
    '#6D28D9', // Violet 700
    '#5B21B6', // Violet 800
    '#4C1D95', // Violet 900
  ],
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  error: '#EF4444', // Red 500
  neutral: [
    '#F3F4F6', // Gray 100
    '#E5E7EB', // Gray 200
    '#D1D5DB', // Gray 300
    '#9CA3AF', // Gray 400
    '#6B7280', // Gray 500
    '#4B5563', // Gray 600
    '#374151', // Gray 700
    '#1F2937', // Gray 800
    '#111827', // Gray 900
  ],
};

export const medicalColorPalette = {
  primary: [
    '#0EA5E9', // Sky 500
    '#0284C7', // Sky 600
    '#0369A1', // Sky 700
    '#075985', // Sky 800
    '#0C4A6E', // Sky 900
  ],
  secondary: [
    '#06B6D4', // Cyan 500
    '#0891B2', // Cyan 600
    '#0E7490', // Cyan 700
    '#155E75', // Cyan 800
    '#164E63', // Cyan 900
  ],
  success: '#059669', // Emerald 600
  warning: '#D97706', // Amber 600
  error: '#DC2626', // Red 600
  neutral: defaultColorPalette.neutral,
};

export const dentalColorPalette = {
  primary: [
    '#14B8A6', // Teal 500
    '#0D9488', // Teal 600
    '#0F766E', // Teal 700
    '#115E59', // Teal 800
    '#134E4A', // Teal 900
  ],
  secondary: [
    '#60A5FA', // Blue 400
    '#3B82F6', // Blue 500
    '#2563EB', // Blue 600
    '#1D4ED8', // Blue 700
    '#1E40AF', // Blue 800
  ],
  success: '#059669', // Emerald 600
  warning: '#D97706', // Amber 600
  error: '#DC2626', // Red 600
  neutral: defaultColorPalette.neutral,
};

export type ColorScheme = 'default' | 'medical' | 'dental';

export const colorSchemes: Record<ColorScheme, typeof defaultColorPalette> = {
  default: defaultColorPalette,
  medical: medicalColorPalette,
  dental: dentalColorPalette,
};

export const getColorScheme = (scheme: ColorScheme = 'default') => {
  return colorSchemes[scheme] || defaultColorPalette;
};

export const getChartColors = (scheme: ColorScheme = 'default', count = 5): string[] => {
  const palette = getColorScheme(scheme);
  const colors = [...palette.primary, ...palette.secondary];

  // If we need more colors than available, generate variations
  if (count > colors.length) {
    const additionalColors: string[] = [];
    for (let i = colors.length; i < count; i++) {
      const baseColor = colors[i % colors.length];
      const variation = adjustColorBrightness(baseColor, ((i % 3) - 1) * 20);
      additionalColors.push(variation);
    }
    return [...colors, ...additionalColors].slice(0, count);
  }

  return colors.slice(0, count);
};

export const getTrendColor = (
  direction: 'up' | 'down' | 'neutral',
  context: 'positive' | 'negative' = 'positive'
): string => {
  const scheme = getColorScheme('default');

  if (direction === 'neutral') {
    return scheme.neutral[4];
  }

  if (context === 'positive') {
    return direction === 'up' ? scheme.success : scheme.error;
  }
  return direction === 'up' ? scheme.error : scheme.success;
};

export const getContrastColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export const adjustColorBrightness = (color: string, percent: number): string => {
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  const adjust = (value: number) => {
    const adjustedValue = value + (255 - value) * (percent / 100);
    return Math.min(255, Math.max(0, Math.round(adjustedValue)));
  };

  const newR = adjust(r).toString(16).padStart(2, '0');
  const newG = adjust(g).toString(16).padStart(2, '0');
  const newB = adjust(b).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
};

export const generateGradient = (
  startColor: string,
  endColor: string,
  direction = 'to right'
): string => {
  return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
};

export const getStatusColor = (
  value: number,
  thresholds: { low: number; medium: number; high: number },
  scheme: ColorScheme = 'default'
): string => {
  const palette = getColorScheme(scheme);

  if (value < thresholds.low) {
    return palette.error;
  }
  if (value < thresholds.medium) {
    return palette.warning;
  }
  if (value < thresholds.high) {
    return palette.primary[0];
  }
  return palette.success;
};

export const chartTheme = {
  axis: {
    style: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fill: defaultColorPalette.neutral[5],
    },
  },
  grid: {
    stroke: defaultColorPalette.neutral[2],
    strokeDasharray: '3 3',
  },
  tooltip: {
    container: {
      backgroundColor: 'white',
      border: `1px solid ${defaultColorPalette.neutral[2]}`,
      borderRadius: '6px',
      padding: '8px 12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: defaultColorPalette.neutral[8],
    },
    value: {
      fontSize: 14,
      fontWeight: 400,
      color: defaultColorPalette.neutral[6],
    },
  },
  legend: {
    style: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fill: defaultColorPalette.neutral[6],
    },
  },
};

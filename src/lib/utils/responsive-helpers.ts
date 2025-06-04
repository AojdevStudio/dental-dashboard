import { useEffect, useState } from "react";

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const getBreakpoint = (width: number): Breakpoint => {
  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
};

/**
 * Hook to get the current responsive breakpoint based on window width.
 * Returns undefined during SSR and initial render to prevent hydration mismatches.
 * The breakpoint is set after the component mounts and window dimensions are available.
 *
 * @returns {Breakpoint | undefined} Current breakpoint or undefined during SSR/initial render
 */
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    // Set initial breakpoint after component mounts
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
};

/**
 * Hook to check if a media query matches the current viewport.
 * Returns false during SSR and initial render to prevent hydration mismatches.
 * The actual match state is set after the component mounts.
 *
 * @param {string} query - CSS media query string
 * @returns {boolean} Whether the media query matches (false during SSR/initial render)
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    // Set initial state after component mounts to avoid SSR mismatch
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export const getGridColumns = (breakpoint: Breakpoint | undefined): number => {
  const columns: Record<Breakpoint, number> = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    "2xl": 5,
  };
  // Default to 'lg' if breakpoint is undefined (SSR safe)
  return columns[breakpoint || "lg"];
};

export const getChartHeight = (
  breakpoint: Breakpoint | undefined,
  type: "small" | "medium" | "large" = "medium"
): number => {
  const heights: Record<Breakpoint, Record<string, number>> = {
    xs: { small: 200, medium: 250, large: 300 },
    sm: { small: 250, medium: 300, large: 350 },
    md: { small: 250, medium: 350, large: 400 },
    lg: { small: 300, medium: 400, large: 500 },
    xl: { small: 300, medium: 400, large: 500 },
    "2xl": { small: 350, medium: 450, large: 550 },
  };
  // Default to 'lg' if breakpoint is undefined (SSR safe)
  return heights[breakpoint || "lg"][type];
};

export const useContainerDimensions = (ref: React.RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [ref]);

  return dimensions;
};

export const getResponsiveValue = <T>(
  breakpoint: Breakpoint | undefined,
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T => {
  // Return default value if breakpoint is undefined (SSR safe)
  if (!breakpoint) {
    return defaultValue;
  }

  const breakpointOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Look for exact match first
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }

  // Fall back to next smaller breakpoint
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return defaultValue;
};

export const calculateResponsiveFontSize = (
  baseFontSize: number,
  breakpoint: Breakpoint | undefined
): number => {
  const scales: Record<Breakpoint, number> = {
    xs: 0.85,
    sm: 0.9,
    md: 0.95,
    lg: 1,
    xl: 1.05,
    "2xl": 1.1,
  };
  // Default to 'lg' if breakpoint is undefined (SSR safe)
  return Math.round(baseFontSize * scales[breakpoint || "lg"]);
};

export const getResponsiveMargin = (
  breakpoint: Breakpoint | undefined
): { top: number; right: number; bottom: number; left: number } => {
  const margins: Record<Breakpoint, { top: number; right: number; bottom: number; left: number }> =
    {
      xs: { top: 20, right: 10, bottom: 40, left: 10 },
      sm: { top: 20, right: 20, bottom: 40, left: 20 },
      md: { top: 20, right: 30, bottom: 40, left: 40 },
      lg: { top: 20, right: 40, bottom: 40, left: 50 },
      xl: { top: 20, right: 50, bottom: 40, left: 60 },
      "2xl": { top: 20, right: 60, bottom: 40, left: 70 },
    };
  // Default to 'lg' if breakpoint is undefined (SSR safe)
  return margins[breakpoint || "lg"];
};

export const isMobile = (breakpoint: Breakpoint | undefined): boolean => {
  if (!breakpoint) return false; // Default to false for SSR safety
  return breakpoint === "xs" || breakpoint === "sm";
};

export const isTablet = (breakpoint: Breakpoint | undefined): boolean => {
  if (!breakpoint) return false; // Default to false for SSR safety
  return breakpoint === "md";
};

export const isDesktop = (breakpoint: Breakpoint | undefined): boolean => {
  if (!breakpoint) return true; // Default to true for SSR safety (assume desktop)
  return breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl";
};

export const getComponentSize = (
  breakpoint: Breakpoint | undefined,
  defaultSize: "small" | "medium" | "large"
): "small" | "medium" | "large" => {
  if (isMobile(breakpoint)) {
    return defaultSize === "large" ? "medium" : "small";
  }
  return defaultSize;
};

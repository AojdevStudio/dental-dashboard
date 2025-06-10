/**
 * Tests for responsive helpers SSR safety
 */

import {
  calculateResponsiveFontSize,
  getBreakpoint,
  getChartHeight,
  getComponentSize,
  getGridColumns,
  getResponsiveMargin,
  getResponsiveValue,
  isDesktop,
  isMobile,
  isTablet,
} from "./responsive-helpers";

describe("Responsive Helpers SSR Safety", () => {
  describe("getBreakpoint", () => {
    it("should return correct breakpoints for different widths", () => {
      expect(getBreakpoint(320)).toBe("xs");
      expect(getBreakpoint(640)).toBe("sm");
      expect(getBreakpoint(768)).toBe("md");
      expect(getBreakpoint(1024)).toBe("lg");
      expect(getBreakpoint(1280)).toBe("xl");
      expect(getBreakpoint(1536)).toBe("2xl");
    });
  });

  describe("Helper functions with undefined breakpoint", () => {
    it("should handle undefined breakpoint gracefully", () => {
      // Test that all helper functions work with undefined breakpoint
      expect(getGridColumns(undefined)).toBe(4); // defaults to 'lg'
      expect(getChartHeight(undefined)).toBe(400); // defaults to 'lg' medium
      expect(getChartHeight(undefined, "small")).toBe(300); // defaults to 'lg' small
      expect(getChartHeight(undefined, "large")).toBe(500); // defaults to 'lg' large

      expect(getResponsiveValue(undefined, { lg: "test" }, "default")).toBe("default");
      expect(calculateResponsiveFontSize(16, undefined)).toBe(16); // lg scale is 1

      const margin = getResponsiveMargin(undefined);
      expect(margin).toEqual({ top: 20, right: 40, bottom: 40, left: 50 }); // lg margins

      expect(isMobile(undefined)).toBe(false);
      expect(isTablet(undefined)).toBe(false);
      expect(isDesktop(undefined)).toBe(true); // defaults to desktop for SSR safety

      expect(getComponentSize(undefined, "large")).toBe("large");
    });
  });

  describe("Responsive value fallback", () => {
    it("should fall back correctly when breakpoint is defined", () => {
      const values = { sm: "small", lg: "large" };

      // Exact match
      expect(getResponsiveValue("lg", values, "default")).toBe("large");
      expect(getResponsiveValue("sm", values, "default")).toBe("small");

      // Fallback to smaller breakpoint
      expect(getResponsiveValue("md", values, "default")).toBe("small"); // falls back to sm
      expect(getResponsiveValue("xl", values, "default")).toBe("large"); // falls back to lg

      // No match, use default
      expect(getResponsiveValue("xs", values, "default")).toBe("default");
    });
  });

  describe("Device type detection", () => {
    it("should correctly identify device types", () => {
      expect(isMobile("xs")).toBe(true);
      expect(isMobile("sm")).toBe(true);
      expect(isMobile("md")).toBe(false);

      expect(isTablet("md")).toBe(true);
      expect(isTablet("lg")).toBe(false);

      expect(isDesktop("lg")).toBe(true);
      expect(isDesktop("xl")).toBe(true);
      expect(isDesktop("2xl")).toBe(true);
      expect(isDesktop("md")).toBe(false);
    });
  });

  describe("Component size adaptation", () => {
    it("should adapt component sizes for mobile", () => {
      expect(getComponentSize("xs", "large")).toBe("medium");
      expect(getComponentSize("xs", "medium")).toBe("small");
      expect(getComponentSize("xs", "small")).toBe("small");

      expect(getComponentSize("lg", "large")).toBe("large");
      expect(getComponentSize("lg", "medium")).toBe("medium");
      expect(getComponentSize("lg", "small")).toBe("small");
    });
  });
});

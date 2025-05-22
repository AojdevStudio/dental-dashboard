/**
 * @fileoverview Main Navigation Component
 * 
 * This file implements the main navigation component that combines the sidebar
 * and header into a complete navigation system for the dashboard interface.
 */

"use client";

import * as React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

/**
 * Navigation Component
 * 
 * A wrapper component that combines the header and sidebar navigation
 * into a unified navigation system for the dashboard interface.
 * 
 * @returns {JSX.Element} The rendered navigation component
 */
export function Navigation() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <div className="hidden md:flex w-64 flex-col border-r">
          <Sidebar />
        </div>
        <div className="flex-1 p-6">
          {/* Main content will be rendered here by layout.tsx */}
          {/* This is intentionally empty as it's a wrapper component */}
        </div>
      </div>
    </div>
  );
}

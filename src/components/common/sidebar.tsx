/**
 * @fileoverview Sidebar Navigation Component
 *
 * This file implements the sidebar navigation component used in the dashboard layout.
 * It provides the main navigation structure for the application, with links to
 * different sections and features of the dental dashboard.
 */

"use client";

import { cn } from "@/lib/utils";
import { BarChart3, FileSpreadsheet, FileText, Home, Settings, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

/**
 * Interface for navigation item properties
 *
 * @property {string} title - Display text for the navigation item
 * @property {string} href - URL path for the navigation item
 * @property {React.ReactNode} icon - Icon component to display
 */
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

/**
 * Navigation items for the sidebar
 *
 * Each item consists of:
 * - title: The text displayed in the navigation
 * - href: The URL path the item links to
 * - icon: The Lucide icon component to display
 *
 * @type {NavItem[]}
 */
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

/**
 * Sidebar Navigation Component
 *
 * Provides the main navigation sidebar for the dashboard interface.
 * Features include:
 * - Icon and text links to main application sections
 * - Visual indication of the current active section
 * - Responsive design that adapts to different screen sizes
 *
 * @returns {JSX.Element} The rendered sidebar navigation component
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 px-3 sm:px-4 py-4">
      {navItems.map((item) => {
        // Check if the current path matches this item's path
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {/* Item icon */}
            <span className="mr-3">{item.icon}</span>

            {/* Item title */}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

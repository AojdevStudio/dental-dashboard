"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavItemComponent } from "./nav-item";
import { type SidebarProps } from "@/lib/types/layout";
import { type NavSection } from "@/lib/types/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  Target,
  Link2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigationState } from "@/lib/utils/navigation";

// Define the navigation structure
const navigation: NavSection[] = [
  {
    id: "main",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "production",
        title: "Production",
        href: "/production",
        icon: TrendingUp,
        children: [
          {
            id: "dentist-production",
            title: "Dentist Production",
            href: "/production/dentist",
          },
          {
            id: "hygienist-production",
            title: "Hygienist Production",
            href: "/production/hygienist",
          },
        ],
      },
      {
        id: "providers",
        title: "Providers",
        href: "/providers",
        icon: Users,
      },
      {
        id: "reports",
        title: "Reports",
        href: "/reports",
        icon: FileText,
      },
      {
        id: "goals",
        title: "Goals",
        href: "/goals",
        icon: Target,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      {
        id: "integrations",
        title: "Integrations",
        href: "/integrations",
        icon: Link2,
      },
      {
        id: "settings",
        title: "Settings",
        href: "/settings",
        icon: Settings,
        children: [
          {
            id: "clinic-settings",
            title: "Clinic",
            href: "/settings/clinic",
          },
          {
            id: "user-settings",
            title: "Users",
            href: "/settings/users",
          },
          {
            id: "provider-settings",
            title: "Providers",
            href: "/settings/providers",
          },
        ],
      },
    ],
  },
];

export function Sidebar({ className }: SidebarProps) {
  const {
    isSidebarCollapsed,
    expandedSections,
    toggleSidebar,
    setActiveItem,
    toggleSection,
  } = useNavigationState();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-[280px]",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isSidebarCollapsed && (
          <h1 className="text-xl font-semibold">Dental Dashboard</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav aria-label="Sidebar navigation">
          {navigation.map((section, sectionIndex) => (
            <div key={section.id} className={cn(sectionIndex > 0 && "mt-6")}>
              {section.title && !isSidebarCollapsed && (
                <h2 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h2>
              )}
              <ul role="list" className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <NavItemComponent
                      item={item}
                      isCollapsed={isSidebarCollapsed}
                      isExpanded={expandedSections.includes(item.id)}
                      onToggle={() => toggleSection(item.id)}
                      onItemClick={setActiveItem}
                    />
                    {/* Nested items */}
                    {item.children &&
                      expandedSections.includes(item.id) &&
                      !isSidebarCollapsed && (
                        <ul role="list" className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <NavItemComponent
                                item={child}
                                isCollapsed={isSidebarCollapsed}
                                isNested
                                onItemClick={setActiveItem}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-20 focus:top-20 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:outline-2 focus:outline-primary"
      >
        Skip to main content
      </a>
    </aside>
  );
}

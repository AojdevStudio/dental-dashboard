"use client";

import type { DashboardLayoutProps, MainContentProps } from "@/lib/types/layout";
import { cn } from "@/lib/utils";
import { useNavigationState } from "@/lib/utils/navigation";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

export function MainContent({ children, className, hasSidebar = true }: MainContentProps) {
  return (
    <main
      id="main-content"
      className={cn("flex-1 overflow-y-auto bg-background", hasSidebar && "lg:pl-0", className)}
    >
      <div className="container mx-auto px-4 py-6 lg:px-8">{children}</div>
    </main>
  );
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { isSidebarCollapsed } = useNavigationState();

  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <TopNav />

        {/* Page content */}
        <MainContent hasSidebar={true}>{children}</MainContent>
      </div>
    </div>
  );
}

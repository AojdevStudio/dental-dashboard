/**
 * Dashboard Layout Component
 *
 * This client-side component provides the main layout structure for all dashboard pages.
 * It implements a responsive design with the following features:
 * - A collapsible sidebar navigation menu (SessionNavBar)
 * - Dynamic breadcrumb navigation that updates based on the current route
 * - Mobile-friendly header with menu toggle, search, and notification buttons
 * - Responsive grid layout for dashboard content
 *
 * The layout maintains consistent UI elements across all dashboard pages while allowing
 * child components to be rendered in the main content area. It handles responsive behavior
 * for different screen sizes, ensuring a good user experience on both mobile and desktop devices.
 */

"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/common/sidebar";
import { UserNav } from "@/components/common/user-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Bell, Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Providers } from "./providers";

/**
 * Dashboard Layout Component
 *
 * Provides the main layout structure for all dashboard pages, including navigation,
 * header controls, and a responsive grid for content.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render in the main content area
 * @returns {JSX.Element} The rendered dashboard layout with the provided children
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>([]);
  const pathname = usePathname();

  /**
   * Generates breadcrumb navigation items based on the current URL path
   * Splits the pathname into segments and updates the breadcrumbItems state
   */
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/").filter(Boolean);
      setBreadcrumbItems(pathSegments);
    }
  }, [pathname]);

  return (
    <Providers>
      <AuthGuard>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar - hidden on mobile unless menu is open */}
          <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block z-50`}>
            <Sidebar />
          </div>

          {/* Main content area with header */}
          <div className="flex flex-col flex-1 w-full overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-3 sm:px-4 h-14 border-b shrink-0">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Mobile menu toggle - increased size for better touch target */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden h-10 w-10"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {/* Breadcrumb navigation - hidden on very small screens */}
                <div className="hidden sm:block">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      {breadcrumbItems.length > 1 &&
                        breadcrumbItems.slice(1).map((item, index) => (
                          <BreadcrumbItem key={index}>
                            <BreadcrumbSeparator />
                            {index === breadcrumbItems.length - 2 ? (
                              <BreadcrumbPage>
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={`/${breadcrumbItems.slice(0, index + 2).join("/")}`}
                              >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>

              {/* Right side header controls - increased size for touch targets */}
              <div className="flex items-center gap-1 sm:gap-3">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Bell className="h-5 w-5" />
                </Button>
                {/* User navigation dropdown with sign-out button */}
                <UserNav />
              </div>
            </header>

            {/* Main content with scrollable area */}
            <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
              {/* Page content */}
              <div className="container mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </AuthGuard>
    </Providers>
  );
}

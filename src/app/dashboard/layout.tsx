"use client";

import { SessionNavBar } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bell, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>([]);
  const pathname = usePathname();

  // Generate breadcrumb items based on pathname
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split("/").filter(Boolean);
      setBreadcrumbItems(pathSegments);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:block z-50`}>
        <SessionNavBar />
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
          </div>
        </header>

        {/* Main content with scrollable area */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {/* Page content */}
          <div className="container mx-auto">
            {/* Grid layout for dashboard widgets - with fallback for very small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

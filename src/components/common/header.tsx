/**
 * @fileoverview Application Header Component
 *
 * This file implements the main application header component, which appears at the top
 * of the dashboard interface. It includes the site logo, navigation elements, and user
 * menu, providing consistent navigation and branding across the application.
 */

'use client';

import Link from 'next/link';
import { UserNav } from './user-nav';

/**
 * Header Component
 *
 * The main application header that appears at the top of the dashboard interface.
 * Features include:
 * - Logo and branding
 * - Navigation links
 * - User dropdown menu
 *
 * The header is responsive and adjusts its layout based on screen size.
 *
 * @returns {JSX.Element} The rendered header component
 */
export function Header() {
  return (
    <header class="sticky top-0 z-40 border-b bg-background">
      <div class="container flex h-16 items-center justify-between py-4">
        <div class="flex items-center gap-2">
          {/* Application logo and title */}
          <Link href="/" class="flex items-center space-x-2">
            <span class="font-bold text-xl">Dental Dashboard</span>
          </Link>
        </div>

        {/* User profile dropdown menu */}
        <UserNav />
      </div>
    </header>
  );
}

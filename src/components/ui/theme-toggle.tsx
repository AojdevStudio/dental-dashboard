/**
 * @fileoverview Theme Toggle Component
 *
 * Provides a three-state theme toggle (light, dark, system) with dropdown interface,
 * keyboard accessibility, and smooth transitions. Uses next-themes for theme management.
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

/**
 * Theme Toggle Component
 *
 * Provides an accessible dropdown interface for switching between light, dark, and system themes.
 * The component uses appropriate icons for each theme state and maintains keyboard accessibility.
 *
 * Features:
 * - Three-state toggle: light, dark, system
 * - Keyboard accessible dropdown interface
 * - Context-aware icons (Sun, Moon, Monitor) based on resolved theme
 * - Smooth transitions handled by next-themes
 * - System theme detection support
 *
 * @returns {JSX.Element} The theme toggle dropdown component
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" aria-label="Toggle theme" className="relative">
          <Sun
            className={`h-[1.2rem] w-[1.2rem] transition-all ${resolvedTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
          />
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${resolvedTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

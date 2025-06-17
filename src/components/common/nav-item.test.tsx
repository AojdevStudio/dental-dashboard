import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { vi } from 'vitest';
import { NavItemComponent } from './nav-item';
import type { NavItem } from '@/lib/types/navigation';
import { Home, Users } from 'lucide-react';

// Mock Next.js navigation hook
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

const mockUsePathname = vi.mocked(usePathname);

describe('NavItemComponent', () => {
  const mockNavItem: NavItem = {
    id: 'test-item',
    title: 'Test Item',
    href: '/test',
    icon: Home,
  };

  const rootNavItem: NavItem = {
    id: 'root-item',
    title: 'Home',
    href: '/',
    icon: Home,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Active state logic', () => {
    it('should be active when pathname exactly matches item href', () => {
      mockUsePathname.mockReturnValue('/test');
      
      render(<NavItemComponent item={mockNavItem} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveClass('bg-accent text-accent-foreground');
    });

    it('should be active when pathname starts with item href (nested path)', () => {
      mockUsePathname.mockReturnValue('/test/nested');
      
      render(<NavItemComponent item={mockNavItem} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveClass('bg-accent text-accent-foreground');
    });

    it('should not be active when pathname does not match', () => {
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={mockNavItem} />);
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
      expect(link).not.toHaveClass('bg-accent text-accent-foreground');
    });

    it('should handle root path "/" correctly - active only for exact match', () => {
      mockUsePathname.mockReturnValue('/');
      
      render(<NavItemComponent item={rootNavItem} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveClass('bg-accent text-accent-foreground');
    });

    it('should handle root path "/" correctly - not active for nested paths', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      
      render(<NavItemComponent item={rootNavItem} />);
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
      expect(link).not.toHaveClass('bg-accent text-accent-foreground');
    });

    it('should handle root path "/" correctly - not active for deeply nested paths', () => {
      mockUsePathname.mockReturnValue('/dashboard/providers');
      
      render(<NavItemComponent item={rootNavItem} />);
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
      expect(link).not.toHaveClass('bg-accent text-accent-foreground');
    });
  });

  describe('Rendering', () => {
    it('should render nav item with title and icon', () => {
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={mockNavItem} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
    });

    it('should render badge when provided', () => {
      const itemWithBadge: NavItem = {
        ...mockNavItem,
        badge: '5',
      };
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={itemWithBadge} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle collapsed state', () => {
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={mockNavItem} isCollapsed={true} />);
      
      expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveClass('justify-center');
    });

    it('should handle disabled state', () => {
      const disabledItem: NavItem = {
        ...mockNavItem,
        disabled: true,
      };
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={disabledItem} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveClass('pointer-events-none opacity-50');
    });
  });

  describe('External links', () => {
    it('should render external links with proper attributes', () => {
      const externalItem: NavItem = {
        ...mockNavItem,
        href: 'https://example.com',
        external: true,
      };
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={externalItem} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Navigation items with children', () => {
    it('should render chevron for items with children', () => {
      const itemWithChildren: NavItem = {
        ...mockNavItem,
        children: [
          {
            id: 'child-1',
            title: 'Child 1',
            href: '/test/child1',
            icon: Users,
          },
        ],
      };
      mockUsePathname.mockReturnValue('/other');
      
      render(<NavItemComponent item={itemWithChildren} />);
      
      // Should render as an anchor tag, not Link component when it has children
      const element = screen.getByRole('link');
      expect(element.tagName).toBe('A');
      expect(element).toHaveAttribute('aria-expanded');
    });
  });
});
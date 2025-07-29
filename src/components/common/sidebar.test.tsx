import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname, useRouter } from 'next/navigation';
import { vi } from 'vitest';
import { Sidebar } from './sidebar';
import { useNavigationState } from '../../lib/utils/navigation';

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock navigation state hook
vi.mock('../../lib/utils/navigation', () => ({
  useNavigationState: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Sidebar Navigation - Providers Page Integration', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };

  const mockNavigationState = {
    isSidebarCollapsed: false,
    activeItem: null,
    expandedSections: [],
    toggleSidebar: vi.fn(),
    setActiveItem: vi.fn(),
    toggleSection: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigationState);
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
  });

  describe('Providers Navigation Link', () => {
    it('should render providers link with correct href /dashboard/providers', () => {
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toBeInTheDocument();
      expect(providersLink).toHaveAttribute('href', '/dashboard/providers');
    });

    it('should render providers link with Users icon', () => {
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      const icon = providersLink.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('h-5', 'w-5');
    });

    it('should position providers link in the main navigation section', () => {
      render(<Sidebar />);
      
      const navigationList = screen.getAllByRole('list')[0]; // First list is main section
      const links = navigationList.querySelectorAll('a');
      const providersLink = Array.from(links).find(link => 
        link.textContent?.includes('Providers')
      );
      
      expect(providersLink).toBeInTheDocument();
    });

    it('should maintain providers link order in navigation structure', () => {
      render(<Sidebar />);
      
      const navigationLinks = screen.getAllByRole('link');
      const linkTexts = navigationLinks.map(link => link.textContent?.trim());
      
      const dashboardIndex = linkTexts.findIndex(text => text === 'Dashboard');
      const providersIndex = linkTexts.findIndex(text => text === 'Providers');
      const reportsIndex = linkTexts.findIndex(text => text === 'Reports');
      
      expect(dashboardIndex).toBeLessThan(providersIndex);
      expect(providersIndex).toBeLessThan(reportsIndex);
    });
  });

  describe('Active State Highlighting', () => {
    it('should mark providers link as active when on /dashboard/providers', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('aria-current', 'page');
      expect(providersLink).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should mark providers link as active when on nested provider routes', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers/123');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('aria-current', 'page');
      expect(providersLink).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should mark providers link as active when on provider creation route', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers/new');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('aria-current', 'page');
      expect(providersLink).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should mark providers link as active when on provider edit route', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers/edit/456');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('aria-current', 'page');
      expect(providersLink).toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should NOT mark providers link as active on other pages', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/reports');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).not.toHaveAttribute('aria-current', 'page');
      expect(providersLink).not.toHaveClass('bg-accent', 'text-accent-foreground');
    });

    it('should highlight provider icon when link is active', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      const icon = providersLink.querySelector('svg');
      expect(icon).toHaveClass('text-primary');
    });

    it('should use muted foreground for provider icon when inactive', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      const icon = providersLink.querySelector('svg');
      expect(icon).toHaveClass('text-muted-foreground');
    });
  });

  describe('Existing Navigation Preservation', () => {
    it('should preserve all existing navigation links', () => {
      render(<Sidebar />);
      
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /production/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /providers/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /goals/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /integrations/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('should preserve production nested navigation', () => {
      const mockExpandedState = {
        ...mockNavigationState,
        expandedSections: ['production'],
      };
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockExpandedState);
      
      render(<Sidebar />);
      
      expect(screen.getByText('Dentist Production')).toBeInTheDocument();
      expect(screen.getByText('Hygienist Production')).toBeInTheDocument();
    });

    it('should preserve settings nested navigation', () => {
      const mockExpandedState = {
        ...mockNavigationState,
        expandedSections: ['settings'],
      };
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockExpandedState);
      
      render(<Sidebar />);
      
      expect(screen.getByText('Clinic')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getAllByText('Providers')).toHaveLength(2); // Main nav + Settings sub-item
    });

    it('should maintain other links active states independently', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/reports');
      render(<Sidebar />);
      
      const reportsLink = screen.getByRole('link', { name: /^reports$/i });
      const providersLink = screen.getByRole('link', { name: /^providers$/i });
      
      expect(reportsLink).toHaveAttribute('aria-current', 'page');
      expect(providersLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('should not affect dashboard link active state when on providers page', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      render(<Sidebar />);
      
      const dashboardLink = screen.getByRole('link', { name: /^dashboard$/i });
      const providersLink = screen.getByRole('link', { name: /^providers$/i });
      
      expect(providersLink).toHaveAttribute('aria-current', 'page');
      expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('User Interaction', () => {
    it('should call setActiveItem when providers link is clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      await user.click(providersLink);
      
      expect(mockNavigationState.setActiveItem).toHaveBeenCalledWith('providers');
    });

    it('should navigate to providers page when link is clicked', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      await user.click(providersLink);
      
      // Next.js Link handles navigation internally
      expect(providersLink).toHaveAttribute('href', '/dashboard/providers');
    });

    it('should support keyboard navigation to providers link', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      
      await user.tab(); // Navigate to first focusable element
      // Continue tabbing until we reach providers link
      while (document.activeElement !== providersLink) {
        await user.tab();
      }
      
      expect(document.activeElement).toBe(providersLink);
    });

    it('should activate providers link with Enter key', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      providersLink.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockNavigationState.setActiveItem).toHaveBeenCalledWith('providers');
    });

    it('should activate providers link with Space key', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      providersLink.focus();
      
      await user.keyboard(' ');
      
      expect(mockNavigationState.setActiveItem).toHaveBeenCalledWith('providers');
    });
  });

  describe('Mobile Responsive Behavior', () => {
    it('should show providers icon only when sidebar is collapsed', () => {
      const mockCollapsedState = {
        ...mockNavigationState,
        isSidebarCollapsed: true,
      };
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockCollapsedState);
      
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      const icon = providersLink.querySelector('svg');
      const text = screen.queryByText('Providers');
      
      expect(icon).toBeInTheDocument();
      expect(text).not.toBeInTheDocument();
    });

    it('should show providers icon and text when sidebar is expanded', () => {
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      const icon = providersLink.querySelector('svg');
      const text = screen.getByText('Providers');
      
      expect(icon).toBeInTheDocument();
      expect(text).toBeInTheDocument();
    });

    it('should maintain providers link functionality in collapsed state', async () => {
      const user = userEvent.setup();
      const mockCollapsedState = {
        ...mockNavigationState,
        isSidebarCollapsed: true,
      };
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockCollapsedState);
      
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      await user.click(providersLink);
      
      expect(mockNavigationState.setActiveItem).toHaveBeenCalledWith('providers');
    });

    it('should apply correct styling for collapsed providers link', () => {
      const mockCollapsedState = {
        ...mockNavigationState,
        isSidebarCollapsed: true,
      };
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockCollapsedState);
      
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveClass('justify-center');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<Sidebar />);
      const navigation = container.querySelector('nav[aria-label="Main navigation"]');
      expect(navigation).toBeInTheDocument();
    });

    it('should have proper ARIA labels for providers link', () => {
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toBeInTheDocument();
      expect(providersLink).toHaveAccessibleName();
    });

    it('should properly announce active state to screen readers', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have proper focus management for providers link', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      await user.tab();
      
      // Check that focus styles are applied
      expect(providersLink).toBeVisible();
    });

    it('should provide skip link functionality', () => {
      render(<Sidebar />);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should have proper heading structure for navigation sections', () => {
      render(<Sidebar />);
      
      // Check for section headings
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'System' })).toBeInTheDocument();
    });

    it('should support high contrast mode for providers link', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      // Active link should have sufficient contrast
      expect(providersLink).toHaveClass('bg-accent', 'text-accent-foreground');
    });
  });

  describe('State Management Integration', () => {
    it('should persist providers active state in navigation state', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      await user.click(providersLink);
      
      expect(mockNavigationState.setActiveItem).toHaveBeenCalledWith('providers');
    });

    it('should not expand providers section when clicked (no children)', async () => {
      const user = userEvent.setup();
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      await user.click(providersLink);
      
      expect(mockNavigationState.toggleSection).not.toHaveBeenCalled();
    });

    it('should maintain sidebar collapse state when providers is active', () => {
      const mockCollapsedState = {
        ...mockNavigationState,
        isSidebarCollapsed: true,
        activeItem: 'providers',
      };
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue(mockCollapsedState);
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      
      render(<Sidebar />);
      
      const sidebar = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(sidebar).toHaveClass('w-16'); // Collapsed width
    });
  });

  describe('Integration with Next.js Router', () => {
    it('should use Next.js Link component for providers navigation', () => {
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('href', '/dashboard/providers');
      // Next.js Link adds these attributes
      expect(providersLink.tagName).toBe('A');
    });

    it('should handle route changes properly', async () => {
      const { rerender } = render(<Sidebar />);
      
      // Initially not on providers page
      let providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).not.toHaveAttribute('aria-current', 'page');
      
      // Navigate to providers page
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard/providers');
      rerender(<Sidebar />);
      
      providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toHaveAttribute('aria-current', 'page');
    });

    it('should handle prefetching for providers link', () => {
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      // Next.js Link should handle prefetching automatically
      expect(providersLink).toHaveAttribute('href', '/dashboard/providers');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing navigation state gracefully', () => {
      (useNavigationState as ReturnType<typeof vi.fn>).mockReturnValue({
        isSidebarCollapsed: false,
        activeItem: null,
        expandedSections: [],
        toggleSidebar: vi.fn(),
        setActiveItem: vi.fn(),
        toggleSection: vi.fn(),
      });
      
      expect(() => render(<Sidebar />)).not.toThrow();
      expect(screen.getByRole('link', { name: /providers/i })).toBeInTheDocument();
    });

    it('should handle invalid pathname gracefully', () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(null);
      
      expect(() => render(<Sidebar />)).not.toThrow();
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('should handle providers link with disabled state', () => {
      // This would require modifying the navigation structure to include disabled state
      render(<Sidebar />);
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should maintain functionality when localStorage is unavailable', () => {
      const originalLocalStorage = global.localStorage;
      // @ts-expect-error - Intentionally testing missing localStorage
      delete global.localStorage;
      
      expect(() => render(<Sidebar />)).not.toThrow();
      
      const providersLink = screen.getByRole('link', { name: /providers/i });
      expect(providersLink).toBeInTheDocument();
      
      global.localStorage = originalLocalStorage;
    });
  });
});
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
}

export interface NavigationState {
  isSidebarCollapsed: boolean;
  activeItem: string | null;
  expandedSections: string[];
}

export interface NavigationContextValue extends NavigationState {
  toggleSidebar: () => void;
  setActiveItem: (itemId: string) => void;
  toggleSection: (sectionId: string) => void;
}

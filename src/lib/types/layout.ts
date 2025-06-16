import type { ReactNode } from 'react';

export interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export interface TopNavProps {
  className?: string;
  showDateRangePicker?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export interface MainContentProps {
  children: ReactNode;
  className?: string;
  hasSidebar?: boolean;
}

export interface UserDropdownProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  className?: string;
}

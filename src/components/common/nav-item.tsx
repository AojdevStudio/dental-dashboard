'use client';

import { Badge } from '@/components/ui/badge';
import type { NavItem } from '@/lib/types/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// biome-ignore lint/style/useImportType: React is needed for JSX runtime in tests
import React from 'react';

interface NavItemComponentProps {
  item: NavItem;
  isCollapsed?: boolean;
  isNested?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onItemClick?: (itemId: string) => void;
}

// Helper function to determine if nav item is active
function checkIsActive(href: string, pathname: string | null): boolean {
  if (!pathname) {
    return false;
  }
  if (href === '/') {
    return pathname === '/';
  }
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Extracted component for nav item content
function NavItemContent({
  item,
  isActive,
  isCollapsed,
  isNested,
  isExpanded,
  hasChildren,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  isNested: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
}) {
  const iconElement = item.icon && (
    <item.icon
      className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
      aria-hidden="true"
    />
  );

  if (isCollapsed) {
    return <>{iconElement}</>;
  }

  return (
    <>
      {iconElement}
      <span className={cn('flex-1 truncate', isNested ? 'text-sm' : '')}>{item.title}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
      {hasChildren && (
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function NavItemComponent({
  item,
  isCollapsed = false,
  isNested = false,
  isExpanded = false,
  onToggle,
  onItemClick,
}: NavItemComponentProps) {
  const pathname = usePathname();
  const isActive = checkIsActive(item.href, pathname);
  const hasChildren = Boolean(item.children && item.children.length > 0);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && onToggle) {
      e.preventDefault();
      onToggle();
    }
    if (onItemClick) {
      onItemClick(item.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (hasChildren && onToggle) {
        onToggle();
      }
      if (onItemClick) {
        onItemClick(item.id);
      }
    }
  };

  const className = cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent',
    isActive && 'bg-accent text-accent-foreground',
    item.disabled && 'pointer-events-none opacity-50',
    isNested && 'ml-9 py-1.5',
    isCollapsed && 'justify-center'
  );

  const content = (
    <NavItemContent
      item={item}
      isActive={isActive}
      isCollapsed={isCollapsed}
      isNested={isNested}
      isExpanded={isExpanded}
      hasChildren={hasChildren}
    />
  );

  if (item.external || hasChildren) {
    return (
      <a
        href={item.href}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={className}
        target={item.external ? '_blank' : undefined}
        rel={item.external ? 'noopener noreferrer' : undefined}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={item.disabled}
        aria-label={isCollapsed ? item.title : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={item.disabled}
      aria-label={isCollapsed ? item.title : undefined}
    >
      {content}
    </Link>
  );
}

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProviderWithLocations } from '@/types/providers';
import { MapPin, MoreHorizontal, User } from 'lucide-react';
import React from 'react';

/**
 * Context for sharing provider data across compound components
 */
const ProviderCardContext = React.createContext<ProviderWithLocations | null>(null);

/**
 * Hook to safely access provider context
 */
function useProviderCardContext(): ProviderWithLocations {
  const context = React.useContext(ProviderCardContext);
  if (!context) {
    throw new Error('ProviderCard components must be used within a ProviderCard.Root');
  }
  return context;
}

/**
 * Get provider initials for avatar fallback
 */
function getProviderInitials(provider: ProviderWithLocations): string {
  if (provider.firstName && provider.lastName) {
    return `${provider.firstName[0]}${provider.lastName[0]}`.toUpperCase();
  }
  return provider.name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Get status badge variant based on provider status
 */
function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'pending':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Get provider type badge variant
 */
function getProviderTypeVariant(
  providerType: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (providerType.toLowerCase()) {
    case 'dentist':
      return 'default';
    case 'hygienist':
      return 'secondary';
    case 'specialist':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Root component that provides context for all sub-components
 */
function Root({
  provider,
  children,
  className = '',
  onClick,
}: {
  provider: ProviderWithLocations;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <ProviderCardContext.Provider value={provider}>
      <Card
        className={`relative transition-all hover:shadow-md hover:border-gray-300 ${className}`}
        onClick={onClick}
      >
        {children}
      </Card>
    </ProviderCardContext.Provider>
  );
}

/**
 * Header section containing avatar, title, and actions
 */
function Header({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <CardHeader className={`pb-3 ${className}`}>
      <div className="flex items-start justify-between">{children}</div>
    </CardHeader>
  );
}

/**
 * Provider avatar with fallback initials
 */
function Avatar_({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const provider = useProviderCardContext();
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={undefined} alt={provider.name} />
      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
        {getProviderInitials(provider)}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * Provider name and basic info
 */
function Title() {
  const provider = useProviderCardContext();

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <Avatar_ />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{provider.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getProviderTypeVariant(provider.providerType)} className="text-xs">
              {provider.providerType}
            </Badge>
            <Badge variant={getStatusVariant(provider.status)} className="text-xs">
              {provider.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Action buttons and dropdown menu
 */
function Actions({
  onEdit,
  onViewDetails,
  showQuickActions = true,
}: {
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  showQuickActions?: boolean;
}) {
  const provider = useProviderCardContext();

  return (
    <div className="flex items-center gap-1">
      {showQuickActions && onViewDetails && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(provider);
          }}
          className="text-xs"
        >
          View
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onViewDetails && (
            <DropdownMenuItem onClick={() => onViewDetails(provider)}>
              <User className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(provider)}>
              <User className="mr-2 h-4 w-4" />
              Edit Provider
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <MapPin className="mr-2 h-4 w-4" />
            Manage Locations
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Main content area for metrics and details
 */
function Content({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <CardContent className={`pt-0 ${className}`}>{children}</CardContent>;
}

/**
 * Provider metrics display
 */
function Metrics({ compact = false }: { compact?: boolean }) {
  const provider = useProviderCardContext();

  const metrics = [
    {
      label: 'Locations',
      value: provider._count.locations,
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      label: 'Hygiene Records',
      value: provider._count.hygieneProduction,
      color: 'text-green-600',
    },
    {
      label: 'Dentist Records',
      value: provider._count.dentistProduction,
      color: 'text-purple-600',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-1">
            {metric.icon && <metric.icon className="h-3 w-3" />}
            <span className={metric.color}>{metric.value}</span>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="text-center">
          <div className={`text-lg font-semibold ${metric.color}`}>{metric.value}</div>
          <div className="text-xs text-gray-500">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Provider locations display
 */
function Locations({ maxDisplay = 2 }: { maxDisplay?: number }) {
  const provider = useProviderCardContext();

  if (provider.locations.length === 0) {
    return <div className="text-sm text-gray-500 italic">No locations assigned</div>;
  }

  const displayLocations = provider.locations.slice(0, maxDisplay);
  const remainingCount = provider.locations.length - maxDisplay;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
        <MapPin className="h-3 w-3" />
        Locations
      </div>
      <div className="space-y-1">
        {displayLocations.map((location) => (
          <div key={location.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-900">{location.locationName}</span>
            {location.isPrimary && (
              <Badge variant="outline" className="text-xs">
                Primary
              </Badge>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-gray-500">
            +{remainingCount} more location{remainingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Email contact info
 */
function Contact() {
  const provider = useProviderCardContext();

  if (!provider.email) {
    return null;
  }

  return (
    <div className="text-sm text-gray-600">
      <a
        href={`mailto:${provider.email}`}
        className="hover:text-blue-600 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {provider.email}
      </a>
    </div>
  );
}

/**
 * Compound component export
 */
export const ProviderCard = {
  Root,
  Header,
  Avatar: Avatar_,
  Title,
  Actions,
  Content,
  Metrics,
  Locations,
  Contact,
};

/**
 * Pre-composed compact card variant
 */
export function CompactProviderCard({
  provider,
  onEdit,
  onViewDetails,
  onClick,
}: {
  provider: ProviderWithLocations;
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  onClick?: () => void;
}) {
  return (
    <ProviderCard.Root provider={provider} onClick={onClick}>
      <ProviderCard.Header>
        <ProviderCard.Title />
        <ProviderCard.Actions
          onEdit={onEdit}
          onViewDetails={onViewDetails}
          showQuickActions={false}
        />
      </ProviderCard.Header>
      <ProviderCard.Content>
        <div className="space-y-3">
          <ProviderCard.Metrics compact={true} />
          <ProviderCard.Contact />
        </div>
      </ProviderCard.Content>
    </ProviderCard.Root>
  );
}

/**
 * Pre-composed detailed card variant
 */
export function DetailedProviderCard({
  provider,
  onEdit,
  onViewDetails,
  onClick,
}: {
  provider: ProviderWithLocations;
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  onClick?: () => void;
}) {
  return (
    <ProviderCard.Root provider={provider} onClick={onClick}>
      <ProviderCard.Header>
        <ProviderCard.Title />
        <ProviderCard.Actions onEdit={onEdit} onViewDetails={onViewDetails} />
      </ProviderCard.Header>
      <ProviderCard.Content>
        <div className="space-y-4">
          <ProviderCard.Metrics />
          <ProviderCard.Locations />
          <ProviderCard.Contact />
        </div>
      </ProviderCard.Content>
    </ProviderCard.Root>
  );
}

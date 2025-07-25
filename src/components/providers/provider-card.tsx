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
import { Skeleton } from '@/components/ui/skeleton';
// Note: Tooltip component not available, using hover states instead
import { useProviderMetrics } from '@/hooks/use-provider-metrics';
import type { ProviderWithLocations } from '@/types/providers';
import {
  DollarSign,
  MapPin,
  MoreHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
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
    .filter((w) => w.length) // guard against empty tokens
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
      <AvatarImage alt={provider.name} />
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
          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{provider.name}</p>
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
  onManageLocations,
  showQuickActions = true,
}: {
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  onManageLocations?: (provider: ProviderWithLocations) => void;
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
          {onManageLocations && (
            <DropdownMenuItem onClick={() => onManageLocations(provider)}>
              <MapPin className="mr-2 h-4 w-4" />
              Manage Locations
            </DropdownMenuItem>
          )}
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
 * Provider preview metrics component
 */
function PreviewMetrics({
  showAdvanced = false,
  compact = false,
}: {
  showAdvanced?: boolean;
  compact?: boolean;
}) {
  const provider = useProviderCardContext();

  // Fetch preview metrics with lightweight caching
  const {
    data: metrics,
    isLoading,
    isError,
  } = useProviderMetrics(
    {
      providerId: provider.id,
      period: 'monthly',
      includeComparative: false,
      includeGoals: false,
    },
    {
      enabled: showAdvanced,
      staleTime: 10 * 60 * 1000, // 10 minutes for preview
      gcTime: 30 * 60 * 1000, // 30 minutes cache
      refetchInterval: 0, // No background refetch for previews
    }
  );

  const baseMetrics = [
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

  // Advanced metrics from the provider metrics API
  const advancedMetrics = metrics
    ? [
        {
          label: 'Monthly Production',
          value: `$${metrics.financial.totalProduction.toLocaleString()}`,
          icon: DollarSign,
          color: 'text-green-600',
          trend: metrics.financial.productionGrowth,
        },
        {
          label: 'Collection Rate',
          value: `${(metrics.financial.collectionRate * 100).toFixed(1)}%`,
          icon: Target,
          color: 'text-blue-600',
          trend: metrics.comparative?.collectionVsAverage || 0,
        },
        {
          label: 'Total Patients',
          value: metrics.patient.totalPatients.toLocaleString(),
          icon: Users,
          color: 'text-purple-600',
          trend: 0, // Could calculate from patient growth
        },
      ]
    : [];

  const displayMetrics = showAdvanced && !isError ? advancedMetrics : baseMetrics;

  // Loading state for advanced metrics
  if (showAdvanced && isLoading) {
    return (
      <div className={compact ? 'flex items-center gap-4' : 'grid grid-cols-3 gap-3'}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`metric-skeleton-${i + 1}`}
            className={compact ? 'flex items-center gap-1' : 'text-center'}
          >
            <Skeleton className={compact ? 'h-3 w-8' : 'h-5 w-12 mb-1'} />
            <Skeleton className={compact ? 'h-3 w-16' : 'h-3 w-16'} />
          </div>
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs text-gray-600">
        {displayMetrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center gap-1 hover:bg-gray-50 px-1 py-0.5 rounded cursor-help"
            title={`${metric.label}${'trend' in metric && metric.trend !== undefined ? ` • ${metric.trend > 0 ? '+' : ''}${(metric.trend * 100).toFixed(1)}% vs average` : ''}`}
          >
            {metric.icon && <metric.icon className="h-3 w-3" />}
            <span className={metric.color}>{metric.value}</span>
            {'trend' in metric &&
              metric.trend !== undefined &&
              (metric.trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : metric.trend < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayMetrics.map((metric) => (
        <div
          key={metric.label}
          className="text-center hover:bg-gray-50 p-2 rounded transition-colors cursor-help"
          title={`${metric.label}${'trend' in metric && metric.trend !== undefined ? ` • ${metric.trend > 0 ? '+' : ''}${(metric.trend * 100).toFixed(1)}% vs average` : ''}`}
        >
          <div className="flex items-center justify-center gap-1">
            <span className={`text-lg font-semibold ${metric.color}`}>{metric.value}</span>
            {'trend' in metric &&
              metric.trend !== undefined &&
              (metric.trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : metric.trend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : null)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Provider metrics display (legacy)
 */
function Metrics({ compact = false }: { compact?: boolean }) {
  return <PreviewMetrics showAdvanced={false} compact={compact} />;
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
        {displayLocations.map((location: (typeof provider.locations)[0]) => (
          <div key={location.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-900 dark:text-gray-100">{location.locationName}</span>
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
  PreviewMetrics,
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
  onManageLocations,
  onClick,
}: {
  provider: ProviderWithLocations;
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  onManageLocations?: (provider: ProviderWithLocations) => void;
  onClick?: () => void;
}) {
  return (
    <ProviderCard.Root provider={provider} onClick={onClick}>
      <ProviderCard.Header>
        <ProviderCard.Title />
        <ProviderCard.Actions
          onEdit={onEdit}
          onViewDetails={onViewDetails}
          onManageLocations={onManageLocations}
          showQuickActions={true}
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
  onManageLocations,
  onClick,
}: {
  provider: ProviderWithLocations;
  onEdit?: (provider: ProviderWithLocations) => void;
  onViewDetails?: (provider: ProviderWithLocations) => void;
  onManageLocations?: (provider: ProviderWithLocations) => void;
  onClick?: () => void;
}) {
  return (
    <ProviderCard.Root provider={provider} onClick={onClick}>
      <ProviderCard.Header>
        <ProviderCard.Title />
        <ProviderCard.Actions
          onEdit={onEdit}
          onViewDetails={onViewDetails}
          onManageLocations={onManageLocations}
        />
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

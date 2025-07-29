# Multi-Location Admin Context Switching - Technical Architecture

*Created: July 2, 2025*  
*Related Story: [story-1.4-multi-location-admin-context-switching.md](./story-1.4-multi-location-admin-context-switching.md)*  
*Related Wireframes: [wireframes-multi-location-admin.md](./wireframes-multi-location-admin.md)*

## Architecture Overview

This document defines the complete technical architecture for implementing multi-location admin context switching in the dental dashboard application. The solution enables system administrators to seamlessly switch between individual clinic views and aggregated multi-location dashboards while maintaining security, performance, and data integrity.

## System Context

### Current Architecture
- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Security**: Multi-tenant RLS policies already implemented
- **Authentication**: Existing auth context with system admin role support
- **State Management**: Cookie-based session management

### New Requirements
- Location context switching for system administrators
- Cross-location data aggregation for "All Locations" view
- Real-time MTD metrics (Production, Collections, New Patients, Reviews)
- Secure multi-tenant isolation with admin override capability
- Audit logging for location context switches

## 1. Location Context Management Architecture

### Core Interface Design

```typescript
// src/lib/auth/location-context.ts
export interface LocationContext {
  selectedLocationId: 'all' | string;
  availableLocations: Clinic[];
  isSystemAdmin: boolean;
  canAccessAllLocations: boolean;
  lastSwitchTimestamp: Date;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export class LocationContextManager {
  private static readonly LOCATION_COOKIE = 'selectedClinicId';
  private static readonly COOKIE_OPTIONS = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  };

  // Cookie-based persistence
  static async setSelectedLocation(locationId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(this.LOCATION_COOKIE, locationId, this.COOKIE_OPTIONS);
    
    // Audit the location switch
    await this.auditLocationSwitch(locationId);
  }

  static async getSelectedLocation(): Promise<string | 'all'> {
    const cookieStore = await cookies();
    return cookieStore.get(this.LOCATION_COOKIE)?.value || 'all';
  }

  // Context validation
  static async validateLocationAccess(
    userId: string, 
    locationId: string
  ): Promise<boolean> {
    const userRoles = await getUserClinicRoles(userId);
    
    if (userRoles.some(role => role.role === 'system_admin')) {
      return true; // System admin can access any location
    }
    
    return userRoles.some(role => 
      role.clinicId === locationId && role.isActive
    );
  }

  static async getAvailableLocations(userId: string): Promise<Clinic[]> {
    const userRoles = await getUserClinicRoles(userId);
    
    if (userRoles.some(role => role.role === 'system_admin')) {
      return await getAllActiveClinics();
    }
    
    const clinicIds = userRoles
      .filter(role => role.isActive)
      .map(role => role.clinicId);
    
    return await getClinicsById(clinicIds);
  }

  // RLS context management
  static async setRLSContext(locationId: string | 'all'): Promise<void> {
    const isAllLocations = locationId === 'all';
    
    await prisma.$executeRaw`
      SELECT auth.set_location_context(${locationId}, ${isAllLocations})
    `;
  }

  // Audit logging
  private static async auditLocationSwitch(locationId: string): Promise<void> {
    const authContext = await getAuthContext();
    
    await prisma.auditLog.create({
      data: {
        userId: authContext?.userId,
        action: 'LOCATION_CONTEXT_SWITCH',
        details: {
          toLocation: locationId,
          timestamp: new Date(),
          userAgent: headers().get('user-agent'),
          ipAddress: headers().get('x-forwarded-for') || 'unknown'
        }
      }
    });
  }
}
```

## 2. Enhanced API Middleware Architecture

### Location-Aware Middleware

```typescript
// src/lib/api/location-middleware.ts
export interface LocationAwareRequest extends Request {
  locationContext: LocationContext;
  isAllLocationsView: boolean;
}

export function withLocationContext<T>(
  handler: (req: LocationAwareRequest, context: any) => Promise<T>,
  options: {
    requireSystemAdmin?: boolean;
    allowCrossLocation?: boolean;
  } = {}
) {
  return async (req: Request, context: any): Promise<Response> => {
    try {
      // 1. Get auth context
      const authContext = await getAuthContext();
      if (!authContext) {
        return new Response('Unauthorized', { status: 401 });
      }

      // 2. Check system admin requirement
      if (options.requireSystemAdmin && !authContext.isSystemAdmin) {
        return new Response('Forbidden: System admin required', { status: 403 });
      }

      // 3. Extract location from cookie
      const selectedLocation = await LocationContextManager.getSelectedLocation();
      
      // 4. Validate location access
      if (selectedLocation !== 'all') {
        const hasAccess = await LocationContextManager.validateLocationAccess(
          authContext.userId,
          selectedLocation
        );
        
        if (!hasAccess && !options.allowCrossLocation) {
          return new Response('Forbidden: Invalid location access', { status: 403 });
        }
      }

      // 5. Get available locations
      const availableLocations = await LocationContextManager.getAvailableLocations(
        authContext.userId
      );

      // 6. Set RLS context
      await LocationContextManager.setRLSContext(selectedLocation);

      // 7. Create location context
      const locationContext: LocationContext = {
        selectedLocationId: selectedLocation,
        availableLocations,
        isSystemAdmin: authContext.isSystemAdmin || false,
        canAccessAllLocations: authContext.isSystemAdmin || false,
        lastSwitchTimestamp: new Date()
      };

      // 8. Create enhanced request
      const locationAwareRequest = req as LocationAwareRequest;
      locationAwareRequest.locationContext = locationContext;
      locationAwareRequest.isAllLocationsView = selectedLocation === 'all';

      // 9. Call handler
      return await handler(locationAwareRequest, context);

    } catch (error) {
      console.error('Location middleware error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  };
}
```

## 3. Data Aggregation Architecture

### Metrics Aggregation System

```typescript
// src/lib/metrics/location-aggregator.ts
export interface SystemMetrics {
  production: AggregatedMetric;
  collections: AggregatedMetric;
  newPatients: AggregatedMetric;
  reviews: AggregatedMetric;
  clinicBreakdown: ClinicMetrics[];
  lastUpdated: Date;
}

export interface AggregatedMetric {
  current: number;
  target: number;
  progress: number; // percentage
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  variance: number;
}

export interface ClinicMetrics {
  clinicId: string;
  clinicName: string;
  production: MetricWithTarget;
  collections: MetricWithTarget;
  newPatients: MetricWithTarget;
  reviews: ReviewMetric;
}

export class LocationMetricsAggregator {
  // System-wide aggregated metrics
  static async getSystemWideMetrics(period: 'MTD' | 'YTD' = 'MTD'): Promise<SystemMetrics> {
    const startDate = period === 'MTD' 
      ? startOfMonth(new Date())
      : startOfYear(new Date());

    // Optimized single query with CTEs
    const result = await prisma.$queryRaw<any[]>`
      WITH monthly_production AS (
        SELECT 
          clinic_id,
          SUM(production_amount) as total_production,
          COUNT(DISTINCT patient_id) as patient_count
        FROM dentist_production dp
        WHERE dp.date >= ${startDate}
        GROUP BY clinic_id
      ),
      monthly_collections AS (
        SELECT 
          clinic_id,
          SUM(collection_amount) as total_collections
        FROM location_financials lf
        WHERE lf.date >= ${startDate}
        GROUP BY clinic_id
      ),
      monthly_reviews AS (
        SELECT 
          clinic_id,
          AVG(rating) as avg_rating,
          COUNT(*) as review_count
        FROM google_reviews gr
        WHERE gr.created_at >= ${startDate}
        GROUP BY clinic_id
      )
      SELECT 
        c.id as clinic_id,
        c.name as clinic_name,
        COALESCE(mp.total_production, 0) as production,
        COALESCE(mc.total_collections, 0) as collections,
        COALESCE(mp.patient_count, 0) as new_patients,
        COALESCE(mr.avg_rating, 0) as avg_rating,
        COALESCE(mr.review_count, 0) as review_count
      FROM clinics c
      LEFT JOIN monthly_production mp ON c.id = mp.clinic_id
      LEFT JOIN monthly_collections mc ON c.id = mc.clinic_id
      LEFT JOIN monthly_reviews mr ON c.id = mr.clinic_id
      WHERE c.is_active = true
    `;

    return this.transformToSystemMetrics(result);
  }

  // Individual clinic metrics
  static async getClinicMetrics(
    clinicId: string, 
    period: 'MTD' | 'YTD' = 'MTD'
  ): Promise<ClinicMetrics> {
    const startDate = period === 'MTD' 
      ? startOfMonth(new Date())
      : startOfYear(new Date());

    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        c.id as clinic_id,
        c.name as clinic_name,
        COALESCE(SUM(dp.production_amount), 0) as production,
        COALESCE(SUM(lf.collection_amount), 0) as collections,
        COALESCE(COUNT(DISTINCT dp.patient_id), 0) as new_patients,
        COALESCE(AVG(gr.rating), 0) as avg_rating,
        COALESCE(COUNT(gr.id), 0) as review_count
      FROM clinics c
      LEFT JOIN dentist_production dp ON c.id = dp.clinic_id AND dp.date >= ${startDate}
      LEFT JOIN location_financials lf ON c.id = lf.clinic_id AND lf.date >= ${startDate}
      LEFT JOIN google_reviews gr ON c.id = gr.clinic_id AND gr.created_at >= ${startDate}
      WHERE c.id = ${clinicId}
      GROUP BY c.id, c.name
    `;

    return this.transformToClinicMetrics(result[0]);
  }

  // Comparative analytics
  static async getLocationComparison(
    locationIds: string[], 
    period: string
  ): Promise<ComparisonData> {
    // Implementation for comparative charts
    const trends = await this.getTrendData(locationIds, period);
    return {
      trends,
      rankings: await this.getRankings(locationIds),
      insights: await this.generateInsights(locationIds)
    };
  }

  // Real-time updates subscription
  static async subscribeToMetricsUpdates(
    locationId: string | 'all'
  ): Promise<EventSource> {
    return new EventSource(`/api/metrics/stream?location=${locationId}`);
  }

  private static transformToSystemMetrics(rawData: any[]): SystemMetrics {
    // Transform raw query results to SystemMetrics interface
    const totalProduction = rawData.reduce((sum, row) => sum + Number(row.production), 0);
    const totalCollections = rawData.reduce((sum, row) => sum + Number(row.collections), 0);
    const totalNewPatients = rawData.reduce((sum, row) => sum + Number(row.new_patients), 0);
    
    return {
      production: {
        current: totalProduction,
        target: 25000, // TODO: Get from goals table
        progress: (totalProduction / 25000) * 100,
        trend: 'up', // TODO: Calculate from historical data
        trendValue: '+12%',
        variance: 0.12
      },
      collections: {
        current: totalCollections,
        target: 25000,
        progress: (totalCollections / 25000) * 100,
        trend: 'down',
        trendValue: '-3%',
        variance: -0.03
      },
      newPatients: {
        current: totalNewPatients,
        target: 20,
        progress: (totalNewPatients / 20) * 100,
        trend: 'up',
        trendValue: '+20%',
        variance: 0.20
      },
      reviews: {
        current: this.calculateWeightedAverage(rawData),
        target: 4.5,
        progress: (this.calculateWeightedAverage(rawData) / 5) * 100,
        trend: 'stable',
        trendValue: 'stable',
        variance: 0
      },
      clinicBreakdown: rawData.map(row => this.transformToClinicMetrics(row)),
      lastUpdated: new Date()
    };
  }

  private static transformToClinicMetrics(rawData: any): ClinicMetrics {
    return {
      clinicId: rawData.clinic_id,
      clinicName: rawData.clinic_name,
      production: {
        value: Number(rawData.production),
        target: 15000, // TODO: Get clinic-specific targets
        trend: 'up',
        trendValue: '+15%'
      },
      collections: {
        value: Number(rawData.collections),
        target: 15000,
        trend: 'down',
        trendValue: '-5%'
      },
      newPatients: {
        value: Number(rawData.new_patients),
        target: 10,
        trend: 'up',
        trendValue: '+40%'
      },
      reviews: {
        rating: Number(rawData.avg_rating),
        count: Number(rawData.review_count),
        trend: 'stable'
      }
    };
  }

  private static calculateWeightedAverage(data: any[]): number {
    const totalRating = data.reduce((sum, row) => 
      sum + (Number(row.avg_rating) * Number(row.review_count)), 0
    );
    const totalCount = data.reduce((sum, row) => sum + Number(row.review_count), 0);
    
    return totalCount > 0 ? totalRating / totalCount : 0;
  }
}
```

## 4. Enhanced RLS Architecture

### Database Functions and Policies

```sql
-- Location context management functions
CREATE OR REPLACE FUNCTION auth.get_location_context()
RETURNS TABLE(clinic_id UUID, is_all_locations BOOLEAN) AS $$
BEGIN
  RETURN QUERY SELECT 
    COALESCE(current_setting('app.selected_clinic_id', true)::uuid, NULL),
    COALESCE(current_setting('app.is_all_locations', true)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.set_location_context(
  location_id TEXT,
  is_all_locations BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  current_user_id TEXT;
  is_system_admin BOOLEAN := FALSE;
BEGIN
  current_user_id := auth.uid()::text;
  
  -- Check if user is system admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_clinic_roles ucr
    WHERE ucr.user_id = current_user_id
      AND ucr.role = 'system_admin'
      AND ucr.is_active = true
  ) INTO is_system_admin;
  
  -- Only system admins can set all locations context
  IF is_all_locations AND NOT is_system_admin THEN
    RAISE EXCEPTION 'Access denied: Only system admins can access all locations';
  END IF;
  
  -- Validate specific clinic access for non-all-locations requests
  IF NOT is_all_locations AND location_id != 'all' THEN
    IF NOT is_system_admin THEN
      -- Regular users must have access to the specific clinic
      IF NOT EXISTS (
        SELECT 1 FROM public.user_clinic_roles ucr
        WHERE ucr.user_id = current_user_id
          AND ucr.clinic_id = location_id::uuid
          AND ucr.is_active = true
      ) THEN
        RAISE EXCEPTION 'Access denied: User not authorized for clinic %', location_id;
      END IF;
    END IF;
  END IF;
  
  -- Set location context
  PERFORM set_config('app.selected_clinic_id', location_id, false);
  PERFORM set_config('app.is_all_locations', is_all_locations::text, false);
  PERFORM set_config('app.is_system_admin', is_system_admin::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- System admin bypass RLS policy
CREATE POLICY "system_admin_location_access" ON public.providers
FOR ALL TO authenticated
USING (
  -- Regular user: clinic-based isolation
  (auth.get_current_clinic_id() = clinic_id AND NOT auth.is_system_admin())
  OR
  -- System admin: location context or all locations
  (auth.is_system_admin() AND (
    auth.get_location_context().is_all_locations = true
    OR auth.get_location_context().clinic_id = clinic_id
    OR auth.get_location_context().clinic_id IS NULL
  ))
);

-- Apply similar policies to all multi-tenant tables
CREATE POLICY "system_admin_location_access" ON public.dentist_production
FOR ALL TO authenticated
USING (
  (auth.get_current_clinic_id() = clinic_id AND NOT auth.is_system_admin())
  OR
  (auth.is_system_admin() AND (
    auth.get_location_context().is_all_locations = true
    OR auth.get_location_context().clinic_id = clinic_id
    OR auth.get_location_context().clinic_id IS NULL
  ))
);

CREATE POLICY "system_admin_location_access" ON public.location_financials
FOR ALL TO authenticated
USING (
  (auth.get_current_clinic_id() = clinic_id AND NOT auth.is_system_admin())
  OR
  (auth.is_system_admin() AND (
    auth.get_location_context().is_all_locations = true
    OR auth.get_location_context().clinic_id = clinic_id
    OR auth.get_location_context().clinic_id IS NULL
  ))
);
```

## 5. Component Architecture

### Location Switcher Component System

```typescript
// src/components/location/location-switcher.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon, GlobeIcon, BuildingIcon } from 'lucide-react';

interface LocationSwitcherProps {
  currentLocation: string | 'all';
  availableLocations: Clinic[];
  isSystemAdmin: boolean;
  onLocationChange?: (locationId: string | 'all') => void;
}

export function LocationSwitcher({
  currentLocation,
  availableLocations,
  isSystemAdmin,
  onLocationChange
}: LocationSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationChange = async (locationId: string | 'all') => {
    if (locationId === currentLocation) return;

    setIsLoading(true);
    
    try {
      // Update location context via API
      const response = await fetch('/api/location/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId })
      });

      if (!response.ok) {
        throw new Error('Failed to switch location');
      }

      // Trigger callback
      onLocationChange?.(locationId);
      
      // Refresh the page to update all components
      router.refresh();
      
    } catch (error) {
      console.error('Location switch error:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocationDisplay = () => {
    if (currentLocation === 'all') {
      return {
        icon: <GlobeIcon className="h-4 w-4" />,
        name: 'All Locations'
      };
    }
    
    const clinic = availableLocations.find(c => c.id === currentLocation);
    return {
      icon: <BuildingIcon className="h-4 w-4" />,
      name: clinic?.name || 'Unknown Location'
    };
  };

  const currentDisplay = getCurrentLocationDisplay();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button 
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {currentDisplay.icon}
          <span>{currentDisplay.name}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          className="min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-50"
          sideOffset={4}
        >
          {isSystemAdmin && (
            <>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onSelect={() => handleLocationChange('all')}
              >
                <GlobeIcon className="h-4 w-4" />
                <span>All Locations</span>
                {currentLocation === 'all' && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="h-px bg-gray-200 mx-1" />
            </>
          )}

          {availableLocations.map((clinic) => (
            <DropdownMenu.Item
              key={clinic.id}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onSelect={() => handleLocationChange(clinic.id)}
            >
              <BuildingIcon className="h-4 w-4" />
              <span>{clinic.name}</span>
              {currentLocation === clinic.id && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </DropdownMenu.Item>
          ))}

          {isSystemAdmin && (
            <>
              <DropdownMenu.Separator className="h-px bg-gray-200 mx-1" />
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                onSelect={() => router.push('/admin/locations')}
              >
                <span>⚙️</span>
                <span>Manage Locations</span>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

## 6. API Architecture

### Location-Aware API Endpoints

```typescript
// src/app/api/location/switch/route.ts
import { NextRequest } from 'next/server';
import { withLocationContext } from '@/lib/api/location-middleware';
import { LocationContextManager } from '@/lib/auth/location-context';

export async function POST(request: NextRequest) {
  return withLocationContext(async (req) => {
    const { locationId } = await req.json();
    
    if (!locationId) {
      return new Response('Location ID required', { status: 400 });
    }

    // Validate access to requested location
    if (locationId !== 'all') {
      const hasAccess = await LocationContextManager.validateLocationAccess(
        req.locationContext.isSystemAdmin ? 'system' : req.locationContext.selectedLocationId,
        locationId
      );
      
      if (!hasAccess) {
        return new Response('Access denied to location', { status: 403 });
      }
    }

    // Set new location context
    await LocationContextManager.setSelectedLocation(locationId);
    
    return Response.json({ 
      success: true, 
      locationId,
      timestamp: new Date().toISOString()
    });
  }, { 
    requireSystemAdmin: false, 
    allowCrossLocation: true 
  });
}

// src/app/api/metrics/system/route.ts
export async function GET(request: NextRequest) {
  return withLocationContext(async (req) => {
    if (!req.locationContext.isSystemAdmin) {
      return new Response('System admin access required', { status: 403 });
    }
    
    const metrics = req.isAllLocationsView
      ? await LocationMetricsAggregator.getSystemWideMetrics()
      : await LocationMetricsAggregator.getClinicMetrics(
          req.locationContext.selectedLocationId
        );
    
    return Response.json(metrics);
  }, { 
    requireSystemAdmin: true, 
    allowCrossLocation: true 
  });
}

// src/app/api/metrics/clinic/[clinicId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;
  
  return withLocationContext(async (req) => {
    // Validate access to specific clinic
    if (!req.locationContext.canAccessAllLocations) {
      const hasAccess = req.locationContext.availableLocations.some(
        clinic => clinic.id === clinicId
      );
      
      if (!hasAccess) {
        return new Response('Access denied to clinic', { status: 403 });
      }
    }
    
    const metrics = await LocationMetricsAggregator.getClinicMetrics(clinicId);
    return Response.json(metrics);
  });
}

// src/app/api/metrics/stream/route.ts
export async function GET(request: NextRequest) {
  return withLocationContext(async (req) => {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location') || 'all';
    
    // Validate location access
    if (locationId !== 'all' && !req.locationContext.canAccessAllLocations) {
      const hasAccess = req.locationContext.availableLocations.some(
        clinic => clinic.id === locationId
      );
      
      if (!hasAccess) {
        return new Response('Access denied', { status: 403 });
      }
    }
    
    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        const sendUpdate = async () => {
          try {
            const metrics = locationId === 'all'
              ? await LocationMetricsAggregator.getSystemWideMetrics()
              : await LocationMetricsAggregator.getClinicMetrics(locationId);
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify(metrics)}\n\n`)
            );
          } catch (error) {
            console.error('Stream update error:', error);
          }
        };
        
        // Send initial data
        sendUpdate();
        
        // Set up interval for updates
        const interval = setInterval(sendUpdate, 30000); // 30 seconds
        
        // Cleanup function
        return () => {
          clearInterval(interval);
          controller.close();
        };
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
  });
}
```

## 7. Performance & Caching Architecture

### Caching Strategy

```typescript
// src/lib/cache/location-metrics-cache.ts
import { Redis } from 'ioredis';

export class LocationMetricsCache {
  private static redis: Redis;
  
  static {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  // Cache system-wide metrics (5 minutes)
  static async cacheSystemMetrics(metrics: SystemMetrics): Promise<void> {
    const key = 'system:metrics:MTD';
    await this.redis.setex(key, 300, JSON.stringify(metrics));
  }

  static async getSystemMetrics(): Promise<SystemMetrics | null> {
    const key = 'system:metrics:MTD';
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache clinic-specific metrics (2 minutes)
  static async cacheClinicMetrics(
    clinicId: string, 
    metrics: ClinicMetrics
  ): Promise<void> {
    const key = `clinic:${clinicId}:metrics:MTD`;
    await this.redis.setex(key, 120, JSON.stringify(metrics));
  }

  static async getClinicMetrics(clinicId: string): Promise<ClinicMetrics | null> {
    const key = `clinic:${clinicId}:metrics:MTD`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Invalidate cache on data updates
  static async invalidateLocationCache(locationId: string | 'all'): Promise<void> {
    if (locationId === 'all') {
      await this.redis.del('system:metrics:MTD');
      
      // Also invalidate all clinic caches
      const clinicKeys = await this.redis.keys('clinic:*:metrics:MTD');
      if (clinicKeys.length > 0) {
        await this.redis.del(...clinicKeys);
      }
    } else {
      await this.redis.del(`clinic:${locationId}:metrics:MTD`);
      // Invalidate system cache since it includes this clinic
      await this.redis.del('system:metrics:MTD');
    }
  }

  // Cache available locations for user (1 hour)
  static async cacheUserLocations(
    userId: string, 
    locations: Clinic[]
  ): Promise<void> {
    const key = `user:${userId}:locations`;
    await this.redis.setex(key, 3600, JSON.stringify(locations));
  }

  static async getUserLocations(userId: string): Promise<Clinic[] | null> {
    const key = `user:${userId}:locations`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
}
```

## 8. Security Architecture

### Access Control and Audit System

```typescript
// src/lib/security/location-access-control.ts
export class LocationAccessControl {
  // Validate system admin can access location
  static async validateSystemAdminAccess(
    userId: string,
    requestedLocation: string | 'all'
  ): Promise<boolean> {
    const user = await getUserWithRoles(userId);
    
    if (!user.roles.some(role => role.role === 'system_admin')) {
      return false;
    }
    
    if (requestedLocation === 'all') {
      return true; // System admin can access all locations view
    }
    
    // Validate specific clinic exists and is active
    const clinic = await prisma.clinic.findFirst({
      where: { id: requestedLocation, isActive: true }
    });
    
    return !!clinic;
  }

  // Audit location context switches
  static async auditLocationSwitch(
    userId: string,
    fromLocation: string | 'all',
    toLocation: string | 'all',
    request: Request
  ): Promise<void> {
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOCATION_CONTEXT_SWITCH',
        details: {
          fromLocation,
          toLocation,
          userAgent,
          ipAddress,
          timestamp: new Date(),
          sessionId: await this.getSessionId(request)
        }
      }
    });
  }

  // Rate limiting for location switches
  static async checkRateLimit(userId: string): Promise<boolean> {
    const key = `rate_limit:location_switch:${userId}`;
    const current = await LocationMetricsCache.redis.get(key);
    
    if (!current) {
      await LocationMetricsCache.redis.setex(key, 60, '1'); // 1 per minute
      return true;
    }
    
    const count = parseInt(current);
    if (count >= 10) { // Max 10 switches per minute
      return false;
    }
    
    await LocationMetricsCache.redis.incr(key);
    return true;
  }

  private static async getSessionId(request: Request): Promise<string> {
    // Extract session ID from cookies or generate one
    const sessionCookie = request.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('session='));
    
    return sessionCookie?.split('=')[1] || 'unknown';
  }
}
```

## 9. Implementation Roadmap

### Phase 1: Backend Foundation (Days 1-2)
- [ ] Location Context Manager implementation
- [ ] Enhanced API middleware with location awareness
- [ ] RLS policy updates for system admin bypass
- [ ] Database query optimization for aggregation
- [ ] Basic audit logging setup

### Phase 2: Component Architecture (Days 3-4)
- [ ] Location Switcher compound component
- [ ] Dashboard layout components (All locations vs single clinic)
- [ ] KPI metric components with progress bars
- [ ] Real-time data hooks with Server-Sent Events
- [ ] Mobile responsive implementations

### Phase 3: Integration & Security (Days 5-6)
- [ ] API endpoint implementations
- [ ] Security validation and access control
- [ ] Performance optimization with caching
- [ ] Error handling and retry logic
- [ ] Rate limiting implementation

### Phase 4: Testing & Refinement (Days 7-8)
- [ ] Unit tests for all components
- [ ] Integration tests for location switching flows
- [ ] E2E tests for complete admin workflows
- [ ] Performance testing for aggregated queries
- [ ] Security testing for multi-tenant isolation

## 10. Technical Dependencies

### Required Package Installations
```json
{
  "dependencies": {
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "ioredis": "^5.3.2",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/ioredis": "^5.0.0"
  }
}
```

### Environment Variables
```env
# Redis for caching
REDIS_URL=redis://localhost:6379

# Rate limiting configuration
LOCATION_SWITCH_RATE_LIMIT=10
LOCATION_SWITCH_WINDOW=60

# Audit logging
AUDIT_LOG_RETENTION_DAYS=90
```

### Database Migrations
- Location context functions and enhanced RLS policies
- Audit logging table for location context switches
- Performance indexes for aggregation queries
- User clinic roles table enhancements

---

*This technical architecture provides a comprehensive foundation for implementing secure, performant, and maintainable multi-location admin context switching. All components are designed to work together while maintaining separation of concerns and following established patterns in the existing codebase.* 
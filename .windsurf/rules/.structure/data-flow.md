---
trigger: model_decision
description: Implementing data flow architecture
globs: 
---

# Data Flow Architecture

## Core Principles

- All business logic and calculations happen on the server
- Client components handle UI state and user interactions only
- Data is pre-calculated before being sent to the client
- Maintain a clear separation between data fetching, processing, and presentation

## Service Layer

- Create data service files in `src/services/` folder that handle all business logic and calculations
- Service methods should be pure functions with clear inputs and outputs
- Group services by domain (metrics, appointments, patients, etc.)
- All complex logic belongs in the service layer, not in components or API routes

Example service structure:
```
src/services/
├── metrics/
│   ├── calculations.ts     # Core metric calculations
│   ├── transformations.ts  # Data transformations
│   └── index.ts            # Public API for the service
├── appointments/
│   ├── scheduling.ts       # Appointment scheduling logic
│   └── index.ts
└── patients/
    ├── demographics.ts     # Patient demographic analysis
    └── index.ts
```

## Data Fetching Patterns

### Server Components

- Server Components fetch data directly using service methods
- Pre-calculate all derived values on the server
- Pass only the necessary data to child components

Example:
```tsx
// src/app/dashboard/page.tsx
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { MetricsService } from '@/services/metrics'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Fetch raw data from Supabase
  const { data: metrics } = await supabase.from('metrics').select('*')
  
  // Process data in the service layer
  const processedMetrics = MetricsService.processMetrics(metrics)
  
  return (
    <DashboardLayout>
      <MetricsOverview data={processedMetrics} />
    </DashboardLayout>
  )
}
```

### API Route Handlers

- Create API routes at `src/app/api/[domain]/route.ts` for client-side data fetching
- API routes should call service methods to process data
- Return pre-calculated results to minimize client-side processing

Example:
```tsx
// src/app/api/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { MetricsService } from '@/services/metrics'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Get query parameters
  const searchParams = request.nextUrl.searchParams
  const clinicId = searchParams.get('clinicId')
  const startDate = searchParams.get('startDate')
  
  // Fetch raw data
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('clinicId', clinicId)
  
  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
  
  // Process in service layer
  const processedData = MetricsService.processMetrics(data, startDate)
  
  // Return pre-calculated data
  return NextResponse.json(processedData)
}
```

### Client Components

- Client Components should ONLY handle:
  - UI state (loading, error, form input values)
  - User interactions (clicks, form submissions)
  - Animations and transitions
- NEVER perform data transformations or calculations on the client

Example:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Correct: Only handling UI state and interactions
export function DateRangePicker({ onRangeChange }) {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  
  const handleApply = () => {
    // Only passes the data to a callback, no calculations
    onRangeChange({ startDate, endDate })
  }
  
  return (
    <div>
      {/* UI components */}
      <Button onClick={handleApply}>Apply</Button>
    </div>
  )
}
```

## Server Actions

- Use Server Actions for data mutations
- Place actions in `src/actions/` directory
- Server Actions should call service methods for business logic
- Return pre-calculated results to the client

Example:
```tsx
// src/actions/appointments/schedule.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { AppointmentService } from '@/services/appointments'

export async function scheduleAppointment(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // Extract data from form
  const patientId = formData.get('patientId') as string
  const providerId = formData.get('providerId') as string
  const date = new Date(formData.get('date') as string)
  
  // Validate in service layer
  const validationResult = AppointmentService.validateAppointment({ patientId, providerId, date })
  if (!validationResult.valid) {
    return { error: validationResult.errors }
  }
  
  // Process in service layer
  const result = await AppointmentService.scheduleAppointment({ patientId, providerId, date })
  
  // Revalidate affected paths
  revalidatePath('/appointments')
  revalidatePath(`/patients/${patientId}`)
  
  return result
}
```

## State Management

- Use React Context sparingly and only for UI state
- Avoid storing data that requires processing in context
- Keep data flow unidirectional: server → client

## Data Caching

- Implement caching at the service layer when appropriate
- Use Next.js built-in caching mechanisms for data fetching
- Use React Query/SWR on the client only for managing remote state (loading, error states)

This architecture ensures all calculations happen on the server, providing consistent results while minimizing client-side JavaScript execution.
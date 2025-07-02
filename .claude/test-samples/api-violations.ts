// This is an API route file with naming violation
// Should be named 'route.ts' not 'api-violations.ts'

import { NextResponse } from 'next/server'

// ❌ No proper error handling
export function GET(request: Request) {
  const data = fetchSomeData()
  return NextResponse.json(data)
}

// ❌ No authentication middleware
// ❌ No input validation
export async function POST(request: Request) {
  const body = await request.json()
  
  // Direct database operation without validation
  const result = await prisma.provider.create({
    data: body
  })
  
  return NextResponse.json(result)
}

// ❌ Using any type in API
function fetchSomeData(): any {
  return { message: 'data' }
}
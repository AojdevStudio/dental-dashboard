// This file contains intentional violations for testing hooks

import { Provider } from '@/types/provider'
import React from 'react'
import { format } from 'date-fns'
import { useState } from 'react'
import type { User } from '@/types/user'

// ❌ Using var instead of const/let
var oldStyleVariable = 'bad practice'

// ❌ Using any type
const processData = (data: any): any => {
  return data
}

// ❌ No explicit types
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ Empty catch block
const fetchData = async () => {
  try {
    const response = await fetch('/api/data')
    return response.json()
  } catch (e) {} // Bad - empty catch
}

// ❌ Magic numbers without constants
const getPageSize = () => {
  return 25 // Should be a named constant
}

// ❌ Poor null safety
const getProviderName = (provider: Provider | null) => {
  return provider.name // Missing null check
}

// ❌ Component with poor structure
export const BadComponent: React.FC = () => {
  // Hooks after logic (should be at top)
  const data = processData({ id: 1 })
  
  const [loading, setLoading] = useState(false)
  
  return <div>{data}</div>
}
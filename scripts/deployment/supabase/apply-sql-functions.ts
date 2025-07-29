#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function applySqlFunctions() {
  console.log('🔧 Applying PostgreSQL functions...')
  
  try {
    // Read the SQL functions file
    const sqlPath = join(process.cwd(), 'sql/sync-resilience-functions.sql')
    const sqlContent = readFileSync(sqlPath, 'utf-8')
    
    // Split by function boundaries and execute each function separately
    const functionBlocks = sqlContent.split(/(?=CREATE OR REPLACE FUNCTION)/).filter(block => block.trim())
    
    for (let i = 0; i < functionBlocks.length; i++) {
      const block = functionBlocks[i].trim()
      if (block) {
        console.log(`📝 Applying function block ${i + 1}/${functionBlocks.length}...`)
        await prisma.$executeRawUnsafe(block)
      }
    }
    
    console.log('✅ All PostgreSQL functions applied successfully!')
    
    // Test one of the functions
    console.log('🧪 Testing generate_stable_code function...')
    const testResult = await prisma.$queryRaw`SELECT generate_stable_code('Dr. Obinna Ezeji') as result`
    console.log('Test result:', testResult)
    
  } catch (error) {
    console.error('❌ Error applying SQL functions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

applySqlFunctions()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
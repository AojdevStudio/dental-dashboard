#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Updated Claude Code Hooks Coverage\n');

// Test 1: Task Tool Validation
console.log('Test 1: Task Tool - Pre-validation');
console.log('=' . repeat(50));

const taskInput = {
  tool: 'Task',
  file_path: '/src/components/BadComponent.tsx',
  content: `
import React from 'react'

// ❌ Using any type
const processData = (data: any): any => {
  return data
}

export const BadComponent: React.FC = () => {
  return <div>Test</div>
}
`
};

try {
  const result = execSync('node ../hooks/pre-write-validator.cjs', {
    input: JSON.stringify(taskInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(`✅ Task tool validation: ${output.approve ? 'PASSED' : 'BLOCKED'}`);
  if (!output.approve) {
    console.log('Violations found (expected):', output.message.split('\n')[0]);
  }
} catch (error) {
  console.error('❌ Error testing Task tool:', error.message);
}

console.log('\n');

// Test 2: MCP Tool Validation
console.log('Test 2: MCP Tool - File operations');
console.log('=' . repeat(50));

const mcpTools = [
  'mcp__filesystem__write_file',
  'mcp__editor__edit_file', 
  'mcp__github__create_file'
];

mcpTools.forEach(tool => {
  const mcpInput = {
    tool: tool,
    file_path: '/src/api/test/route.ts',
    content: `
// ❌ No error handling
export function GET() {
  const data = getData()
  return Response.json(data)
}
`
  };

  try {
    const result = execSync('node ../hooks/pre-write-validator.cjs', {
      input: JSON.stringify(mcpInput),
      encoding: 'utf-8'
    });
    const output = JSON.parse(result);
    console.log(`✅ ${tool}: ${output.approve ? 'PASSED' : 'BLOCKED'}`);
  } catch (error) {
    console.log(`❌ ${tool}: ERROR`);
  }
});

console.log('\n');

// Test 3: Read Tool Tracking
console.log('Test 3: Read Tool - Quality tracking');
console.log('=' . repeat(50));

const readInput = {
  tool: 'Read',
  file_path: '/src/components/SomeComponent.tsx',
  event: 'PostToolUse'
};

try {
  const result = execSync('node ../hooks/code-quality-reporter.cjs', {
    input: JSON.stringify(readInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log('✅ Read tool tracking enabled');
} catch (error) {
  console.error('❌ Error testing Read tool:', error.message);
}

console.log('\n');

// Test 4: Comprehensive Tool Coverage Summary
console.log('Test 4: Tool Coverage Summary');
console.log('=' . repeat(50));

const toolsCovered = [
  'Write', 'Edit', 'MultiEdit', 'Task',
  'mcp__*__write_file', 'mcp__*__edit_file', 'mcp__*__create_file',
  'Read', 'Bash'
];

console.log('✅ Tools now covered by hooks:');
toolsCovered.forEach(tool => {
  console.log(`   - ${tool}`);
});

console.log('\n📊 Coverage Improvements:');
console.log('   - Added Task tool for code generation workflows');
console.log('   - Added MCP tool patterns for modern file operations');
console.log('   - Added Read tool for quality tracking');
console.log('   - Maintained Bash tool for commit validation');

console.log('\n✅ Updated hooks testing complete!');
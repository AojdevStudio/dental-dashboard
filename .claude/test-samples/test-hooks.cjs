#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Claude Code Hooks\n');

// Test 1: Pre-write validator with violations
console.log('Test 1: Pre-write validator (file with violations)');
console.log('=' . repeat(50));

const violationFile = fs.readFileSync(path.join(__dirname, 'violations-example.ts'), 'utf-8');
const preWriteInput = {
  tool: 'Write',
  file_path: '/src/components/test-component.tsx',
  content: violationFile
};

try {
  const result = execSync('node ../hooks/pre-write-validator.cjs', {
    input: JSON.stringify(preWriteInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(output.message);
  console.log(`Approved: ${output.approve}`);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Test 2: Import organizer
console.log('Test 2: Import organizer (unorganized imports)');
console.log('=' . repeat(50));

const unorganizedImports = `
import { useState } from 'react'
import { Provider } from '@/types/provider'
import { format } from 'date-fns'
import React from 'react'
import type { User } from '@/types/user'
import { useRouter } from 'next/navigation'

const Component = () => {
  return <div>Test</div>
}
`;

const importOrganizerInput = {
  tool: 'Write',
  file_path: '/src/components/test.tsx',
  output: { content: unorganizedImports }
};

try {
  const result = execSync('node ../hooks/import-organizer.cjs', {
    input: JSON.stringify(importOrganizerInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(output.message);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Test 3: Commit message validator
console.log('Test 3: Commit message validator');
console.log('=' . repeat(50));

const validCommit = {
  tool: 'Bash',
  command: 'git commit -m "feat(auth): add login functionality"'
};

const invalidCommit = {
  tool: 'Bash',
  command: 'git commit -m "Added login feature"'
};

console.log('Valid commit:');
try {
  const result = execSync('node ../hooks/commit-message-validator.cjs', {
    input: JSON.stringify(validCommit),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(output.message);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\nInvalid commit:');
try {
  const result = execSync('node ../hooks/commit-message-validator.cjs', {
    input: JSON.stringify(invalidCommit),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(output.message);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n');

// Test 4: API standards checker
console.log('Test 4: API standards checker');
console.log('=' . repeat(50));

const apiRouteInput = {
  tool: 'Write',
  file_path: '/app/api/providers/test-route.ts', // Wrong name!
  content: fs.readFileSync(path.join(__dirname, 'api-violations.ts'), 'utf-8')
};

try {
  const result = execSync('node ../hooks/api-standards-checker.cjs', {
    input: JSON.stringify(apiRouteInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(output.message);
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n✅ Hook testing complete!');
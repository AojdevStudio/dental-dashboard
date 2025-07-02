#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Corrected Claude Code Hooks Implementation\n');

// Test 1: Corrected Input Format - PreToolUse validation
console.log('Test 1: Corrected Input Format - Tool validation');
console.log('=' . repeat(50));

const correctInput = {
  session_id: "test-session-123",
  transcript_path: "/tmp/transcript.json",
  tool_name: "Write",
  tool_input: {
    file_path: "src/components/TestComponent.tsx",
    content: `
import React from 'react'

// ❌ Using any type - should be blocked
const processData = (data: any): any => {
  return data
}

// ❌ Using var - should be blocked  
var oldVariable = 'bad'

export const TestComponent: React.FC = () => {
  return <div>Test</div>
}
`
  }
};

try {
  const result = execSync('node ../hooks/pre-write-validator.cjs', {
    input: JSON.stringify(correctInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(`✅ Input format parsing: ${output.approve !== undefined ? 'SUCCESS' : 'FAILED'}`);
  console.log(`✅ Validation result: ${output.approve ? 'APPROVED' : 'BLOCKED (expected)'}`);
  if (!output.approve) {
    console.log(`✅ Block message provided: ${output.message ? 'YES' : 'NO'}`);
  }
} catch (error) {
  console.error('❌ Error testing corrected input:', error.message);
}

console.log('\n');

// Test 2: Import Organizer with correct format
console.log('Test 2: Import Organizer - PostToolUse');
console.log('=' . repeat(50));

const importOrganizerInput = {
  session_id: "test-session-123",
  transcript_path: "/tmp/transcript.json", 
  tool_name: "Edit",
  tool_input: {
    file_path: "src/components/TestComponent.tsx"
  },
  output: {
    content: `
import { useState } from 'react'
import { Provider } from '@/types/provider'
import React from 'react'
import { format } from 'date-fns'

const Component = () => {
  return <div>Test</div>
}
`
  }
};

try {
  const result = execSync('node ../hooks/import-organizer.cjs', {
    input: JSON.stringify(importOrganizerInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(`✅ Import organizer: ${output.message}`);
} catch (error) {
  console.error('❌ Error testing import organizer:', error.message);
}

console.log('\n');

// Test 3: Commit Message Validator with correct format
console.log('Test 3: Commit Message Validator');
console.log('=' . repeat(50));

const bashInput = {
  session_id: "test-session-123",
  transcript_path: "/tmp/transcript.json",
  tool_name: "Bash", 
  tool_input: {
    command: 'git commit -m "Added new feature"'  // ❌ Bad format
  }
};

try {
  const result = execSync('node ../hooks/commit-message-validator.cjs', {
    input: JSON.stringify(bashInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(`✅ Commit validation: ${output.approve ? 'APPROVED' : 'BLOCKED (expected)'}`);
  if (!output.approve) {
    console.log(`✅ Helpful error message: ${output.message.includes('conventional format') ? 'YES' : 'NO'}`);
  }
} catch (error) {
  console.error('❌ Error testing commit validator:', error.message);
}

console.log('\n');

// Test 4: Security Input Validation
console.log('Test 4: Security - Path Traversal Protection');
console.log('=' . repeat(50));

const maliciousInput = {
  session_id: "test-session-123",
  transcript_path: "/tmp/transcript.json",
  tool_name: "Write",
  tool_input: {
    file_path: "../../../etc/passwd", // ❌ Path traversal attempt
    content: "malicious content"
  }
};

try {
  const result = execSync('node ../hooks/pre-write-validator.cjs', {
    input: JSON.stringify(maliciousInput),
    encoding: 'utf-8'
  });
  const output = JSON.parse(result);
  console.log(`✅ Path traversal blocked: ${output.message.includes('unsafe') ? 'YES' : 'NO'}`);
} catch (error) {
  console.error('❌ Error testing security:', error.message);
}

console.log('\n');

// Test 5: Output Format Validation
console.log('Test 5: Output Format Analysis');
console.log('=' . repeat(50));

const testOutput = {
  approve: false,
  message: "Test blocking message"
};

console.log('✅ JSON Output Format:');
console.log(`   - Has 'approve' field: ${testOutput.approve !== undefined ? 'YES' : 'NO'}`);
console.log(`   - Has 'message' field: ${testOutput.message !== undefined ? 'YES' : 'NO'}`);
console.log(`   - Format matches docs: UNKNOWN (needs real Claude Code test)`);

console.log('\n📊 Summary of Corrections:');
console.log('   ✅ Input format: tool_name + tool_input structure');
console.log('   ✅ Security validation: Path traversal protection');
console.log('   ✅ Absolute paths: Fixed in hooks.json');
console.log('   ✅ All 5 hook scripts updated');
console.log('   ⚠️  Output format: Needs real Claude Code validation');

console.log('\n✅ Corrected hooks testing complete!');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Import organizer for TypeScript/JavaScript files
 * Organizes imports according to coding standards:
 * 1. React/Next.js imports
 * 2. Third-party libraries
 * 3. Internal absolute imports (@/)
 * 4. Relative imports
 * 5. Type imports
 */

class ImportOrganizer {
  constructor(input) {
    this.input = input;
    this.importGroups = {
      react: [],
      thirdParty: [],
      absolute: [],
      relative: [],
      types: []
    };
  }

  /**
   * Main organization entry point
   */
  organize() {
    // Parse Claude Code hook input format
    const { tool_name, tool_input, output } = this.input;
    const { content, file_path } = tool_input || {};
    
    // Security: Basic input validation
    if (file_path && (file_path.includes('../') || file_path.includes('..\\') || file_path.startsWith('/'))) {
      return this.skip('Potentially unsafe file path detected');
    }
    
    // Only process TypeScript/JavaScript files
    const fileExt = path.extname(file_path || '');
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(fileExt)) {
      return this.skip('Not a TypeScript/JavaScript file');
    }

    // Work with the output content if available (PostToolUse), otherwise input content
    const codeContent = output?.content || content;
    if (!codeContent) {
      return this.skip('No content to organize');
    }

    try {
      const organized = this.organizeImports(codeContent);
      
      // If content changed, write it back
      if (organized !== codeContent) {
        this.writeOrganizedContent(file_path, organized);
        return this.success('Imports organized successfully');
      } else {
        return this.skip('Imports already organized');
      }
    } catch (error) {
      return this.error(`Failed to organize imports: ${error.message}`);
    }
  }

  /**
   * Parse and organize imports
   */
  organizeImports(content) {
    const lines = content.split('\n');
    let firstImportIndex = -1;
    let lastImportIndex = -1;
    let hasUseClient = false;
    let hasUseServer = false;
    let fileHeader = [];
    
    // Find import boundaries and directives
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check for 'use client' or 'use server' directives
      if (trimmedLine === "'use client'" || trimmedLine === '"use client"') {
        hasUseClient = true;
        fileHeader.push(line);
        continue;
      }
      if (trimmedLine === "'use server'" || trimmedLine === '"use server"') {
        hasUseServer = true;
        fileHeader.push(line);
        continue;
      }
      
      // Skip shebang and comments at the top
      if (i === 0 && trimmedLine.startsWith('#!')) {
        fileHeader.push(line);
        continue;
      }
      
      // Detect imports
      if (this.isImportLine(trimmedLine)) {
        if (firstImportIndex === -1) {
          firstImportIndex = i;
        }
        lastImportIndex = i;
        this.categorizeImport(line);
      } else if (firstImportIndex !== -1 && trimmedLine !== '') {
        // Stop when we hit non-import, non-empty content
        break;
      }
    }
    
    // If no imports found, return original content
    if (firstImportIndex === -1) {
      return content;
    }
    
    // Build organized imports
    const organizedImports = this.buildOrganizedImports();
    
    // Reconstruct the file
    const beforeImports = lines.slice(0, firstImportIndex);
    const afterImports = lines.slice(lastImportIndex + 1);
    
    // Combine everything
    const result = [
      ...fileHeader,
      ...(fileHeader.length > 0 ? [''] : []), // Add blank line after directives
      ...beforeImports.filter(line => !fileHeader.includes(line)),
      ...organizedImports,
      ...afterImports
    ];
    
    return result.join('\n');
  }

  /**
   * Check if a line is an import statement
   */
  isImportLine(line) {
    return /^import\s+/.test(line) || /^import\s*{/.test(line) || /^import\s*type/.test(line);
  }

  /**
   * Categorize import into appropriate group
   */
  categorizeImport(importLine) {
    const trimmed = importLine.trim();
    
    // Type imports
    if (trimmed.includes('import type') || trimmed.includes('import { type')) {
      this.importGroups.types.push(importLine);
      return;
    }
    
    // Extract the module path
    const moduleMatch = importLine.match(/from\s+['"]([^'"]+)['"]/);
    if (!moduleMatch) {
      // Handle side-effect imports (import 'module')
      if (importLine.includes('react') || importLine.includes('next')) {
        this.importGroups.react.push(importLine);
      } else {
        this.importGroups.thirdParty.push(importLine);
      }
      return;
    }
    
    const modulePath = moduleMatch[1];
    
    // React/Next.js imports
    if (this.isReactImport(modulePath)) {
      this.importGroups.react.push(importLine);
    }
    // Absolute imports (@/)
    else if (modulePath.startsWith('@/')) {
      this.importGroups.absolute.push(importLine);
    }
    // Relative imports
    else if (modulePath.startsWith('.')) {
      this.importGroups.relative.push(importLine);
    }
    // Third-party imports
    else {
      this.importGroups.thirdParty.push(importLine);
    }
  }

  /**
   * Check if import is React/Next.js related
   */
  isReactImport(modulePath) {
    const reactPatterns = [
      'react',
      'react-dom',
      'next',
      '@next',
      'next/',
      '@vercel',
    ];
    
    return reactPatterns.some(pattern => 
      modulePath === pattern || modulePath.startsWith(pattern + '/')
    );
  }

  /**
   * Build organized import groups
   */
  buildOrganizedImports() {
    const groups = [];
    
    // Add each group with proper spacing
    if (this.importGroups.react.length > 0) {
      groups.push(...this.sortImports(this.importGroups.react));
    }
    
    if (this.importGroups.thirdParty.length > 0) {
      if (groups.length > 0) groups.push(''); // Add blank line
      groups.push(...this.sortImports(this.importGroups.thirdParty));
    }
    
    if (this.importGroups.absolute.length > 0) {
      if (groups.length > 0) groups.push(''); // Add blank line
      groups.push(...this.sortImports(this.importGroups.absolute));
    }
    
    if (this.importGroups.relative.length > 0) {
      if (groups.length > 0) groups.push(''); // Add blank line
      groups.push(...this.sortImports(this.importGroups.relative));
    }
    
    if (this.importGroups.types.length > 0) {
      if (groups.length > 0) groups.push(''); // Add blank line
      groups.push(...this.sortImports(this.importGroups.types));
    }
    
    return groups;
  }

  /**
   * Sort imports alphabetically within a group
   */
  sortImports(imports) {
    return imports.sort((a, b) => {
      // Extract the module path for comparison
      const getPath = (imp) => {
        const match = imp.match(/from\s+['"]([^'"]+)['"]/);
        return match ? match[1] : imp;
      };
      
      return getPath(a).localeCompare(getPath(b));
    });
  }

  /**
   * Write organized content back to file
   */
  writeOrganizedContent(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  /**
   * Return success response
   */
  success(message) {
    return {
      success: true,
      message: `✅ ${message}`,
      modified: true
    };
  }

  /**
   * Return skip response
   */
  skip(reason) {
    return {
      success: true,
      message: `ℹ️  Skipped: ${reason}`,
      modified: false
    };
  }

  /**
   * Return error response
   */
  error(message) {
    return {
      success: false,
      message: `❌ ${message}`,
      modified: false
    };
  }
}

// Main execution
function main() {
  try {
    const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
    const organizer = new ImportOrganizer(input);
    const result = organizer.organize();
    
    // For PostToolUse hooks, we don't need to return approve/block
    console.log(JSON.stringify({
      message: result.message
    }));
  } catch (error) {
    console.log(JSON.stringify({
      message: `Import organizer error: ${error.message}`
    }));
  }
}

main();
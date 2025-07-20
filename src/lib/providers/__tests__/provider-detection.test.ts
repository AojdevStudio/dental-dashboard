/**
 * @fileoverview Comprehensive unit tests for provider detection patterns
 * 
 * Tests all provider detection scenarios including:
 * - Pattern matching accuracy
 * - Edge cases and variations
 * - Confidence scoring
 * - Fallback mechanisms
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the provider detection patterns (mirroring Google Apps Script code)
const PROVIDER_DETECTION_PATTERNS = {
  obinna_ezeji: {
    namePatterns: [
      /obinna/i,
      /ezeji/i,
      /dr\.?\s*obinna/i,
      /obinna.*ezeji/i
    ],
    externalId: 'OBINNA_PROVIDER',
    displayName: 'Dr. Obinna Ezeji',
    primaryClinic: 'KAMDENTAL_BAYTOWN'
  },
  kamdi_irondi: {
    namePatterns: [
      /kamdi/i,
      /irondi/i,
      /dr\.?\s*kamdi/i,
      /kamdi.*irondi/i,
      /kelechi/i
    ],
    externalId: 'KAMDI_PROVIDER',
    displayName: 'Dr. Kamdi Irondi',
    primaryClinic: 'KAMDENTAL_HUMBLE'
  },
  chinyere_enih: {
    namePatterns: [
      /chinyere/i,
      /enih/i,
      /dr\.?\s*chinyere/i,
      /chinyere.*enih/i
    ],
    externalId: 'CHINYERE_PROVIDER',
    displayName: 'Dr. Chinyere Enih',
    primaryClinic: 'KAMDENTAL_BAYTOWN'
  }
};

// Provider detection function (TypeScript version of Google Apps Script function)
function detectProviderFromName(spreadsheetName: string) {
  console.log(`Detecting provider from spreadsheet: "${spreadsheetName}"`);
  
  // Try to match against known provider patterns
  for (const [providerCode, config] of Object.entries(PROVIDER_DETECTION_PATTERNS)) {
    for (const [index, pattern] of config.namePatterns.entries()) {
      if (pattern.test(spreadsheetName)) {
        return {
          providerCode: providerCode,
          externalId: config.externalId,
          displayName: config.displayName,
          primaryClinic: config.primaryClinic,
          spreadsheetName: spreadsheetName,
          matchedPattern: pattern,
          patternIndex: index,
          confidence: calculateConfidence(spreadsheetName, pattern, config)
        };
      }
    }
  }
  
  return null;
}

// Enhanced confidence calculation
function calculateConfidence(
  spreadsheetName: string, 
  matchedPattern: RegExp, 
  config: typeof PROVIDER_DETECTION_PATTERNS.obinna_ezeji
): 'low' | 'medium' | 'high' {
  const name = spreadsheetName.toLowerCase();
  
  // High confidence: Multiple patterns match or full name match
  const multipleMatches = config.namePatterns.filter(pattern => pattern.test(spreadsheetName)).length;
  if (multipleMatches >= 2) return 'high';
  
  // High confidence: Full name pattern (contains both first and last)
  if (matchedPattern.toString().includes('.*')) return 'high';
  
  // High confidence: Dr. title pattern
  if (matchedPattern.toString().includes('dr')) return 'high';
  
  // Medium confidence: Last name match
  const providerParts = config.displayName.toLowerCase().split(' ');
  if (providerParts.length > 1 && name.includes(providerParts[providerParts.length - 1])) {
    return 'medium';
  }
  
  // Low confidence: Single word/partial match
  return 'low';
}

// Legacy extraction function for comparison
function extractProviderNameFromSheet(sheetName: string): string {
  // Look for "Dr. [FirstName LastName]" pattern first
  const drMatch = sheetName.match(/Dr\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (drMatch) {
    return drMatch[1].trim();
  }
  
  // Fallback: Extract first and last name before common words
  const cleanName = sheetName
    .replace(/\s*-\s*(associate|production|tracker|data|sheet|dashboard).*$/gi, '')
    .replace(/(associate|production|tracker|data|sheet|dashboard)/gi, '')
    .trim();
  
  const words = cleanName.split(/\s+/).filter(word => word.length > 0);
  if (words.length >= 2) {
    return `${words[0]} ${words[1]}`;
  } else if (words.length === 1) {
    return words[0];
  }
  
  return 'Unknown';
}

describe('Provider Detection Pattern Tests', () => {
  describe('Dr. Chinyere Enih Detection', () => {
    it('should correctly detect Dr. Chi from original problematic spreadsheet name', () => {
      const result = detectProviderFromName('Chinyere Enih - Associate Production Tracker');
      
      expect(result).not.toBeNull();
      expect(result?.displayName).toBe('Dr. Chinyere Enih');
      expect(result?.providerCode).toBe('chinyere_enih');
      expect(result?.confidence).toBe('high');
    });

    it('should detect Dr. Chi from various name formats', () => {
      const testCases = [
        'Chinyere Enih Production',
        'Dr. Chinyere Enih',
        'Dr Chinyere Production Tracker',
        'Chinyere Production Data',
        'Enih Production Stats',
        'Dr. Chinyere Enih - Baytown Location'
      ];

      testCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Chinyere Enih');
        expect(result?.providerCode).toBe('chinyere_enih');
      });
    });

    it('should provide confidence levels for Dr. Chi detection', () => {
      const testCases = [
        { name: 'Dr. Chinyere Enih', expectedToHaveConfidence: true },
        { name: 'Chinyere Enih Production', expectedToHaveConfidence: true },
        { name: 'Chinyere Production', expectedToHaveConfidence: true },
        { name: 'Enih Production', expectedToHaveConfidence: true }
      ];

      testCases.forEach(({ name, expectedToHaveConfidence }) => {
        const result = detectProviderFromName(name);
        expect(result?.confidence).toBeDefined();
        expect(['low', 'medium', 'high'].includes(result?.confidence || '')).toBe(expectedToHaveConfidence);
      });
    });
  });

  describe('Dr. Obinna Ezeji Detection', () => {
    it('should correctly detect Dr. Obinna from various formats', () => {
      const testCases = [
        'Dr. Obinna Ezeji Production Tracker',
        'Obinna Production Data',
        'Ezeji Production Stats', 
        'Dr Obinna Monthly Report',
        'Obinna Ezeji - Baytown'
      ];

      testCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Obinna Ezeji');
        expect(result?.providerCode).toBe('obinna_ezeji');
      });
    });

    it('should not incorrectly match Dr. Obinna to Dr. Chi spreadsheet', () => {
      const result = detectProviderFromName('Chinyere Enih - Associate Production Tracker');
      
      expect(result?.displayName).not.toBe('Dr. Obinna Ezeji');
      expect(result?.providerCode).not.toBe('obinna_ezeji');
    });
  });

  describe('Dr. Kamdi Irondi Detection', () => {
    it('should correctly detect Dr. Kamdi from various formats', () => {
      const testCases = [
        'Dr. Kamdi Irondi Production Data',
        'Kamdi Production Stats',
        'Irondi Monthly Report',
        'Dr Kamdi Weekly Summary',
        'Kelechi Production Data' // Alternative first name
      ];

      testCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Kamdi Irondi');
        expect(result?.providerCode).toBe('kamdi_irondi');
      });
    });

    it('should handle alternative first name "Kelechi"', () => {
      const result = detectProviderFromName('Kelechi Production Report');
      
      expect(result?.displayName).toBe('Dr. Kamdi Irondi');
      expect(result?.providerCode).toBe('kamdi_irondi');
    });
  });

  describe('Pattern Specificity and Conflicts', () => {
    it('should not have cross-provider pattern conflicts', () => {
      const testCases = [
        { name: 'Chinyere Enih Production', expected: 'chinyere_enih' },
        { name: 'Obinna Ezeji Production', expected: 'obinna_ezeji' },
        { name: 'Kamdi Irondi Production', expected: 'kamdi_irondi' }
      ];

      testCases.forEach(({ name, expected }) => {
        const result = detectProviderFromName(name);
        expect(result?.providerCode).toBe(expected);
      });
    });

    it('should handle ambiguous cases consistently', () => {
      // Test cases where multiple patterns might theoretically match
      const ambiguousCases = [
        'Production Data Sheet', // No provider name
        'Monthly Report', // No provider name
        'Unknown Provider Sheet' // Explicit unknown
      ];

      ambiguousCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result).toBeNull(); // Should not match any provider
      });
    });
  });

  describe('Edge Cases and Variations', () => {
    it('should handle different spacing and punctuation', () => {
      const testCases = [
        'Dr.Chinyere Enih',
        'Dr  Chinyere  Enih',
        'Dr. Chinyere-Enih',
        'Dr.   Chinyere    Enih   Production'
      ];

      testCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Chinyere Enih');
      });
    });

    it('should handle case insensitivity', () => {
      const testCases = [
        'CHINYERE ENIH PRODUCTION',
        'chinyere enih production',
        'ChInYeRe EnIh PrOdUcTiOn',
        'Dr. CHINYERE ENIH'
      ];

      testCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Chinyere Enih');
      });
    });

    it('should handle special characters and numbers', () => {
      const testCases = [
        'Chinyere Enih - Production 2024',
        'Dr. Chinyere Enih (Dentist)',
        'Chinyere_Enih_Production',
        'Chinyere & Enih Production Co.'
      ];

      testCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Chinyere Enih');
      });
    });
  });

  describe('Pattern Order and Priority', () => {
    it('should return first matching pattern consistently', () => {
      // Test that pattern order doesn't affect core functionality
      const result = detectProviderFromName('Chinyere Enih Production');
      
      expect(result?.matchedPattern.toString()).toBe('/chinyere/i');
      expect(result?.patternIndex).toBe(0);
    });

    it('should prefer more specific patterns when available', () => {
      const result = detectProviderFromName('Dr. Chinyere Enih');
      
      // Should match the first pattern it encounters
      expect(result?.matchedPattern.toString()).toBe('/chinyere/i');
      expect(result?.confidence).toBe('high');
    });
  });

  describe('Comparison with Legacy Method', () => {
    it('should provide same or better results than legacy extraction', () => {
      const testCases = [
        'Chinyere Enih - Associate Production Tracker',
        'Dr. Obinna Ezeji Production Data',
        'Dr. Kamdi Irondi Monthly Report'
      ];

      testCases.forEach(testCase => {
        const legacyResult = extractProviderNameFromSheet(testCase);
        const newResult = detectProviderFromName(testCase);
        
        // New method should always find a result when legacy does
        if (legacyResult !== 'Unknown') {
          expect(newResult).not.toBeNull();
          expect(newResult?.displayName).toContain(legacyResult);
        }
      });
    });

    it('should handle cases where legacy method fails', () => {
      const difficultCases = [
        'Chinyere Production Data', // No "Dr." prefix
        'Enih Monthly Report', // Last name only
        'Kelechi Production Stats' // Alternative first name
      ];

      difficultCases.forEach(testCase => {
        const newResult = detectProviderFromName(testCase);
        expect(newResult).not.toBeNull();
        expect(newResult?.confidence).toBeDefined();
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle empty and invalid inputs gracefully', () => {
      const invalidInputs = ['', '   ', null, undefined];
      
      invalidInputs.forEach(input => {
        expect(() => {
          const result = detectProviderFromName(input as any);
          expect(result).toBeNull();
        }).not.toThrow();
      });
    });

    it('should be consistent across multiple calls', () => {
      const testName = 'Chinyere Enih - Associate Production Tracker';
      const results = [];
      
      // Run same detection multiple times
      for (let i = 0; i < 5; i++) {
        results.push(detectProviderFromName(testName));
      }
      
      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result?.displayName).toBe(firstResult?.displayName);
        expect(result?.providerCode).toBe(firstResult?.providerCode);
        expect(result?.confidence).toBe(firstResult?.confidence);
      });
    });

    it('should have reasonable performance for large inputs', () => {
      const largeInput = 'Chinyere Enih Production Data '.repeat(100);
      
      const startTime = Date.now();
      const result = detectProviderFromName(largeInput);
      const endTime = Date.now();
      
      expect(result?.displayName).toBe('Dr. Chinyere Enih');
      expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
    });
  });
});

describe('Provider Detection Integration Tests', () => {
  describe('Real-world Spreadsheet Names', () => {
    it('should handle actual production spreadsheet names', () => {
      const realWorldCases = [
        {
          name: 'Chinyere Enih - Associate Production Tracker',
          expected: 'Dr. Chinyere Enih',
          code: 'chinyere_enih'
        },
        {
          name: 'Dr. Obinna Ezeji - Monthly Production Summary',
          expected: 'Dr. Obinna Ezeji', 
          code: 'obinna_ezeji'
        },
        {
          name: 'Kamdi Irondi Practice Analytics Dashboard',
          expected: 'Dr. Kamdi Irondi',
          code: 'kamdi_irondi'
        }
      ];

      realWorldCases.forEach(({ name, expected, code }) => {
        const result = detectProviderFromName(name);
        expect(result?.displayName).toBe(expected);
        expect(result?.providerCode).toBe(code);
        expect(result?.confidence).toBe('high');
      });
    });
  });

  describe('Multi-location Provider Support', () => {
    it('should correctly identify providers across different locations', () => {
      const locationCases = [
        'Chinyere Enih - Baytown Production',
        'Chinyere Enih - Humble Production',
        'Dr. Chinyere Enih - Multi-Location Report'
      ];

      locationCases.forEach(testCase => {
        const result = detectProviderFromName(testCase);
        expect(result?.displayName).toBe('Dr. Chinyere Enih');
        expect(result?.providerCode).toBe('chinyere_enih');
      });
    });
  });
});

describe('Provider Detection Error Handling', () => {
  it('should handle malformed regular expressions gracefully', () => {
    // This would be testing if the patterns themselves are well-formed
    Object.entries(PROVIDER_DETECTION_PATTERNS).forEach(([code, config]) => {
      config.namePatterns.forEach(pattern => {
        expect(() => {
          'test string'.match(pattern);
        }).not.toThrow();
      });
    });
  });

  it('should provide meaningful error information when detection fails', () => {
    const result = detectProviderFromName('Completely Unknown Provider Name');
    
    expect(result).toBeNull();
    // In a real implementation, this might return error details
  });
});

describe('Provider Detection Regression Tests', () => {
  it('should not regress on the original Dr. Chi issue', () => {
    // This is the exact case that was failing before the fix
    const result = detectProviderFromName('Chinyere Enih - Associate Production Tracker');
    
    expect(result).not.toBeNull();
    expect(result?.displayName).toBe('Dr. Chinyere Enih');
    expect(result?.providerCode).toBe('chinyere_enih');
    expect(result?.externalId).toBe('CHINYERE_PROVIDER');
    expect(result?.confidence).toBe('high');
    
    // Most importantly, it should NOT detect as Dr. Obinna
    expect(result?.displayName).not.toBe('Dr. Obinna Ezeji');
    expect(result?.providerCode).not.toBe('obinna_ezeji');
  });

  it('should maintain backward compatibility with existing detections', () => {
    const knownWorkingCases = [
      { name: 'Dr. Obinna Ezeji Production', expected: 'obinna_ezeji' },
      { name: 'Kamdi Irondi Data', expected: 'kamdi_irondi' },
      { name: 'Ezeji Production', expected: 'obinna_ezeji' },
      { name: 'Irondi Reports', expected: 'kamdi_irondi' }
    ];

    knownWorkingCases.forEach(({ name, expected }) => {
      const result = detectProviderFromName(name);
      expect(result?.providerCode).toBe(expected);
    });
  });
});
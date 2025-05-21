---
id: 14
title: "Document types directory"
status: pending
priority: medium
feature: Documentation
created_at: 2025-05-21T21:15:10Z
---

## Description

Add proper JSDoc3 documentation to all TypeScript type definitions in the types directory. These files define the type system used throughout the application including interfaces, type aliases, and enums.

## Files to Document

- All TypeScript files in the `/src/types` directory

## Documentation Requirements

Each file should follow the JSDoc3 standard as specified in the commenting guidelines:

1. For interfaces and type aliases:
   - Brief description explaining the type's purpose and usage
   - Document each property with its meaning, valid values, and constraints
   - Document relationships with other types
   - Document any validation rules or invariants

2. For enums:
   - Document the purpose of the enum
   - Document each enum value with its meaning and usage context
   - Document any numeric values assigned to enum members if applicable

3. For utility types:
   - Document transformation logic and input/output relationships
   - Document generic parameters and constraints

## Example

```typescript
/**
 * Represents a dental clinic in the system
 * 
 * Contains all information about a clinic including contact details,
 * operating hours, and administrative metadata.
 *
 * @typedef {Object} Clinic
 * @property {string} id - Unique identifier for the clinic
 * @property {string} name - Display name of the clinic
 * @property {string} address - Physical address of the clinic
 * @property {string} [phone] - Contact phone number with format XXX-XXX-XXXX
 * @property {string} [email] - Contact email address
 * @property {ClinicHours} hours - Operating hours for each day of the week
 * @property {ClinicStatus} status - Current operational status of the clinic
 * @property {Date} createdAt - When the clinic was added to the system
 * @property {Date} [updatedAt] - When the clinic information was last updated
 * @property {string[]} providerIds - IDs of providers associated with this clinic
 */
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  hours: ClinicHours;
  status: ClinicStatus;
  createdAt: Date;
  updatedAt?: Date;
  providerIds: string[];
}

/**
 * Status of a clinic's operations
 * 
 * Represents the current operational status of a dental clinic.
 * Used for filtering and display purposes.
 *
 * @enum {string}
 */
export enum ClinicStatus {
  /** Clinic is open and accepting new patients */
  ACTIVE = 'active',
  
  /** Clinic is open but not accepting new patients */
  LIMITED = 'limited',
  
  /** Clinic is temporarily closed */
  INACTIVE = 'inactive',
  
  /** Clinic has been permanently closed */
  CLOSED = 'closed'
}
```

## Dependencies

None

## Related Tasks

None

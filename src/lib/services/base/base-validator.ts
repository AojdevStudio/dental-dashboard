/**
 * Base validator class providing common validation functionality
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export abstract class BaseValidator<T> {
  protected errors: ValidationError[] = [];
  protected warnings: string[] = [];

  abstract validate(data: T): ValidationResult;

  /**
   * Add a validation error
   */
  protected addError(field: string, message: string, code?: string): void {
    this.errors.push({ field, message, code });
  }

  /**
   * Add a validation warning
   */
  protected addWarning(message: string): void {
    this.warnings.push(message);
  }

  /**
   * Clear accumulated errors and warnings
   */
  protected reset(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Create validation result
   */
  protected createResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings],
    };
  }

  /**
   * Chain validation methods
   */
  protected and(validationFn: () => void): this {
    if (this.errors.length === 0) {
      try {
        validationFn();
      } catch (error) {
        this.addError('general', error instanceof Error ? error.message : 'Validation failed');
      }
    }
    return this;
  }

  /**
   * Validate required field
   */
  protected validateRequired(field: string, value: any, customMessage?: string): void {
    if (value === undefined || value === null || value === '') {
      this.addError(field, customMessage || `${field} is required`);
    }
  }

  /**
   * Validate email format
   */
  protected validateEmail(field: string, email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      this.addError(field, 'Invalid email format');
    }
  }

  /**
   * Validate numeric field
   */
  protected validateNumeric(field: string, value: any, min?: number, max?: number): void {
    const num = Number(value);
    if (Number.isNaN(num)) {
      this.addError(field, `${field} must be a valid number`);
      return;
    }

    if (min !== undefined && num < min) {
      this.addError(field, `${field} must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      this.addError(field, `${field} must be at most ${max}`);
    }
  }

  /**
   * Validate date field
   */
  protected validateDate(field: string, dateValue: any): void {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      this.addError(field, `${field} must be a valid date`);
    }
  }
}

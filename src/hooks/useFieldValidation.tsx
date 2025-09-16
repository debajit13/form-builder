import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import type { FieldSchema, ValidationError } from '../types/schema';
import { SchemaValidator } from '../utils/validation';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  hasBeenTouched: boolean;
  isValidating: boolean;
}

interface UseFieldValidationProps {
  field: FieldSchema;
  value: any;
  formData?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFieldValidation({
  field,
  value,
  formData = {},
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300
}: UseFieldValidationProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    hasBeenTouched: false,
    isValidating: false
  });

  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  const validateField = useCallback(async (currentValue: any, immediate = false) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const performValidation = () => {
      setValidationState(prev => ({ ...prev, isValidating: true }));

      try {
        const validator = SchemaValidator.createFieldValidator(field);

        // Handle different field types and convert values appropriately
        let processedValue = currentValue;

        if (field.type === 'number' && typeof currentValue === 'string') {
          const numValue = parseFloat(currentValue);
          processedValue = isNaN(numValue) ? currentValue : numValue;
        } else if (field.type === 'date' && typeof currentValue === 'string') {
          processedValue = currentValue ? new Date(currentValue) : currentValue;
        }

        // Check if field should be validated based on conditional logic
        if (field.conditional) {
          const shouldShow = evaluateConditional(field.conditional, formData);
          if (!shouldShow) {
            setValidationState({
              isValid: true,
              errors: [],
              hasBeenTouched: false,
              isValidating: false
            });
            return;
          }
        }

        // Perform validation
        validator.parse(processedValue);

        setValidationState(prev => ({
          ...prev,
          isValid: true,
          errors: [],
          isValidating: false
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(issue =>
            issue.message || getDefaultErrorMessage(field, issue.code)
          );

          setValidationState(prev => ({
            ...prev,
            isValid: false,
            errors,
            isValidating: false
          }));
        } else {
          setValidationState(prev => ({
            ...prev,
            isValid: false,
            errors: ['Validation error occurred'],
            isValidating: false
          }));
        }
      }
    };

    if (immediate || debounceMs === 0) {
      performValidation();
    } else {
      const timer = setTimeout(performValidation, debounceMs);
      setDebounceTimer(timer as unknown as number);
    }
  }, [field, formData, debounceMs, debounceTimer]);

  // Validate when value changes (if enabled)
  useEffect(() => {
    if (validateOnChange && validationState.hasBeenTouched) {
      validateField(value);
    }
  }, [value, validateOnChange, validationState.hasBeenTouched, validateField]);

  // Mark field as touched
  const markAsTouched = useCallback(() => {
    setValidationState(prev => ({ ...prev, hasBeenTouched: true }));
    if (validateOnBlur) {
      validateField(value, true);
    }
  }, [validateOnBlur, validateField, value]);

  // Force validation
  const validate = useCallback(() => {
    setValidationState(prev => ({ ...prev, hasBeenTouched: true }));
    return validateField(value, true);
  }, [validateField, value]);

  // Reset validation state
  const reset = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      hasBeenTouched: false,
      isValidating: false
    });
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }, [debounceTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    ...validationState,
    markAsTouched,
    validate,
    reset,
    shouldShowError: validationState.hasBeenTouched && !validationState.isValid && !validationState.isValidating
  };
}

// Helper function to evaluate conditional logic
function evaluateConditional(conditional: any, formData: Record<string, any>): boolean {
  const fieldValue = formData[conditional.field];

  let result = false;
  switch (conditional.operator) {
    case 'equals':
      result = fieldValue === conditional.value;
      break;
    case 'not_equals':
      result = fieldValue !== conditional.value;
      break;
    case 'greater_than':
      result = Number(fieldValue) > Number(conditional.value);
      break;
    case 'less_than':
      result = Number(fieldValue) < Number(conditional.value);
      break;
    case 'contains':
      result = String(fieldValue).includes(String(conditional.value));
      break;
    case 'not_contains':
      result = !String(fieldValue).includes(String(conditional.value));
      break;
    default:
      result = true;
  }

  // Handle nested conditions
  if (conditional.rules && conditional.rules.length > 0) {
    const nestedResults = conditional.rules.map((rule: any) =>
      evaluateConditional(rule, formData)
    );

    if (conditional.logic === 'or') {
      result = result || nestedResults.some((r) => r);
    } else {
      result = result && nestedResults.every((r) => r);
    }
  }

  return result;
}

// Helper function to get default error messages
function getDefaultErrorMessage(field: FieldSchema, errorCode: string): string {
  const fieldLabel = field.label || field.name;

  switch (errorCode) {
    case 'too_small':
      if (field.type === 'text' || field.type === 'textarea') {
        return `${fieldLabel} must be at least ${(field.validation as any)?.minLength} characters`;
      } else if (field.type === 'number') {
        return `${fieldLabel} must be at least ${(field.validation as any)?.min}`;
      }
      return `${fieldLabel} is too small`;

    case 'too_big':
      if (field.type === 'text' || field.type === 'textarea') {
        return `${fieldLabel} must be at most ${(field.validation as any)?.maxLength} characters`;
      } else if (field.type === 'number') {
        return `${fieldLabel} must be at most ${(field.validation as any)?.max}`;
      }
      return `${fieldLabel} is too large`;

    case 'invalid_string':
      if (field.type === 'email') {
        return `Please enter a valid email address`;
      }
      return `${fieldLabel} format is invalid`;

    case z.ZodIssueCode.invalid_type:
      if (field.validation?.required) {
        return `${fieldLabel} is required`;
      }
      return `${fieldLabel} has invalid type`;

    case z.ZodIssueCode.custom:
      return field.validation?.message || `${fieldLabel} is invalid`;

    default:
      return field.validation?.message || `${fieldLabel} is invalid`;
  }
}
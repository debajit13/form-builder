import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { FieldSchema, ValidationError, FormSubmissionData } from '../types/schema';
import { SchemaValidator } from '../utils/validation';

interface UseRealTimeValidationOptions {
  field: FieldSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

interface ValidationState {
  isValidating: boolean;
  error: ValidationError | null;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

export function useRealTimeValidation({
  field,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
}: UseRealTimeValidationOptions) {
  const { watch, getValues, formState: { errors, touchedFields, dirtyFields } } = useFormContext();

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    error: null,
    isValid: true,
    isDirty: false,
    isTouched: false,
  });

  const fieldValue = watch(field.name);
  const fieldError = errors[field.name];
  const isTouched = touchedFields[field.name];
  const isDirty = dirtyFields[field.name];

  const validateField = useCallback(async (value: any) => {
    if (!validateOnChange && !isTouched) return;

    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const allValues = getValues();
      const error = await SchemaValidator.validateFieldAsync(field, value, allValues);

      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        error,
        isValid: !error,
      }));
    } catch (err) {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        error: {
          field: field.name,
          message: 'Validation failed',
          type: 'custom',
        },
        isValid: false,
      }));
    }
  }, [field, validateOnChange, isTouched, getValues]);

  useEffect(() => {
    setValidationState(prev => ({
      ...prev,
      isDirty: !!isDirty,
      isTouched: !!isTouched,
    }));
  }, [isDirty, isTouched]);

  useEffect(() => {
    if (!validateOnChange) return;

    const timeoutId = setTimeout(() => {
      validateField(fieldValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [fieldValue, validateField, debounceMs, validateOnChange]);

  const handleBlur = useCallback(() => {
    if (validateOnBlur) {
      validateField(fieldValue);
    }
  }, [validateOnBlur, validateField, fieldValue]);

  const getFieldStatus = useCallback(() => {
    if (validationState.isValidating) return 'validating';
    if (fieldError || validationState.error) return 'error';
    if (validationState.isTouched && validationState.isValid) return 'valid';
    return 'idle';
  }, [validationState, fieldError]);

  const getErrorMessage = useCallback(() => {
    if (fieldError?.message) return fieldError.message.toString();
    if (validationState.error) return validationState.error.message;
    return null;
  }, [fieldError, validationState.error]);

  return {
    validationState: {
      ...validationState,
      status: getFieldStatus(),
      errorMessage: getErrorMessage(),
    },
    handlers: {
      onBlur: handleBlur,
    },
    validateField: () => validateField(fieldValue),
  };
}

export function useFormValidation(fields: FieldSchema[]) {
  const { getValues, trigger } = useFormContext();
  const [formValidationState, setFormValidationState] = useState({
    isValidating: false,
    errors: [] as ValidationError[],
    isValid: true,
  });

  const validateForm = useCallback(async (): Promise<ValidationError[]> => {
    setFormValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const values = getValues();
      const errors: ValidationError[] = [];

      for (const field of fields) {
        const error = await SchemaValidator.validateFieldAsync(field, values[field.name], values);
        if (error) {
          errors.push(error);
        }
      }

      setFormValidationState({
        isValidating: false,
        errors,
        isValid: errors.length === 0,
      });

      return errors;
    } catch (err) {
      setFormValidationState({
        isValidating: false,
        errors: [{ field: 'form', message: 'Form validation failed', type: 'custom' }],
        isValid: false,
      });
      return [{ field: 'form', message: 'Form validation failed', type: 'custom' }];
    }
  }, [fields, getValues]);

  const validateSection = useCallback(async (sectionFields: FieldSchema[]): Promise<boolean> => {
    const fieldNames = sectionFields.map(f => f.name);
    const isValid = await trigger(fieldNames);
    return isValid;
  }, [trigger]);

  return {
    formValidationState,
    validateForm,
    validateSection,
  };
}
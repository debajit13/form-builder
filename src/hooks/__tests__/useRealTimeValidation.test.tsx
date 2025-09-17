import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { useRealTimeValidation, useFormValidation } from '../useRealTimeValidation'
import type { FieldSchema, ValidationError } from '../../types/schema'

// Mock SchemaValidator
vi.mock('../../utils/validation', () => ({
  SchemaValidator: {
    validateFieldAsync: vi.fn(),
  },
}))

// Test wrapper for hooks that need FormProvider
function createWrapper() {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      mode: 'onChange',
      defaultValues: {
        testField: '',
        requiredField: '',
      },
    })
    return <FormProvider {...methods}>{children}</FormProvider>
  }
  return Wrapper
}

describe('useRealTimeValidation', () => {
  const mockField: FieldSchema = {
    id: 'test-field',
    name: 'testField',
    type: 'text',
    label: 'Test Field',
    validation: {
      required: true,
      minLength: 3,
    },
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.validationState).toEqual({
        isValidating: false,
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false,
        status: 'idle',
        errorMessage: null,
      })
    })

    it('should provide handlers object', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.handlers).toHaveProperty('onBlur')
      expect(typeof result.current.handlers.onBlur).toBe('function')
    })

    it('should provide validateField function', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
          }),
        { wrapper: createWrapper() }
      )

      expect(typeof result.current.validateField).toBe('function')
    })
  })

  describe('Validation Options', () => {
    it('should respect validateOnChange option', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            validateOnChange: false,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.validationState.status).toBe('idle')
    })

    it('should respect validateOnBlur option', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            validateOnBlur: false,
          }),
        { wrapper: createWrapper() }
      )

      // onBlur handler should still exist but not perform validation
      expect(result.current.handlers.onBlur).toBeDefined()
    })

    it('should use custom debounce time', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            debounceMs: 500,
          }),
        { wrapper: createWrapper() }
      )

      expect(result.current.validationState).toBeDefined()
    })
  })

  describe('Validation States', () => {
    it('should show validating state during validation', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      )

      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            debounceMs: 0, // No debounce for immediate validation
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.validateField()
      })

      expect(result.current.validationState.isValidating).toBe(true)
      expect(result.current.validationState.status).toBe('validating')
    })

    it('should show valid state after successful validation', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockResolvedValue(null)

      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            debounceMs: 0,
          }),
        { wrapper: createWrapper() }
      )

      await act(async () => {
        result.current.validateField()
      })

      await waitFor(() => {
        expect(result.current.validationState.isValidating).toBe(false)
        expect(result.current.validationState.isValid).toBe(true)
        expect(result.current.validationState.error).toBeNull()
      })
    })

    it('should show error state after failed validation', async () => {
      const mockError: ValidationError = {
        field: 'testField',
        message: 'Field is required',
        type: 'required',
      }

      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockResolvedValue(mockError)

      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            debounceMs: 0,
          }),
        { wrapper: createWrapper() }
      )

      await act(async () => {
        result.current.validateField()
      })

      await waitFor(() => {
        expect(result.current.validationState.isValidating).toBe(false)
        expect(result.current.validationState.isValid).toBe(false)
        expect(result.current.validationState.error).toEqual(mockError)
        expect(result.current.validationState.status).toBe('error')
        expect(result.current.validationState.errorMessage).toBe('Field is required')
      })
    })

    it('should handle validation errors gracefully', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockRejectedValue(new Error('Validation failed'))

      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            debounceMs: 0,
          }),
        { wrapper: createWrapper() }
      )

      await act(async () => {
        result.current.validateField()
      })

      await waitFor(() => {
        expect(result.current.validationState.isValidating).toBe(false)
        expect(result.current.validationState.isValid).toBe(false)
        expect(result.current.validationState.error).toEqual({
          field: 'testField',
          message: 'Validation failed',
          type: 'custom',
        })
      })
    })
  })

  describe('Event Handlers', () => {
    it('should validate field on blur when validateOnBlur is true and field is touched', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      const validateSpy = vi.fn().mockResolvedValue(null)
      SchemaValidator.validateFieldAsync = validateSpy

      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            validateOnBlur: true,
            validateOnChange: true, // Enable onChange so field can be validated
          }),
        { wrapper: createWrapper() }
      )

      await act(async () => {
        result.current.handlers.onBlur()
      })

      expect(validateSpy).toHaveBeenCalled()
    })

    it('should not validate field on blur when validateOnBlur is false', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      const validateSpy = vi.fn().mockResolvedValue(null)
      SchemaValidator.validateFieldAsync = validateSpy

      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            validateOnBlur: false,
            validateOnChange: false,
          }),
        { wrapper: createWrapper() }
      )

      await act(async () => {
        result.current.handlers.onBlur()
      })

      expect(validateSpy).not.toHaveBeenCalled()
    })
  })

  describe('Debouncing', () => {
    it('should support debounce configuration', () => {
      const { result } = renderHook(
        () =>
          useRealTimeValidation({
            field: mockField,
            debounceMs: 100,
          }),
        { wrapper: createWrapper() }
      )

      // Should initialize with debounce configuration
      expect(result.current.validateField).toBeDefined()
      expect(result.current.validationState).toEqual({
        isValidating: false,
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false,
        status: 'idle',
        errorMessage: null,
      })
    })
  })
})

describe('useFormValidation', () => {
  const mockFields: FieldSchema[] = [
    {
      id: 'field-1',
      name: 'field1',
      type: 'text',
      label: 'Field 1',
      validation: { required: true },
    },
    {
      id: 'field-2',
      name: 'field2',
      type: 'email',
      label: 'Field 2',
      validation: { required: true },
    },
  ] as any[]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      expect(result.current.formValidationState).toEqual({
        isValidating: false,
        errors: [],
        isValid: true,
      })
    })

    it('should provide validation functions', () => {
      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      expect(typeof result.current.validateForm).toBe('function')
      expect(typeof result.current.validateSection).toBe('function')
    })
  })

  describe('Form Validation', () => {
    it('should validate all fields and return errors', async () => {
      const mockErrors: ValidationError[] = [
        { field: 'field1', message: 'Field 1 is required', type: 'required' },
        { field: 'field2', message: 'Invalid email', type: 'format' },
      ]

      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi
        .fn()
        .mockResolvedValueOnce(mockErrors[0])
        .mockResolvedValueOnce(mockErrors[1])

      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      let errors: ValidationError[] = []
      await act(async () => {
        errors = await result.current.validateForm()
      })

      expect(errors).toEqual(mockErrors)
      expect(result.current.formValidationState.errors).toEqual(mockErrors)
      expect(result.current.formValidationState.isValid).toBe(false)
      expect(result.current.formValidationState.isValidating).toBe(false)
    })

    it('should handle form validation with no errors', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockResolvedValue(null)

      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      let errors: ValidationError[] = []
      await act(async () => {
        errors = await result.current.validateForm()
      })

      expect(errors).toEqual([])
      expect(result.current.formValidationState.errors).toEqual([])
      expect(result.current.formValidationState.isValid).toBe(true)
    })

    it('should handle form validation errors gracefully', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockRejectedValue(new Error('Validation failed'))

      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      let errors: ValidationError[] = []
      await act(async () => {
        errors = await result.current.validateForm()
      })

      expect(errors).toEqual([{ field: 'form', message: 'Form validation failed', type: 'custom' }])
      expect(result.current.formValidationState.isValid).toBe(false)
    })

    it('should show validating state during form validation', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFieldAsync = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      )

      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      act(() => {
        result.current.validateForm()
      })

      expect(result.current.formValidationState.isValidating).toBe(true)
    })
  })

  describe('Section Validation', () => {
    it('should validate section fields', async () => {
      const { result } = renderHook(
        () => useFormValidation(mockFields),
        { wrapper: createWrapper() }
      )

      let isValid: boolean = false
      await act(async () => {
        isValid = await result.current.validateSection([mockFields[0]])
      })

      // The trigger function from react-hook-form should be called
      expect(typeof isValid).toBe('boolean')
    })
  })
})
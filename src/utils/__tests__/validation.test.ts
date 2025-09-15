import { describe, it, expect } from 'vitest'
import { SchemaValidator } from '../validation'
import type { FormSchema, FieldSchema, TextFieldSchema, NumberFieldSchema, DateFieldSchema } from '../../types/schema'

describe('SchemaValidator', () => {
  describe('validateField', () => {
    it('should validate a required text field', () => {
      const field: TextFieldSchema = {
        id: 'test-field',
        name: 'testField',
        type: 'text',
        label: 'Test Field',
        validation: { required: true }
      }

      const result = SchemaValidator.validateField(field, '')
      expect(result).toEqual({
        field: 'testField',
        message: 'Required',
        type: 'required'
      })

      const validResult = SchemaValidator.validateField(field, 'test value')
      expect(validResult).toBeNull()
    })

    it('should validate text field with min/max length', () => {
      const field: TextFieldSchema = {
        id: 'test-field',
        name: 'testField',
        type: 'text',
        label: 'Test Field',
        validation: {
          required: true,
          minLength: 3,
          maxLength: 10
        }
      }

      const shortResult = SchemaValidator.validateField(field, 'ab')
      expect(shortResult?.type).toBe('min')

      const longResult = SchemaValidator.validateField(field, 'this is too long')
      expect(longResult?.type).toBe('max')

      const validResult = SchemaValidator.validateField(field, 'valid')
      expect(validResult).toBeNull()
    })

    it('should validate email field', () => {
      const field: TextFieldSchema = {
        id: 'email-field',
        name: 'email',
        type: 'email',
        label: 'Email',
        validation: { required: true }
      }

      const invalidResult = SchemaValidator.validateField(field, 'invalid-email')
      expect(invalidResult?.type).toBe('format')

      const validResult = SchemaValidator.validateField(field, 'test@example.com')
      expect(validResult).toBeNull()
    })

    it('should validate number field', () => {
      const field: NumberFieldSchema = {
        id: 'number-field',
        name: 'age',
        type: 'number',
        label: 'Age',
        validation: {
          required: true,
          min: 18,
          max: 100
        }
      }

      const lowResult = SchemaValidator.validateField(field, 15)
      expect(lowResult?.type).toBe('min')

      const highResult = SchemaValidator.validateField(field, 105)
      expect(highResult?.type).toBe('max')

      const validResult = SchemaValidator.validateField(field, 25)
      expect(validResult).toBeNull()
    })

    it('should validate date field', () => {
      const field: DateFieldSchema = {
        id: 'date-field',
        name: 'birthdate',
        type: 'date',
        label: 'Birth Date',
        validation: {
          required: true,
          minDate: '1920-01-01',
          maxDate: '2005-12-31'
        }
      }

      const earlyResult = SchemaValidator.validateField(field, new Date('1919-12-31'))
      expect(earlyResult?.type).toBe('min')

      const lateResult = SchemaValidator.validateField(field, new Date('2006-01-01'))
      expect(lateResult?.type).toBe('max')

      const validResult = SchemaValidator.validateField(field, new Date('1990-06-15'))
      expect(validResult).toBeNull()
    })

    it('should skip validation for hidden fields', () => {
      const field: TextFieldSchema = {
        id: 'hidden-field',
        name: 'hiddenField',
        type: 'text',
        label: 'Hidden Field',
        hidden: true,
        validation: { required: true }
      }

      const result = SchemaValidator.validateField(field, '')
      expect(result).toBeNull()
    })

    it('should skip validation for disabled fields', () => {
      const field: TextFieldSchema = {
        id: 'disabled-field',
        name: 'disabledField',
        type: 'text',
        label: 'Disabled Field',
        disabled: true,
        validation: { required: true }
      }

      const result = SchemaValidator.validateField(field, '')
      expect(result).toBeNull()
    })

    it('should handle conditional field validation', () => {
      const field: TextFieldSchema = {
        id: 'conditional-field',
        name: 'conditionalField',
        type: 'text',
        label: 'Conditional Field',
        validation: { required: true },
        conditional: {
          field: 'triggerField',
          operator: 'equals',
          value: 'show'
        }
      }

      // Field should not be validated when condition is not met
      const hiddenResult = SchemaValidator.validateField(field, '', { triggerField: 'hide' })
      expect(hiddenResult).toBeNull()

      // Field should be validated when condition is met
      const visibleResult = SchemaValidator.validateField(field, '', { triggerField: 'show' })
      expect(visibleResult?.type).toBe('required')
    })
  })

  describe('validateFieldAsync', () => {
    it('should return a promise that resolves with validation result', async () => {
      const field: TextFieldSchema = {
        id: 'async-field',
        name: 'asyncField',
        type: 'text',
        label: 'Async Field',
        validation: { required: true }
      }

      const result = await SchemaValidator.validateFieldAsync(field, '')
      expect(result).toEqual({
        field: 'asyncField',
        message: 'Required',
        type: 'required'
      })

      const validResult = await SchemaValidator.validateFieldAsync(field, 'valid')
      expect(validResult).toBeNull()
    })
  })

  describe('getValidationRules', () => {
    it('should return validation rules for text fields', () => {
      const field: TextFieldSchema = {
        id: 'text-field',
        name: 'textField',
        type: 'text',
        label: 'Text Field',
        validation: {
          required: true,
          minLength: 3,
          maxLength: 50
        }
      }

      const rules = SchemaValidator.getValidationRules(field)
      expect(rules).toEqual([
        'Required field',
        'Minimum 3 characters',
        'Maximum 50 characters'
      ])
    })

    it('should return validation rules for email fields', () => {
      const field: TextFieldSchema = {
        id: 'email-field',
        name: 'email',
        type: 'email',
        label: 'Email',
        validation: { required: true }
      }

      const rules = SchemaValidator.getValidationRules(field)
      expect(rules).toContain('Required field')
      expect(rules).toContain('Must be a valid email address')
    })

    it('should return validation rules for number fields', () => {
      const field: NumberFieldSchema = {
        id: 'number-field',
        name: 'number',
        type: 'number',
        label: 'Number',
        validation: {
          required: true,
          min: 1,
          max: 100,
          integer: true
        }
      }

      const rules = SchemaValidator.getValidationRules(field)
      expect(rules).toEqual([
        'Required field',
        'Minimum value: 1',
        'Maximum value: 100',
        'Must be a whole number'
      ])
    })
  })

  describe('getFieldDisplayValue', () => {
    it('should format text values', () => {
      const field: TextFieldSchema = {
        id: 'text-field',
        name: 'text',
        type: 'text',
        label: 'Text'
      }

      expect(SchemaValidator.getFieldDisplayValue(field, 'hello')).toBe('hello')
      expect(SchemaValidator.getFieldDisplayValue(field, '')).toBe('')
      expect(SchemaValidator.getFieldDisplayValue(field, null)).toBe('')
    })

    it('should format date values', () => {
      const field: DateFieldSchema = {
        id: 'date-field',
        name: 'date',
        type: 'date',
        label: 'Date'
      }

      const date = new Date('2023-06-15')
      const result = SchemaValidator.getFieldDisplayValue(field, date)
      expect(result).toBe(date.toLocaleDateString())
    })

    it('should format number values with prefix/suffix', () => {
      const field = {
        id: 'price-field',
        name: 'price',
        type: 'number',
        label: 'Price',
        prefix: '$',
        suffix: ' USD'
      } as any

      expect(SchemaValidator.getFieldDisplayValue(field, 100)).toBe('$100 USD')
    })

    it('should format boolean values', () => {
      const field = {
        id: 'checkbox-field',
        name: 'agree',
        type: 'checkbox',
        label: 'Agree'
      } as any

      expect(SchemaValidator.getFieldDisplayValue(field, true)).toBe('Yes')
      expect(SchemaValidator.getFieldDisplayValue(field, false)).toBe('No')
    })
  })

  describe('createFormValidator', () => {
    it('should create a form validator for a schema', () => {
      const schema: FormSchema = {
        id: 'test-form',
        title: 'Test Form',
        version: '1.0.0',
        sections: [
          {
            id: 'section-1',
            title: 'Personal Info',
            fields: [
              {
                id: 'name-field',
                name: 'name',
                type: 'text',
                label: 'Name',
                validation: { required: true }
              } as TextFieldSchema,
              {
                id: 'age-field',
                name: 'age',
                type: 'number',
                label: 'Age',
                validation: { required: true, min: 18 }
              } as NumberFieldSchema
            ]
          }
        ],
        settings: {
          theme: { primaryColor: '#3b82f6' }
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'test-user'
        }
      }

      const validator = SchemaValidator.createFormValidator(schema)
      expect(validator).toBeDefined()

      // Test validation
      const validData = { name: 'John Doe', age: 25 }
      const validResult = validator.safeParse(validData)
      expect(validResult.success).toBe(true)

      const invalidData = { name: '', age: 15 }
      const invalidResult = validator.safeParse(invalidData)
      expect(invalidResult.success).toBe(false)
    })
  })
})
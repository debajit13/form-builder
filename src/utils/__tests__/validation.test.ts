import { describe, it, expect } from 'vitest'
import { SchemaValidator } from '../validation'
import type { FieldSchema, TextFieldSchema, NumberFieldSchema, FormSchema } from '../../types/schema'

describe('SchemaValidator', () => {
  describe('Text Field Validation', () => {
    const textField: TextFieldSchema = {
      id: 'text-field',
      name: 'username',
      type: 'text',
      label: 'Username',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$'
      }
    }

    it('should validate required text field', () => {
      const validator = SchemaValidator.createFieldValidator(textField)

      expect(() => validator.parse('')).toThrow()
      expect(() => validator.parse(null)).toThrow()
      expect(() => validator.parse(undefined)).toThrow()
      expect(validator.parse('validuser')).toBe('validuser')
    })

    it('should validate text field length constraints', () => {
      const validator = SchemaValidator.createFieldValidator(textField)

      expect(() => validator.parse('ab')).toThrow() // too short
      expect(() => validator.parse('a'.repeat(25))).toThrow() // too long
      expect(validator.parse('validuser')).toBe('validuser')
    })

    it('should validate text field pattern', () => {
      const validator = SchemaValidator.createFieldValidator(textField)

      expect(() => validator.parse('invalid-user!')).toThrow() // contains invalid characters
      expect(validator.parse('valid_user123')).toBe('valid_user123')
    })

    it('should handle optional text field', () => {
      const optionalField: TextFieldSchema = {
        ...textField,
        validation: { required: false }
      }
      const validator = SchemaValidator.createFieldValidator(optionalField)

      expect(validator.parse('')).toBe('')
      expect(validator.parse('value')).toBe('value')
    })
  })

  describe('Number Field Validation', () => {
    const numberField: NumberFieldSchema = {
      id: 'age-field',
      name: 'age',
      type: 'number',
      label: 'Age',
      validation: {
        required: true,
        min: 18,
        max: 65
      }
    }

    it('should validate required number field', () => {
      const validator = SchemaValidator.createFieldValidator(numberField)

      expect(() => validator.parse('')).toThrow()
      expect(() => validator.parse(null)).toThrow()
      expect(validator.parse(25)).toBe(25)
      expect(() => validator.parse('30')).toThrow() // strings are not automatically coerced
    })

    it('should validate number range constraints', () => {
      const validator = SchemaValidator.createFieldValidator(numberField)

      expect(() => validator.parse(17)).toThrow() // below min
      expect(() => validator.parse(70)).toThrow() // above max
      expect(validator.parse(25)).toBe(25)
      expect(validator.parse(18)).toBe(18) // boundary value
      expect(validator.parse(65)).toBe(65) // boundary value
    })

    it('should handle invalid number strings', () => {
      const validator = SchemaValidator.createFieldValidator(numberField)

      expect(() => validator.parse('not-a-number')).toThrow()
      expect(() => validator.parse('25.5')).toThrow() // strings are not automatically coerced
    })
  })

  describe('Email Field Validation', () => {
    const emailField: FieldSchema = {
      id: 'email-field',
      name: 'email',
      type: 'email',
      label: 'Email Address',
      validation: {
        required: true
      }
    }

    it('should validate email format', () => {
      const validator = SchemaValidator.createFieldValidator(emailField)

      expect(() => validator.parse('invalid-email')).toThrow()
      expect(() => validator.parse('test@')).toThrow()
      expect(() => validator.parse('@example.com')).toThrow()
      expect(validator.parse('test@example.com')).toBe('test@example.com')
      expect(validator.parse('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk')
    })

    it('should handle optional email field', () => {
      const optionalEmailField: FieldSchema = {
        ...emailField,
        validation: { required: false }
      }
      const validator = SchemaValidator.createFieldValidator(optionalEmailField)

      expect(validator.parse(undefined)).toBeUndefined()
      expect(validator.parse('test@example.com')).toBe('test@example.com')
    })
  })

  describe('Select Field Validation', () => {
    const selectField: FieldSchema = {
      id: 'country-field',
      name: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
        { value: 'uk', label: 'United Kingdom' }
      ],
      validation: {
        required: true
      }
    } as FieldSchema

    it('should validate select field options', () => {
      const validator = SchemaValidator.createFieldValidator(selectField)

      expect(() => validator.parse('invalid-option')).toThrow()
      expect(validator.parse('us')).toBe('us')
      expect(validator.parse('ca')).toBe('ca')
    })

    it('should handle multiple select', () => {
      const multiSelectField = {
        ...selectField,
        multiple: true
      } as FieldSchema
      const validator = SchemaValidator.createFieldValidator(multiSelectField)

      expect(validator.parse(['us', 'ca'])).toEqual(['us', 'ca'])
      expect(() => validator.parse(['us', 'invalid'])).toThrow()
    })
  })

  describe('Checkbox Field Validation', () => {
    const checkboxField: FieldSchema = {
      id: 'agree-field',
      name: 'agree',
      type: 'checkbox',
      label: 'I agree to terms',
      validation: {
        required: true
      }
    } as FieldSchema

    it('should validate checkbox field', () => {
      const validator = SchemaValidator.createFieldValidator(checkboxField)

      expect(() => validator.parse(false)).toThrow() // required but false
      expect(validator.parse(true)).toBe(true)
    })

    it('should handle optional checkbox', () => {
      const optionalCheckbox = {
        ...checkboxField,
        validation: { required: false }
      } as FieldSchema
      const validator = SchemaValidator.createFieldValidator(optionalCheckbox)

      expect(validator.parse(false)).toBe(false)
      expect(validator.parse(true)).toBe(true)
    })
  })

  describe('Date Field Validation', () => {
    const dateField: FieldSchema = {
      id: 'birth-date-field',
      name: 'birthDate',
      type: 'date',
      label: 'Birth Date',
      validation: {
        required: true
      }
    } as FieldSchema

    it('should validate date field', () => {
      const validator = SchemaValidator.createFieldValidator(dateField)

      expect(() => validator.parse('')).toThrow()
      expect(() => validator.parse('invalid-date')).toThrow()
      expect(() => validator.parse('2023-01-01')).toThrow() // strings are not automatically converted
      expect(validator.parse(new Date('2023-01-01'))).toBeInstanceOf(Date)
    })
  })

  describe('Form Schema Validation', () => {
    const formSchema = {
      id: 'test-form',
      title: 'Test Form',
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
            },
            {
              id: 'email-field',
              name: 'email',
              type: 'email',
              label: 'Email',
              validation: { required: true }
            }
          ]
        }
      ]
    }

    it('should validate complete form data', () => {
      const validator = SchemaValidator.createFormValidator(formSchema as FormSchema)

      const validData = {
        name: 'John Doe',
        email: 'john@example.com'
      }

      expect(validator.parse(validData)).toEqual(validData)
    })

    it('should catch validation errors in form data', () => {
      const validator = SchemaValidator.createFormValidator(formSchema as FormSchema)

      const invalidData = {
        name: '', // required but empty
        email: 'invalid-email'
      }

      expect(() => validator.parse(invalidData)).toThrow()
    })

    it('should handle missing fields', () => {
      const validator = SchemaValidator.createFormValidator(formSchema as FormSchema)

      const incompleteData = {
        name: 'John Doe'
        // email is missing
      }

      expect(() => validator.parse(incompleteData)).toThrow()
    })
  })

  describe('Custom Validation Rules', () => {
    it('should handle pattern validation', () => {
      const customField: TextFieldSchema = {
        id: 'custom-field',
        name: 'custom',
        type: 'text',
        label: 'Custom Field',
        validation: {
          required: true,
          pattern: '^[a-zA-Z]+$' // Only letters allowed
        }
      }

      const validator = SchemaValidator.createFieldValidator(customField)

      expect(() => validator.parse('forbidden123')).toThrow()
      expect(validator.parse('allowedvalue')).toBe('allowedvalue')
    })
  })

  describe('Error Messages', () => {
    it('should provide meaningful error messages', () => {
      const field: TextFieldSchema = {
        id: 'test-field',
        name: 'test',
        type: 'text',
        label: 'Test Field',
        validation: {
          required: true,
          minLength: 5
        }
      }

      const validator = SchemaValidator.createFieldValidator(field)

      try {
        validator.parse('')
      } catch (error: unknown) {
        expect(error.issues[0].message).toContain('at least 5')
      }

      try {
        validator.parse('abc')
      } catch (error: unknown) {
        expect(error.issues[0].message).toContain('at least 5')
      }
    })
  })
})
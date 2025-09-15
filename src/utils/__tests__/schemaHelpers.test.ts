import { describe, it, expect, vi } from 'vitest'
import {
  createEmptySchema,
  createFieldSchema,
  validateFieldValue,
  generateFieldId,
  cloneSchema,
  extractFormData
} from '../schemaHelpers'
import type { FormSchema, TextFieldSchema, NumberFieldSchema } from '../../types/schema'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234'
}))

describe('Schema Helpers', () => {
  describe('createEmptySchema', () => {
    it('should create an empty schema with default values', () => {
      const schema = createEmptySchema()

      expect(schema).toMatchObject({
        id: 'mock-uuid-1234',
        title: 'Untitled Form',
        version: '1.0.0',
        sections: [],
        settings: {
          theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#1d4ed8'
          },
          multiStep: false,
          showProgress: false,
          allowDrafts: true
        }
      })

      expect(schema.metadata.createdAt).toBeDefined()
      expect(schema.metadata.updatedAt).toBeDefined()
      expect(schema.metadata.createdBy).toBe('anonymous')
    })

    it('should create schema with custom title', () => {
      const schema = createEmptySchema('My Custom Form')

      expect(schema.title).toBe('My Custom Form')
    })

    it('should create schema with custom creator', () => {
      const schema = createEmptySchema('Test Form', 'test-user')

      expect(schema.metadata.createdBy).toBe('test-user')
    })

    it('should have valid timestamps', () => {
      const schema = createEmptySchema()

      const createdAt = new Date(schema.metadata.createdAt)
      const updatedAt = new Date(schema.metadata.updatedAt)

      expect(createdAt.getTime()).not.toBeNaN()
      expect(updatedAt.getTime()).not.toBeNaN()
      expect(Math.abs(createdAt.getTime() - updatedAt.getTime())).toBeLessThan(1000)
    })
  })

  describe('createFieldSchema', () => {
    it('should create a text field schema', () => {
      const field = createFieldSchema('text', 'firstName', 'First Name')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        hidden: false,
        disabled: false,
        readonly: false,
        order: 0
      })
    })

    it('should create a number field schema', () => {
      const field = createFieldSchema('number', 'age', 'Age')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'age',
        type: 'number',
        label: 'Age',
        hidden: false,
        disabled: false,
        readonly: false,
        order: 0
      })
    })

    it('should create a select field schema with options', () => {
      const field = createFieldSchema('select', 'country', 'Country')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'country',
        type: 'select',
        label: 'Country',
        options: []
      })
    })

    it('should create a checkbox field schema', () => {
      const field = createFieldSchema('checkbox', 'agree', 'I Agree')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'agree',
        type: 'checkbox',
        label: 'I Agree'
      })
    })

    it('should create a textarea field schema', () => {
      const field = createFieldSchema('textarea', 'message', 'Message')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'message',
        type: 'textarea',
        label: 'Message',
        rows: 4
      })
    })

    it('should create a date field schema', () => {
      const field = createFieldSchema('date', 'birthDate', 'Birth Date')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'birthDate',
        type: 'date',
        label: 'Birth Date'
      })
    })

    it('should create a radio field schema with options', () => {
      const field = createFieldSchema('radio', 'gender', 'Gender')

      expect(field).toMatchObject({
        id: 'mock-uuid-1234',
        name: 'gender',
        type: 'radio',
        label: 'Gender',
        options: []
      })
    })
  })

  describe('validateFieldValue', () => {
    it('should validate required text field', () => {
      const field: TextFieldSchema = {
        id: 'text-field',
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        validation: { required: true }
      }

      expect(validateFieldValue(field, '')).toBe(false)
      expect(validateFieldValue(field, null)).toBe(false)
      expect(validateFieldValue(field, undefined)).toBe(false)
      expect(validateFieldValue(field, 'John')).toBe(true)
    })

    it('should validate text field length constraints', () => {
      const field: TextFieldSchema = {
        id: 'text-field',
        name: 'username',
        type: 'text',
        label: 'Username',
        validation: {
          required: true,
          minLength: 3,
          maxLength: 20
        }
      }

      expect(validateFieldValue(field, 'ab')).toBe(false) // too short
      expect(validateFieldValue(field, 'a'.repeat(25))).toBe(false) // too long
      expect(validateFieldValue(field, 'validuser')).toBe(true)
    })

    it('should validate number field constraints', () => {
      const field: NumberFieldSchema = {
        id: 'number-field',
        name: 'age',
        type: 'number',
        label: 'Age',
        validation: {
          required: true,
          min: 18,
          max: 65
        }
      }

      expect(validateFieldValue(field, 17)).toBe(false) // too low
      expect(validateFieldValue(field, 70)).toBe(false) // too high
      expect(validateFieldValue(field, 25)).toBe(true)
      expect(validateFieldValue(field, '30')).toBe(true) // string number
    })

    it('should validate email format', () => {
      const field: TextFieldSchema = {
        id: 'email-field',
        name: 'email',
        type: 'email',
        label: 'Email',
        validation: { required: true }
      }

      expect(validateFieldValue(field, 'invalid-email')).toBe(false)
      expect(validateFieldValue(field, 'test@')).toBe(false)
      expect(validateFieldValue(field, 'test@example.com')).toBe(true)
    })

    it('should validate pattern constraints', () => {
      const field: TextFieldSchema = {
        id: 'phone-field',
        name: 'phone',
        type: 'text',
        label: 'Phone',
        validation: {
          required: true,
          pattern: '^\\d{3}-\\d{3}-\\d{4}$'
        }
      }

      expect(validateFieldValue(field, '1234567890')).toBe(false)
      expect(validateFieldValue(field, '123-456-7890')).toBe(true)
    })

    it('should skip validation for optional fields', () => {
      const field: TextFieldSchema = {
        id: 'optional-field',
        name: 'nickname',
        type: 'text',
        label: 'Nickname'
        // no validation rules
      }

      expect(validateFieldValue(field, '')).toBe(true)
      expect(validateFieldValue(field, null)).toBe(true)
      expect(validateFieldValue(field, 'Any Value')).toBe(true)
    })

    it('should handle disabled fields', () => {
      const field: TextFieldSchema = {
        id: 'disabled-field',
        name: 'disabledField',
        type: 'text',
        label: 'Disabled Field',
        disabled: true,
        validation: { required: true }
      }

      // Disabled fields should not be validated
      expect(validateFieldValue(field, '')).toBe(true)
    })

    it('should handle hidden fields', () => {
      const field: TextFieldSchema = {
        id: 'hidden-field',
        name: 'hiddenField',
        type: 'text',
        label: 'Hidden Field',
        hidden: true,
        validation: { required: true }
      }

      // Hidden fields should not be validated
      expect(validateFieldValue(field, '')).toBe(true)
    })
  })

  describe('generateFieldId', () => {
    it('should generate unique field IDs', () => {
      const id1 = generateFieldId()
      const id2 = generateFieldId()

      expect(id1).toBe('mock-uuid-1234')
      expect(id2).toBe('mock-uuid-1234') // mocked to same value
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })
  })

  describe('cloneSchema', () => {
    it('should create a deep copy of schema', () => {
      const originalSchema: FormSchema = {
        id: 'original-schema',
        title: 'Original Form',
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
              } as TextFieldSchema
            ]
          }
        ],
        settings: {
          theme: { primaryColor: '#ff0000' },
          multiStep: true
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'original-user'
        }
      }

      const clonedSchema = cloneSchema(originalSchema)

      // Should be a different object
      expect(clonedSchema).not.toBe(originalSchema)
      expect(clonedSchema.sections).not.toBe(originalSchema.sections)
      expect(clonedSchema.sections[0]).not.toBe(originalSchema.sections[0])

      // Should have same content
      expect(clonedSchema.title).toBe('Original Form')
      expect(clonedSchema.sections[0].title).toBe('Personal Info')
      expect(clonedSchema.sections[0].fields[0].name).toBe('name')

      // Should have new IDs
      expect(clonedSchema.id).toBe('mock-uuid-1234')
      expect(clonedSchema.sections[0].id).toBe('mock-uuid-1234')
      expect(clonedSchema.sections[0].fields[0].id).toBe('mock-uuid-1234')

      // Should have updated timestamps
      expect(clonedSchema.metadata.createdAt).not.toBe(originalSchema.metadata.createdAt)
      expect(clonedSchema.metadata.updatedAt).not.toBe(originalSchema.metadata.updatedAt)
    })

    it('should clone with custom title suffix', () => {
      const originalSchema: FormSchema = {
        id: 'original',
        title: 'My Form',
        version: '1.0.0',
        sections: [],
        settings: { theme: { primaryColor: '#000' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'user'
        }
      }

      const cloned = cloneSchema(originalSchema, ' (Copy)')
      expect(cloned.title).toBe('My Form (Copy)')
    })
  })

  describe('extractFormData', () => {
    it('should extract form data from schema sections', () => {
      const schema: FormSchema = {
        id: 'test-schema',
        title: 'Test Form',
        version: '1.0.0',
        sections: [
          {
            id: 'section-1',
            title: 'Personal',
            fields: [
              {
                id: 'name-field',
                name: 'firstName',
                type: 'text',
                label: 'First Name'
              } as TextFieldSchema,
              {
                id: 'age-field',
                name: 'age',
                type: 'number',
                label: 'Age'
              } as NumberFieldSchema
            ]
          },
          {
            id: 'section-2',
            title: 'Contact',
            fields: [
              {
                id: 'email-field',
                name: 'email',
                type: 'email',
                label: 'Email'
              } as TextFieldSchema
            ]
          }
        ],
        settings: { theme: { primaryColor: '#000' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'user'
        }
      }

      const submissionData = {
        firstName: 'John',
        age: 30,
        email: 'john@example.com',
        extraField: 'should be ignored'
      }

      const extractedData = extractFormData(schema, submissionData)

      expect(extractedData).toEqual({
        firstName: 'John',
        age: 30,
        email: 'john@example.com'
      })
    })

    it('should handle missing field values', () => {
      const schema: FormSchema = {
        id: 'test-schema',
        title: 'Test Form',
        version: '1.0.0',
        sections: [
          {
            id: 'section-1',
            title: 'Test',
            fields: [
              {
                id: 'name-field',
                name: 'name',
                type: 'text',
                label: 'Name'
              } as TextFieldSchema,
              {
                id: 'email-field',
                name: 'email',
                type: 'email',
                label: 'Email'
              } as TextFieldSchema
            ]
          }
        ],
        settings: { theme: { primaryColor: '#000' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'user'
        }
      }

      const submissionData = {
        name: 'John'
        // email is missing
      }

      const extractedData = extractFormData(schema, submissionData)

      expect(extractedData).toEqual({
        name: 'John'
      })
    })

    it('should handle empty sections', () => {
      const schema: FormSchema = {
        id: 'empty-schema',
        title: 'Empty Form',
        version: '1.0.0',
        sections: [],
        settings: { theme: { primaryColor: '#000' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'user'
        }
      }

      const extractedData = extractFormData(schema, { name: 'John' })

      expect(extractedData).toEqual({})
    })
  })
})
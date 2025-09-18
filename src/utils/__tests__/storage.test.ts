import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../storage'
import type { FormSchema } from '../../types/schema'
import type { FormSubmission } from '../../types/form'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Schema Management', () => {
    const mockSchema: FormSchema = {
      id: 'test-schema-1',
      title: 'Test Form',
      version: '1.0.0',
      sections: [
        {
          id: 'section-1',
          title: 'Personal Info',
          description: 'Basic information',
          fields: [
            {
              id: 'field-1',
              name: 'firstName',
              type: 'text',
              label: 'First Name',
              validation: { required: true }
            } as FormSchema['sections'][0]['fields'][0]
          ]
        }
      ],
      settings: {
        theme: { primaryColor: '#3b82f6' },
        multiStep: false,
        showProgress: false,
        allowDrafts: true
      },
      metadata: {
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        version: '1.0.0',
        status: 'draft',
        createdBy: 'test-user'
      }
    }

    it('should save a new schema', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      storage.saveSchema(mockSchema)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-schemas',
        JSON.stringify([mockSchema])
      )
    })

    it('should update an existing schema', () => {
      const existingSchemas = [mockSchema]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingSchemas))

      const updatedSchema = { ...mockSchema, title: 'Updated Form' }
      storage.saveSchema(updatedSchema)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-schemas',
        JSON.stringify([updatedSchema])
      )
    })

    it('should retrieve all schemas', () => {
      const schemas = [mockSchema]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(schemas))

      const result = storage.getSchemas()

      expect(result).toEqual(schemas)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('form-schemas')
    })

    it('should return empty array when no schemas exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = storage.getSchemas()

      expect(result).toEqual([])
    })

    it('should handle malformed JSON gracefully', () => {
      // Mock console.error to avoid error logs in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue('invalid-json')

      const result = storage.getSchemas()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should retrieve a specific schema by ID', () => {
      const schemas = [mockSchema]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(schemas))

      const result = storage.getSchemaById('test-schema-1')

      expect(result).toEqual(mockSchema)
    })

    it('should return undefined for non-existent schema', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      const result = storage.getSchemaById('non-existent')

      expect(result).toBeUndefined()
    })

    it('should delete a schema', () => {
      const schemas = [mockSchema, { ...mockSchema, id: 'schema-2' }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(schemas))

      storage.deleteSchema('test-schema-1')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-schemas',
        JSON.stringify([{ ...mockSchema, id: 'schema-2' }])
      )
    })

    it('should save multiple schemas', () => {
      const schemas = [mockSchema]

      storage.saveSchemas(schemas)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-schemas',
        JSON.stringify(schemas)
      )
    })
  })

  describe('Submission Management', () => {
    const mockSubmission: FormSubmission = {
      id: 'sub-1',
      formId: 'form-1',
      data: { firstName: 'John', lastName: 'Doe' },
      metadata: {
        submittedAt: '2023-01-01T12:00:00.000Z',
        userAgent: 'Test Browser',
        duration: 120
      },
      status: 'complete',
      validationErrors: []
    }

    it('should save a submission', () => {
      localStorageMock.getItem.mockReturnValue('[]')

      storage.saveSubmission(mockSubmission)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-submissions',
        JSON.stringify([mockSubmission])
      )
    })

    it('should retrieve all submissions', () => {
      const submissions = [mockSubmission]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(submissions))

      const result = storage.getSubmissions()

      expect(result).toEqual(submissions)
    })

    it('should return empty array when no submissions exist', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const result = storage.getSubmissions()

      expect(result).toEqual([])
    })

    it('should save multiple submissions', () => {
      const submissions = [mockSubmission]

      storage.saveSubmissions(submissions)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-submissions',
        JSON.stringify(submissions)
      )
    })

    it('should delete a submission', () => {
      const submissions = [mockSubmission, { ...mockSubmission, id: 'sub-2' }]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(submissions))

      storage.deleteSubmission('sub-1')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'form-submissions',
        JSON.stringify([{ ...mockSubmission, id: 'sub-2' }])
      )
    })

    it('should clear all data', () => {
      storage.clearAll()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('form-schemas')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('form-submissions')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock console.error to avoid error logs in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = storage.getSchemas()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should throw error for invalid schema', () => {
      // Mock console.error to avoid error logs in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        storage.saveSchema(null as unknown as FormSchema)
      }).toThrow('Failed to save schema')

      consoleSpy.mockRestore()
    })

    it('should throw error for schema without ID', () => {
      // Mock console.error to avoid error logs in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const baseSchema: FormSchema = {
        id: '',
        title: 'Test Form',
        version: '1.0.0',
        sections: [],
        settings: {
          theme: { primaryColor: '#3b82f6' },
          multiStep: false,
          showProgress: false,
          allowDrafts: true
        },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          version: '1.0.0',
          status: 'draft',
          createdBy: 'test-user'
        }
      }

      expect(() => {
        storage.saveSchema(baseSchema)
      }).toThrow('Failed to save schema')

      consoleSpy.mockRestore()
    })
  })
})
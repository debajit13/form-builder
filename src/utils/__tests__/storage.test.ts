import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from '../storage'
import type { FormSchema, FormSubmission } from '../../types/schema'

describe('Storage Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('saveSchema', () => {
    it('should save a schema to localStorage', () => {
      const schema: FormSchema = {
        id: 'test-schema',
        title: 'Test Schema',
        version: '1.0.0',
        sections: [],
        settings: { theme: { primaryColor: '#3b82f6' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'test-user'
        }
      }

      storage.saveSchema(schema)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'form-schemas',
        expect.stringContaining('"test-schema"')
      )
    })

    it('should update existing schema', () => {
      const schema: FormSchema = {
        id: 'existing-schema',
        title: 'Original Title',
        version: '1.0.0',
        sections: [],
        settings: { theme: { primaryColor: '#3b82f6' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'test-user'
        }
      }

      // Save initial schema
      storage.saveSchema(schema)

      // Update schema
      const updatedSchema = { ...schema, title: 'Updated Title' }
      storage.saveSchema(updatedSchema)

      const savedSchemas = storage.getSchemas()
      const savedSchema = savedSchemas.find(s => s.id === 'existing-schema')
      expect(savedSchema?.title).toBe('Updated Title')
    })
  })

  describe('getSchemas', () => {
    it('should return empty array when no schemas exist', () => {
      localStorage.getItem.mockReturnValue(null)
      const schemas = storage.getSchemas()
      expect(schemas).toEqual([])
    })

    it('should return saved schemas', () => {
      const schemas = [
        {
          id: 'schema-1',
          title: 'Schema 1',
          version: '1.0.0',
          sections: [],
          settings: { theme: { primaryColor: '#3b82f6' } },
          metadata: {
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            createdBy: 'test-user'
          }
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(schemas))
      const result = storage.getSchemas()
      expect(result).toEqual(schemas)
    })

    it('should handle malformed JSON gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid-json')
      const schemas = storage.getSchemas()
      expect(schemas).toEqual([])
    })
  })

  describe('getSchema', () => {
    it('should return specific schema by id', () => {
      const schema = {
        id: 'target-schema',
        title: 'Target Schema',
        version: '1.0.0',
        sections: [],
        settings: { theme: { primaryColor: '#3b82f6' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'test-user'
        }
      }

      localStorage.getItem.mockReturnValue(JSON.stringify([schema]))
      const result = storage.getSchemaById('target-schema')
      expect(result).toEqual(schema)
    })

    it('should return undefined for non-existent schema', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      const result = storage.getSchemaById('non-existent')
      expect(result).toBeUndefined()
    })
  })

  describe('deleteSchema', () => {
    it('should remove schema from storage', () => {
      const schemas = [
        {
          id: 'schema-1',
          title: 'Schema 1',
          version: '1.0.0',
          sections: [],
          settings: { theme: { primaryColor: '#3b82f6' } },
          metadata: {
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            createdBy: 'test-user'
          }
        },
        {
          id: 'schema-2',
          title: 'Schema 2',
          version: '1.0.0',
          sections: [],
          settings: { theme: { primaryColor: '#3b82f6' } },
          metadata: {
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            createdBy: 'test-user'
          }
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(schemas))
      storage.deleteSchema('schema-1')

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'form-schemas',
        JSON.stringify([schemas[1]])
      )
    })
  })

  describe('saveSubmission', () => {
    it('should save a form submission', () => {
      const submission: FormSubmission = {
        id: 'submission-1',
        formId: 'form-1',
        data: { name: 'John Doe', age: 30 },
        submittedAt: '2023-01-01T00:00:00.000Z',
        status: 'complete',
        validationErrors: []
      }

      storage.saveSubmission(submission)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'form-submissions',
        expect.stringContaining('"submission-1"')
      )
    })
  })

  describe('getSubmissions', () => {
    it('should return all submissions', () => {
      const submissions = [
        {
          id: 'submission-1',
          formId: 'form-1',
          data: { name: 'John Doe' },
          submittedAt: '2023-01-01T00:00:00.000Z',
          status: 'complete',
          validationErrors: []
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(submissions))
      const result = storage.getSubmissions()
      expect(result).toEqual(submissions)
    })

    it('should filter submissions by form ID', () => {
      const submissions = [
        {
          id: 'submission-1',
          formId: 'form-1',
          data: { name: 'John Doe' },
          submittedAt: '2023-01-01T00:00:00.000Z',
          status: 'complete',
          validationErrors: []
        },
        {
          id: 'submission-2',
          formId: 'form-2',
          data: { email: 'jane@example.com' },
          submittedAt: '2023-01-01T00:00:00.000Z',
          status: 'complete',
          validationErrors: []
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(submissions))
      const result = storage.getSubmissions('form-1')
      expect(result).toEqual([submissions[0]])
    })
  })

  describe('getSubmission', () => {
    it('should return specific submission by id', () => {
      const submission = {
        id: 'target-submission',
        formId: 'form-1',
        data: { name: 'John Doe' },
        submittedAt: '2023-01-01T00:00:00.000Z',
        status: 'complete',
        validationErrors: []
      }

      localStorage.getItem.mockReturnValue(JSON.stringify([submission]))
      const result = storage.getSubmission('target-submission')
      expect(result).toEqual(submission)
    })

    it('should return null for non-existent submission', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify([]))
      const result = storage.getSubmission('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('deleteSubmission', () => {
    it('should remove submission from storage', () => {
      const submissions = [
        {
          id: 'submission-1',
          formId: 'form-1',
          data: { name: 'John' },
          submittedAt: '2023-01-01T00:00:00.000Z',
          status: 'complete',
          validationErrors: []
        },
        {
          id: 'submission-2',
          formId: 'form-1',
          data: { name: 'Jane' },
          submittedAt: '2023-01-01T00:00:00.000Z',
          status: 'complete',
          validationErrors: []
        }
      ]

      localStorage.getItem.mockReturnValue(JSON.stringify(submissions))
      storage.deleteSubmission('submission-1')

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'form-submissions',
        JSON.stringify([submissions[1]])
      )
    })
  })

  describe('exportData', () => {
    it('should export all data as JSON', () => {
      const schemas = [{ id: 'schema-1', title: 'Test Schema' }]
      const submissions = [{ id: 'submission-1', formId: 'schema-1' }]

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'form-schemas') return JSON.stringify(schemas)
        if (key === 'form-submissions') return JSON.stringify(submissions)
        return null
      })

      const exportData = storage.exportData()
      expect(exportData).toEqual({
        schemas,
        submissions,
        exportedAt: expect.any(String)
      })
    })
  })

  describe('importData', () => {
    it('should import data and merge with existing', () => {
      const importData = {
        schemas: [{ id: 'imported-schema', title: 'Imported Schema' }],
        submissions: [{ id: 'imported-submission', formId: 'imported-schema' }],
        exportedAt: '2023-01-01T00:00:00.000Z'
      }

      const result = storage.importData(importData)
      expect(result.schemasImported).toBe(1)
      expect(result.submissionsImported).toBe(1)

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'form-schemas',
        expect.stringContaining('imported-schema')
      )
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'form-submissions',
        expect.stringContaining('imported-submission')
      )
    })

    it('should handle duplicate IDs by skipping', () => {
      const existingSchemas = [{ id: 'existing-schema', title: 'Existing' }]
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'form-schemas') return JSON.stringify(existingSchemas)
        if (key === 'form-submissions') return JSON.stringify([])
        return null
      })

      const importData = {
        schemas: [
          { id: 'existing-schema', title: 'Updated' },
          { id: 'new-schema', title: 'New' }
        ],
        submissions: [],
        exportedAt: '2023-01-01T00:00:00.000Z'
      }

      const result = storage.importData(importData)
      expect(result.schemasImported).toBe(1) // Only new schema imported
    })
  })

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      storage.clearAll()

      expect(localStorage.removeItem).toHaveBeenCalledWith('form-schemas')
      expect(localStorage.removeItem).toHaveBeenCalledWith('form-submissions')
    })
  })
})
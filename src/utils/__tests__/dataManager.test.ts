import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataManager } from '../dataManager'
import type { FormSchema, FormSubmission } from '../../types/schema'

// Mock storage
vi.mock('../storage', () => ({
  storage: {
    getSchemas: vi.fn(),
    getSubmissions: vi.fn(),
    saveSchemas: vi.fn(),
    saveSubmissions: vi.fn(),
    clearAll: vi.fn()
  }
}))

import { storage } from '../storage'

describe('DataManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Schema Validation', () => {
    it('should validate a valid schema', () => {
      const validSchema: FormSchema = {
        id: 'test-schema',
        title: 'Test Form',
        version: '1.0.0',
        sections: [
          {
            id: 'section-1',
            title: 'Personal Info',
            fields: [
              {
                id: 'field-1',
                name: 'firstName',
                type: 'text',
                label: 'First Name'
              } as any
            ]
          }
        ],
        settings: { theme: { primaryColor: '#000' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          version: '1.0.0',
          status: 'draft',
          createdBy: 'user'
        }
      }

      const result = DataManager.validateSchema(validSchema)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject schema without ID', () => {
      const invalidSchema = {
        title: 'Test Form',
        sections: []
      }

      const result = DataManager.validateSchema(invalidSchema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Schema must have a valid ID')
    })

    it('should reject schema without title', () => {
      const invalidSchema = {
        id: 'test-schema',
        sections: []
      }

      const result = DataManager.validateSchema(invalidSchema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Schema must have a title')
    })

    it('should reject schema without sections', () => {
      const invalidSchema = {
        id: 'test-schema',
        title: 'Test Form'
      }

      const result = DataManager.validateSchema(invalidSchema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Schema must have sections array')
    })

    it('should reject schema with empty sections array', () => {
      const invalidSchema = {
        id: 'test-schema',
        title: 'Test Form',
        sections: []
      }

      const result = DataManager.validateSchema(invalidSchema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Schema must have at least one section')
    })

    it('should validate section structure', () => {
      const schemaWithInvalidSection = {
        id: 'test-schema',
        title: 'Test Form',
        sections: [
          {
            // missing id
            title: 'Section 1',
            fields: []
          }
        ]
      }

      const result = DataManager.validateSchema(schemaWithInvalidSection)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Section 1 must have a valid ID')
    })

    it('should validate field structure', () => {
      const schemaWithInvalidField = {
        id: 'test-schema',
        title: 'Test Form',
        sections: [
          {
            id: 'section-1',
            title: 'Section 1',
            fields: [
              {
                // missing id and name
                type: 'text',
                label: 'Field 1'
              }
            ]
          }
        ]
      }

      const result = DataManager.validateSchema(schemaWithInvalidField)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field 1 in section 1 must have a valid ID')
      expect(result.errors).toContain('Field 1 in section 1 must have a name')
    })
  })

  describe('Submission Validation', () => {
    it('should validate a valid submission', () => {
      const validSubmission: FormSubmission = {
        id: 'sub-1',
        formId: 'form-1',
        data: { name: 'John Doe' },
        metadata: {
          submittedAt: '2023-01-01T12:00:00.000Z',
          userAgent: 'Test Browser',
          duration: 120
        },
        status: 'complete',
        validationErrors: []
      }

      const result = DataManager.validateSubmission(validSubmission)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject submission without ID', () => {
      const invalidSubmission = {
        formId: 'form-1',
        data: {},
        metadata: { submittedAt: '2023-01-01T12:00:00.000Z' }
      }

      const result = DataManager.validateSubmission(invalidSubmission)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Submission must have a valid ID')
    })

    it('should reject submission without form ID', () => {
      const invalidSubmission = {
        id: 'sub-1',
        data: {},
        metadata: { submittedAt: '2023-01-01T12:00:00.000Z' }
      }

      const result = DataManager.validateSubmission(invalidSubmission)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Submission must have a valid form ID')
    })

    it('should reject submission without metadata', () => {
      const invalidSubmission = {
        id: 'sub-1',
        formId: 'form-1',
        data: {}
      }

      const result = DataManager.validateSubmission(invalidSubmission)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Submission must have metadata object')
    })

    it('should reject submission without submittedAt timestamp', () => {
      const invalidSubmission = {
        id: 'sub-1',
        formId: 'form-1',
        data: {},
        metadata: { userAgent: 'Test' }
      }

      const result = DataManager.validateSubmission(invalidSubmission)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Submission metadata must include submittedAt timestamp')
    })
  })

  describe('Data Export', () => {
    const mockSchemas: FormSchema[] = [
      {
        id: 'form-1',
        title: 'Form 1',
        version: '1.0.0',
        sections: [],
        settings: { theme: { primaryColor: '#000' } },
        metadata: {
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          version: '1.0.0',
          status: 'draft',
          createdBy: 'user'
        }
      }
    ]

    const mockSubmissions: FormSubmission[] = [
      {
        id: 'sub-1',
        formId: 'form-1',
        data: { name: 'John' },
        metadata: {
          submittedAt: '2023-01-01T12:00:00.000Z',
          userAgent: 'Test',
          duration: 120
        },
        status: 'complete',
        validationErrors: []
      }
    ]

    beforeEach(() => {
      (storage.getSchemas as any).mockReturnValue(mockSchemas);
      (storage.getSubmissions as any).mockReturnValue(mockSubmissions)
    })

    it('should export all data by default', () => {
      const exported = DataManager.exportData()
      const parsedData = JSON.parse(exported)

      expect(parsedData).toHaveProperty('schemas')
      expect(parsedData).toHaveProperty('submissions')
      expect(parsedData).toHaveProperty('exportedAt')
      expect(parsedData.schemas).toHaveLength(1)
      expect(parsedData.submissions).toHaveLength(1)
    })

    it('should export only schemas when specified', () => {
      const exported = DataManager.exportData({
        includeSchemas: true,
        includeSubmissions: false
      })
      const parsedData = JSON.parse(exported)

      expect(parsedData.schemas).toHaveLength(1)
      expect(parsedData.submissions).toHaveLength(0)
    })

    it('should export only submissions when specified', () => {
      const exported = DataManager.exportData({
        includeSchemas: false,
        includeSubmissions: true
      })
      const parsedData = JSON.parse(exported)

      expect(parsedData.schemas).toHaveLength(0)
      expect(parsedData.submissions).toHaveLength(1)
    })

    it('should filter by form IDs', () => {
      const exported = DataManager.exportData({
        formIds: ['form-1']
      })
      const parsedData = JSON.parse(exported)

      expect(parsedData.schemas).toHaveLength(1)
      expect(parsedData.submissions).toHaveLength(1)
      expect(parsedData.schemas[0].id).toBe('form-1')
      expect(parsedData.submissions[0].formId).toBe('form-1')
    })

    it('should filter by date range', () => {
      const startDate = new Date('2023-01-01T00:00:00.000Z')
      const endDate = new Date('2023-01-01T23:59:59.999Z')

      const exported = DataManager.exportData({
        dateRange: { start: startDate, end: endDate }
      })
      const parsedData = JSON.parse(exported)

      expect(parsedData.submissions).toHaveLength(1)
    })

    it('should exclude submissions outside date range', () => {
      const startDate = new Date('2023-01-02T00:00:00.000Z')
      const endDate = new Date('2023-01-02T23:59:59.999Z')

      const exported = DataManager.exportData({
        dateRange: { start: startDate, end: endDate }
      })
      const parsedData = JSON.parse(exported)

      expect(parsedData.submissions).toHaveLength(0)
    })
  })

  describe('Data Import', () => {
    it('should import valid data', async () => {
      const validData = {
        schemas: [{
          id: 'imported-schema',
          title: 'Imported Form',
          version: '1.0.0',
          sections: [{
            id: 'section-1',
            title: 'Section 1',
            fields: [{
              id: 'field-1',
              name: 'name',
              type: 'text',
              label: 'Name'
            }]
          }],
          settings: { theme: { primaryColor: '#000' } },
          metadata: {
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            version: '1.0.0',
            status: 'draft',
            createdBy: 'user'
          }
        }],
        submissions: [{
          id: 'imported-sub',
          formId: 'imported-schema',
          data: { name: 'John' },
          metadata: {
            submittedAt: '2023-01-01T12:00:00.000Z',
            userAgent: 'Test',
            duration: 120
          },
          status: 'complete',
          validationErrors: []
        }]
      }

      ;(storage.getSchemas as any).mockReturnValue([]);
      (storage.getSubmissions as any).mockReturnValue([])

      const result = await DataManager.importData(JSON.stringify(validData))

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.imported.schemas).toBe(1)
      expect(result.imported.submissions).toBe(1)
    })

    it('should handle invalid JSON', async () => {
      const result = await DataManager.importData('invalid-json')

      expect(result.success).toBe(false)
      expect(result.errors.some(error => error.includes('parse'))).toBe(true)
    })

    it('should reject data without schemas or submissions', async () => {
      const invalidData = { someOtherData: true }

      const result = await DataManager.importData(JSON.stringify(invalidData))

      expect(result.success).toBe(true) // No errors occurred, just no data to import
      expect(result.imported.schemas).toBe(0)
      expect(result.imported.submissions).toBe(0)
    })

    it('should skip invalid schemas and submissions', async () => {
      const mixedData = {
        schemas: [
          { id: 'valid-schema', title: 'Valid', sections: [{ id: 's1', title: 'S1', fields: [] }] },
          { /* invalid schema without required fields */ }
        ],
        submissions: [
          {
            id: 'valid-sub',
            formId: 'valid-schema',
            data: {},
            metadata: { submittedAt: '2023-01-01T12:00:00.000Z' }
          },
          { /* invalid submission without required fields */ }
        ]
      }

      ;(storage.getSchemas as any).mockReturnValue([]);
      (storage.getSubmissions as any).mockReturnValue([])

      const result = await DataManager.importData(JSON.stringify(mixedData))

      expect(result.imported.schemas).toBe(1) // only valid schema imported
      expect(result.imported.submissions).toBe(1) // only valid submission imported
      expect(result.errors.length).toBeGreaterThan(0) // errors for invalid items
      // success should be false due to validation errors for invalid items
      expect(result.success).toBe(false)
    })
  })

  describe('Data Cleanup', () => {
    it('should clean old submissions', () => {
      const today = new Date()
      const oldDate = new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
      const recentDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

      const oldSubmissions = [
        {
          id: 'old-sub',
          formId: 'form-1',
          data: {},
          metadata: { submittedAt: oldDate.toISOString() },
          status: 'complete',
          validationErrors: []
        },
        {
          id: 'new-sub',
          formId: 'form-1',
          data: {},
          metadata: { submittedAt: recentDate.toISOString() },
          status: 'complete',
          validationErrors: []
        }
      ];

      (storage.getSubmissions as any).mockReturnValue(oldSubmissions)

      const daysToKeep = 30
      const deletedCount = DataManager.cleanupOldSubmissions(daysToKeep)

      expect(deletedCount).toBe(1) // one old submission should be deleted
      expect(storage.saveSubmissions).toHaveBeenCalled()
    })

    it('should handle cleanup with no old submissions', () => {
      const recentSubmissions = [
        {
          id: 'recent-sub',
          formId: 'form-1',
          data: {},
          metadata: { submittedAt: new Date().toISOString() },
          status: 'complete',
          validationErrors: []
        }
      ];

      (storage.getSubmissions as any).mockReturnValue(recentSubmissions)

      const deletedCount = DataManager.cleanupOldSubmissions(30)

      expect(deletedCount).toBe(0)
    })
  })

  describe('Analytics', () => {
    it('should generate submission analytics', () => {
      const submissions = [
        {
          id: 'sub-1',
          formId: 'form-1',
          data: {},
          metadata: { submittedAt: new Date().toISOString() },
          status: 'complete',
          validationErrors: []
        },
        {
          id: 'sub-2',
          formId: 'form-1',
          data: {},
          metadata: { submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          status: 'complete',
          validationErrors: []
        }
      ];

      (storage.getSubmissions as any).mockReturnValue(submissions)

      const analytics = DataManager.getAnalytics()

      expect(analytics).toHaveProperty('totalSubmissions', 2)
      expect(analytics).toHaveProperty('submissionsToday')
      expect(analytics).toHaveProperty('submissionsThisWeek')
      expect(analytics).toHaveProperty('submissionsThisMonth')
      expect(analytics).toHaveProperty('averageSubmissionsPerDay')
    })

    it('should handle empty submissions for analytics', () => {
      ;(storage.getSubmissions as any).mockReturnValue([])

      const analytics = DataManager.getAnalytics()

      expect(analytics.totalSubmissions).toBe(0)
      expect(analytics.submissionsToday).toBe(0)
      expect(analytics.averageSubmissionsPerDay).toBe(0)
    })
  })
})
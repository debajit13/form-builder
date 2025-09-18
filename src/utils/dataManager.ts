import type { FormSchema, FormSubmission } from '../types/schema';
import { storage } from './storage';

export interface DataExportOptions {
  includeSchemas?: boolean;
  includeSubmissions?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  formIds?: string[];
  format?: 'json' | 'csv';
}

export interface DataImportResult {
  success: boolean;
  errors: string[];
  imported: {
    schemas: number;
    submissions: number;
  };
}

export class DataManager {
  // Data validation
  static validateSchema(schema: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema || typeof schema !== 'object') {
      return { isValid: false, errors: ['Invalid schema format'] };
    }

    // Required fields
    if (!schema.id || typeof schema.id !== 'string') {
      errors.push('Schema must have a valid ID');
    }

    if (!schema.title || typeof schema.title !== 'string') {
      errors.push('Schema must have a title');
    }

    if (!schema.sections || !Array.isArray(schema.sections)) {
      errors.push('Schema must have sections array');
    } else if (schema.sections.length === 0) {
      errors.push('Schema must have at least one section');
    }

    // Validate sections
    (schema as FormSchema).sections?.forEach((section: unknown, sectionIndex: number) => {
      if (!section.id || typeof section.id !== 'string') {
        errors.push(`Section ${sectionIndex + 1} must have a valid ID`);
      }

      if (!section.title || typeof section.title !== 'string') {
        errors.push(`Section ${sectionIndex + 1} must have a title`);
      }

      if (!section.fields || !Array.isArray(section.fields)) {
        errors.push(`Section ${sectionIndex + 1} must have fields array`);
      } else {
        (section as { fields: unknown[] }).fields.forEach((field: unknown, fieldIndex: number) => {
          if (!field.id || typeof field.id !== 'string') {
            errors.push(`Field ${fieldIndex + 1} in section ${sectionIndex + 1} must have a valid ID`);
          }

          if (!field.name || typeof field.name !== 'string') {
            errors.push(`Field ${fieldIndex + 1} in section ${sectionIndex + 1} must have a name`);
          }

          if (!field.type || typeof field.type !== 'string') {
            errors.push(`Field ${fieldIndex + 1} in section ${sectionIndex + 1} must have a type`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateSubmission(submission: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!submission || typeof submission !== 'object') {
      return { isValid: false, errors: ['Invalid submission format'] };
    }

    if (!submission.id || typeof submission.id !== 'string') {
      errors.push('Submission must have a valid ID');
    }

    if (!submission.formId || typeof submission.formId !== 'string') {
      errors.push('Submission must have a valid form ID');
    }

    if (!submission.data || typeof submission.data !== 'object') {
      errors.push('Submission must have data object');
    }

    if (!submission.metadata || typeof submission.metadata !== 'object') {
      errors.push('Submission must have metadata object');
    } else {
      if (!submission.metadata.submittedAt) {
        errors.push('Submission metadata must include submittedAt timestamp');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Data export
  static exportData(options: DataExportOptions = {}): string {
    const {
      includeSchemas = true,
      includeSubmissions = true,
      dateRange,
      formIds,
      format = 'json'
    } = options;

    let schemas: FormSchema[] = [];
    let submissions: FormSubmission[] = [];

    if (includeSchemas) {
      schemas = storage.getSchemas();
      if (formIds) {
        schemas = schemas.filter(schema => formIds.includes(schema.id));
      }
    }

    if (includeSubmissions) {
      submissions = storage.getSubmissions() as FormSubmission[];

      if (formIds) {
        submissions = submissions.filter(submission => formIds.includes(submission.formId));
      }

      if (dateRange) {
        submissions = submissions.filter(submission => {
          const submittedAt = new Date((submission as FormSubmission).metadata?.submittedAt || (submission as FormSubmission).submittedAt);
          return submittedAt >= dateRange.start && submittedAt <= dateRange.end;
        });
      }
    }

    const exportData = {
      schemas,
      submissions,
      exportedAt: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        totalSchemas: schemas.length,
        totalSubmissions: submissions.length,
        exportOptions: options
      }
    };

    if (format === 'csv') {
      return this.convertToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  static convertToCSV(data: unknown[]): string {
    const lines: string[] = [];

    // Export schemas as CSV
    if (data.schemas && data.schemas.length > 0) {
      lines.push('--- SCHEMAS ---');
      lines.push('ID,Title,Description,Version,Status,Created At,Updated At');

      data.schemas.forEach((schema: FormSchema) => {
        const row = [
          schema.id,
          schema.title,
          schema.description || '',
          schema.version,
          schema.metadata.status,
          schema.metadata.createdAt,
          schema.metadata.updatedAt
        ].map(field => `"${String(field).replace(/"/g, '""')}"`);

        lines.push(row.join(','));
      });

      lines.push('');
    }

    // Export submissions as CSV
    if (data.submissions && data.submissions.length > 0) {
      lines.push('--- SUBMISSIONS ---');

      // Get all unique field names across all submissions
      const allFieldNames = new Set<string>();
      data.submissions.forEach((submission: FormSubmission) => {
        Object.keys(submission.data).forEach(key => allFieldNames.add(key));
      });

      const headers = ['ID', 'Form ID', 'Status', 'Submitted At', ...Array.from(allFieldNames)];
      lines.push(headers.join(','));

      data.submissions.forEach((submission: FormSubmission) => {
        const row = [
          submission.id,
          submission.formId,
          submission.status,
          (submission as FormSubmission).metadata?.submittedAt || (submission as FormSubmission).submittedAt,
          ...Array.from(allFieldNames).map(fieldName => {
            const value = submission.data[fieldName];
            return `"${String(value || '').replace(/"/g, '""')}"`;
          })
        ];

        lines.push(row.join(','));
      });
    }

    return lines.join('\n');
  }

  // Data import
  static async importData(jsonData: string): Promise<DataImportResult> {
    const result: DataImportResult = {
      success: false,
      errors: [],
      imported: {
        schemas: 0,
        submissions: 0
      }
    };

    try {
      const data = JSON.parse(jsonData);

      // Import schemas
      if (data.schemas && Array.isArray(data.schemas)) {
        const existingSchemas = storage.getSchemas();
        const schemasToImport: FormSchema[] = [];

        for (const schema of data.schemas) {
          const validation = this.validateSchema(schema);
          if (validation.isValid) {
            // Check for duplicates
            const exists = existingSchemas.find(existing => existing.id === schema.id);
            if (!exists) {
              schemasToImport.push(schema);
            }
          } else {
            result.errors.push(`Invalid schema "${schema.title || 'Unknown'}": ${validation.errors.join(', ')}`);
          }
        }

        if (schemasToImport.length > 0) {
          const allSchemas = [...existingSchemas, ...schemasToImport];
          storage.saveSchemas(allSchemas);
          result.imported.schemas = schemasToImport.length;
        }
      }

      // Import submissions
      if (data.submissions && Array.isArray(data.submissions)) {
        const existingSubmissions = storage.getSubmissions();
        const submissionsToImport: FormSubmission[] = [];

        for (const submission of data.submissions) {
          const validation = this.validateSubmission(submission);
          if (validation.isValid) {
            // Check for duplicates
            const exists = existingSubmissions.find(existing => existing.id === submission.id);
            if (!exists) {
              submissionsToImport.push(submission);
            }
          } else {
            result.errors.push(`Invalid submission "${submission.id || 'Unknown'}": ${validation.errors.join(', ')}`);
          }
        }

        if (submissionsToImport.length > 0) {
          const allSubmissions = [...existingSubmissions, ...submissionsToImport];
          storage.saveSubmissions(allSubmissions as FormSubmission[]);
          result.imported.submissions = submissionsToImport.length;
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  // Data cleanup utilities
  static cleanupOldSubmissions(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const submissions = storage.getSubmissions();
    const oldSubmissions = submissions.filter(submission => {
      const submittedAt = new Date((submission as FormSubmission).metadata?.submittedAt || (submission as FormSubmission).submittedAt);
      return submittedAt < cutoffDate;
    });

    if (oldSubmissions.length > 0) {
      const remainingSubmissions = submissions.filter(submission => {
        const submittedAt = new Date((submission as FormSubmission).metadata?.submittedAt || (submission as FormSubmission).submittedAt);
        return submittedAt >= cutoffDate;
      });

      storage.saveSubmissions(remainingSubmissions as FormSubmission[]);
    }

    return oldSubmissions.length;
  }

  static removeEmptySchemas(): number {
    const schemas = storage.getSchemas();
    const nonEmptySchemas = schemas.filter(schema =>
      schema.sections.length > 0 &&
      schema.sections.some(section => section.fields.length > 0)
    );

    const removedCount = schemas.length - nonEmptySchemas.length;
    if (removedCount > 0) {
      storage.saveSchemas(nonEmptySchemas);
    }

    return removedCount;
  }

  // Analytics utilities
  static getAnalytics(formId?: string) {
    const submissions = formId ? storage.getSubmissions(formId) : storage.getSubmissions();

    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        submissionsToday: 0,
        submissionsThisWeek: 0,
        submissionsThisMonth: 0,
        averageSubmissionsPerDay: 0,
        fieldPopularity: {},
        submissionTrends: []
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Field popularity analysis
    const fieldPopularity: Record<string, number> = {};
    submissions.forEach(submission => {
      Object.keys(submission.data).forEach(fieldName => {
        const value = submission.data[fieldName];
        if (value !== null && value !== undefined && value !== '') {
          fieldPopularity[fieldName] = (fieldPopularity[fieldName] || 0) + 1;
        }
      });
    });

    // Submission trends (last 30 days)
    const submissionTrends: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = submissions.filter(submission => {
        const submissionDate = new Date((submission as FormSubmission).metadata?.submittedAt || (submission as FormSubmission).submittedAt);
        return submissionDate.toISOString().split('T')[0] === dateStr;
      }).length;

      submissionTrends.push({ date: dateStr, count });
    }

    const oldestSubmission = submissions.reduce((oldest, current) => {
      return new Date((current as FormSubmission).metadata?.submittedAt || (current as FormSubmission).submittedAt) < new Date((oldest as FormSubmission).metadata?.submittedAt || (oldest as FormSubmission).submittedAt) ? current : oldest;
    });

    const daysSinceFirst = Math.max(1, Math.floor((now.getTime() - new Date((oldestSubmission as FormSubmission).metadata?.submittedAt || (oldestSubmission as FormSubmission).submittedAt).getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalSubmissions: submissions.length,
      submissionsToday: submissions.filter(s => new Date((s as FormSubmission).metadata?.submittedAt || (s as FormSubmission).submittedAt) >= today).length,
      submissionsThisWeek: submissions.filter(s => new Date((s as FormSubmission).metadata?.submittedAt || (s as FormSubmission).submittedAt) >= weekAgo).length,
      submissionsThisMonth: submissions.filter(s => new Date((s as FormSubmission).metadata?.submittedAt || (s as FormSubmission).submittedAt) >= monthAgo).length,
      averageSubmissionsPerDay: Math.round((submissions.length / daysSinceFirst) * 100) / 100,
      fieldPopularity,
      submissionTrends
    };
  }

  // Backup and restore
  static createBackup(): string {
    return this.exportData({
      includeSchemas: true,
      includeSubmissions: true,
      format: 'json'
    });
  }

  static async restoreFromBackup(backupData: string): Promise<DataImportResult> {
    // Clear existing data first
    storage.clearAll();

    // Import backup data
    return this.importData(backupData);
  }
}
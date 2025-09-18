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

    const s = schema as any; // Type assertion for validation function

    // Required fields
    if (!s.id || typeof s.id !== 'string') {
      errors.push('Schema must have a valid ID');
    }

    if (!s.title || typeof s.title !== 'string') {
      errors.push('Schema must have a title');
    }

    if (!s.sections || !Array.isArray(s.sections)) {
      errors.push('Schema must have sections array');
    } else if (s.sections.length === 0) {
      errors.push('Schema must have at least one section');
    }

    // Validate sections
    s.sections?.forEach((section: unknown, sectionIndex: number) => {
      const sec = section as any;
      if (!sec.id || typeof sec.id !== 'string') {
        errors.push(`Section ${sectionIndex + 1} must have a valid ID`);
      }

      if (!sec.title || typeof sec.title !== 'string') {
        errors.push(`Section ${sectionIndex + 1} must have a title`);
      }

      if (!sec.fields || !Array.isArray(sec.fields)) {
        errors.push(`Section ${sectionIndex + 1} must have fields array`);
      } else {
        sec.fields.forEach((field: unknown, fieldIndex: number) => {
          const f = field as any;
          if (!f.id || typeof f.id !== 'string') {
            errors.push(`Field ${fieldIndex + 1} in section ${sectionIndex + 1} must have a valid ID`);
          }

          if (!f.name || typeof f.name !== 'string') {
            errors.push(`Field ${fieldIndex + 1} in section ${sectionIndex + 1} must have a name`);
          }

          if (!f.type || typeof f.type !== 'string') {
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

    const sub = submission as any; // Type assertion for validation function

    if (!sub.id || typeof sub.id !== 'string') {
      errors.push('Submission must have a valid ID');
    }

    if (!sub.formId || typeof sub.formId !== 'string') {
      errors.push('Submission must have a valid form ID');
    }

    if (!sub.data || typeof sub.data !== 'object') {
      errors.push('Submission must have data object');
    }

    if (!sub.metadata || typeof sub.metadata !== 'object') {
      errors.push('Submission must have metadata object');
    } else {
      if (!sub.metadata.submittedAt) {
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
          const submittedAt = new Date(submission.metadata.submittedAt);
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

  static convertToCSV(data: { schemas?: FormSchema[]; submissions?: FormSubmission[] }): string {
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
          `"${submission.id}"`,
          `"${submission.formId}"`,
          `"${submission.status}"`,
          `"${submission.metadata.submittedAt}"`,
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
          storage.saveSubmissions(allSubmissions);
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
      const submittedAt = new Date(submission.metadata.submittedAt);
      return submittedAt < cutoffDate;
    });

    if (oldSubmissions.length > 0) {
      const remainingSubmissions = submissions.filter(submission => {
        const submittedAt = new Date(submission.metadata.submittedAt);
        return submittedAt >= cutoffDate;
      });

      storage.saveSubmissions(remainingSubmissions);
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
        const submissionDate = new Date(submission.metadata.submittedAt);
        return submissionDate.toISOString().split('T')[0] === dateStr;
      }).length;

      submissionTrends.push({ date: dateStr, count });
    }

    const oldestSubmission = submissions.reduce((oldest, current) => {
      return new Date(current.metadata.submittedAt) < new Date(oldest.metadata.submittedAt) ? current : oldest;
    });

    const daysSinceFirst = Math.max(1, Math.floor((now.getTime() - new Date(oldestSubmission.metadata.submittedAt).getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalSubmissions: submissions.length,
      submissionsToday: submissions.filter(s => new Date(s.metadata.submittedAt) >= today).length,
      submissionsThisWeek: submissions.filter(s => new Date(s.metadata.submittedAt) >= weekAgo).length,
      submissionsThisMonth: submissions.filter(s => new Date(s.metadata.submittedAt) >= monthAgo).length,
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

  // Individual schema export/import functions
  static exportSchema(schemaId: string): string {
    const schemas = storage.getSchemas();
    const schema = schemas.find(s => s.id === schemaId);

    if (!schema) {
      throw new Error('Schema not found');
    }

    const exportData = {
      schema,
      exportedAt: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        type: 'single-schema',
        schemaId: schema.id,
        schemaTitle: schema.title
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async importSchema(jsonData: string, options: {
    overwrite?: boolean;
    generateNewId?: boolean;
    renameIfExists?: boolean;
  } = {}): Promise<{ success: boolean; errors: string[]; importedSchema?: FormSchema }> {
    const result = {
      success: false,
      errors: [] as string[],
      importedSchema: undefined as FormSchema | undefined
    };

    try {
      const data = JSON.parse(jsonData);

      // Validate import data structure
      if (!data.schema) {
        result.errors.push('Invalid import file: no schema data found');
        return result;
      }

      let schemaToImport = data.schema;

      // Validate schema structure
      const validation = this.validateSchema(schemaToImport);
      if (!validation.isValid) {
        result.errors.push(`Invalid schema: ${validation.errors.join(', ')}`);
        return result;
      }

      const existingSchemas = storage.getSchemas();
      const existingSchema = existingSchemas.find(s => s.id === schemaToImport.id);

      if (existingSchema) {
        if (options.overwrite) {
          // Replace existing schema
          const updatedSchemas = existingSchemas.map(s =>
            s.id === schemaToImport.id ? schemaToImport : s
          );
          storage.saveSchemas(updatedSchemas);
          result.importedSchema = schemaToImport;
        } else if (options.generateNewId) {
          // Generate new ID and import as new schema
          schemaToImport = {
            ...schemaToImport,
            id: `${schemaToImport.id}-${Date.now()}`,
            metadata: {
              ...schemaToImport.metadata,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          };
          storage.saveSchemas([...existingSchemas, schemaToImport]);
          result.importedSchema = schemaToImport;
        } else if (options.renameIfExists) {
          // Rename and import as new schema
          let counter = 1;
          let newTitle = `${schemaToImport.title} (Copy)`;

          while (existingSchemas.some(s => s.title === newTitle)) {
            counter++;
            newTitle = `${schemaToImport.title} (Copy ${counter})`;
          }

          schemaToImport = {
            ...schemaToImport,
            id: `${schemaToImport.id}-copy-${Date.now()}`,
            title: newTitle,
            metadata: {
              ...schemaToImport.metadata,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          };
          storage.saveSchemas([...existingSchemas, schemaToImport]);
          result.importedSchema = schemaToImport;
        } else {
          result.errors.push(`Schema with ID "${schemaToImport.id}" already exists. Choose overwrite or generate new ID option.`);
          return result;
        }
      } else {
        // Import new schema
        storage.saveSchemas([...existingSchemas, schemaToImport]);
        result.importedSchema = schemaToImport;
      }

      result.success = true;
      return result;

    } catch (error) {
      result.errors.push(`Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  static exportSchemas(schemaIds: string[]): string {
    const schemas = storage.getSchemas();
    const selectedSchemas = schemas.filter(s => schemaIds.includes(s.id));

    if (selectedSchemas.length === 0) {
      throw new Error('No schemas found with the provided IDs');
    }

    const exportData = {
      schemas: selectedSchemas,
      exportedAt: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        type: 'multiple-schemas',
        totalSchemas: selectedSchemas.length,
        schemaIds: schemaIds
      }
    };

    return JSON.stringify(exportData, null, 2);
  }
}
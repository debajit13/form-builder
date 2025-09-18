import type { FormData } from '../types/form';
import type { FormSubmission } from '../types/schema';
import type { FormSchema } from '../types/schema';

const FORMS_KEY = 'dynamic-forms';
const SUBMISSIONS_KEY = 'form-submissions';
const SCHEMAS_KEY = 'form-schemas';

interface StorageError {
  type: 'quota_exceeded' | 'parse_error' | 'access_denied' | 'unknown';
  message: string;
  originalError?: Error;
}

class StorageManager {
  private handleError(operation: string, error: unknown): StorageError {
    let errorType: StorageError['type'] = 'unknown';
    let message = `Failed to ${operation}`;

    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        errorType = 'quota_exceeded';
        message = 'Storage quota exceeded. Please clear some data.';
      } else if (error.name === 'SyntaxError') {
        errorType = 'parse_error';
        message = 'Data corruption detected. Storage will be reset.';
      } else if (error.message.includes('denied')) {
        errorType = 'access_denied';
        message = 'Storage access denied. Please check browser settings.';
      }
    }

    console.error(`Storage error (${operation}):`, error);
    return { type: errorType, message, originalError: error as Error };
  }

  private safeGetItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      throw this.handleError(`read ${key}`, error);
    }
  }

  private safeSetItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw this.handleError(`write ${key}`, error);
    }
  }

  private safeParseJSON<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw this.handleError('parse JSON', error);
    }
  }

  // Legacy form data methods (for backward compatibility)
  getForms(): FormData[] {
    try {
      const data = this.safeGetItem(FORMS_KEY);
      return data ? this.safeParseJSON<FormData[]>(data) : [];
    } catch (error) {
      console.error('Error loading forms:', error);
      return [];
    }
  }

  saveForm(form: FormData): void {
    try {
      const forms = this.getForms();
      const existingIndex = forms.findIndex(f => f.id === form.id);

      if (existingIndex >= 0) {
        forms[existingIndex] = form;
      } else {
        forms.push(form);
      }

      this.safeSetItem(FORMS_KEY, JSON.stringify(forms));
    } catch (error) {
      throw this.handleError('save form', error);
    }
  }

  deleteForm(formId: string): void {
    try {
      const forms = this.getForms().filter(f => f.id !== formId);
      this.safeSetItem(FORMS_KEY, JSON.stringify(forms));
    } catch (error) {
      throw this.handleError('delete form', error);
    }
  }

  getFormById(id: string): FormData | undefined {
    return this.getForms().find(form => form.id === id);
  }

  // Schema management methods
  getSchemas(): FormSchema[] {
    try {
      const data = this.safeGetItem(SCHEMAS_KEY);
      return data ? this.safeParseJSON<FormSchema[]>(data) : [];
    } catch (error) {
      console.error('Error loading schemas:', error);
      return [];
    }
  }

  saveSchemas(schemas: FormSchema[]): void {
    try {
      this.safeSetItem(SCHEMAS_KEY, JSON.stringify(schemas));
    } catch (error) {
      throw this.handleError('save schemas', error);
    }
  }

  getSchemaById(id: string): FormSchema | undefined {
    return this.getSchemas().find(schema => schema.id === id);
  }

  saveSchema(schema: FormSchema): void {
    try {
      if (!schema || !schema.id) {
        throw new Error('Invalid schema: Schema must have an id');
      }

      const schemas = this.getSchemas();
      const existingIndex = schemas.findIndex(s => s.id === schema.id);

      if (existingIndex >= 0) {
        // Update existing schema
        schemas[existingIndex] = schema;
      } else {
        // Add new schema
        schemas.push(schema);
      }

      this.saveSchemas(schemas);
    } catch (error) {
      throw this.handleError('save schema', error);
    }
  }

  deleteSchema(id: string): void {
    try {
      const schemas = this.getSchemas().filter(s => s.id !== id);
      this.saveSchemas(schemas);
    } catch (error) {
      throw this.handleError('delete schema', error);
    }
  }

  // Form submission methods
  getSubmissions(formId?: string): FormSubmission[] {
    try {
      const data = this.safeGetItem(SUBMISSIONS_KEY);
      const submissions = data ? this.safeParseJSON<FormSubmission[]>(data) : [];
      return formId ? submissions.filter((s: FormSubmission) => s.formId === formId) : submissions;
    } catch (error) {
      console.error('Error loading submissions:', error);
      return [];
    }
  }

  saveSubmission(submission: FormSubmission): void {
    try {
      const submissions = this.getSubmissions();
      submissions.push(submission);
      this.safeSetItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (error) {
      throw this.handleError('save submission', error);
    }
  }

  saveSubmissions(submissions: FormSubmission[]): void {
    try {
      this.safeSetItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (error) {
      throw this.handleError('save submissions', error);
    }
  }

  deleteSubmission(submissionId: string): void {
    try {
      const submissions = this.getSubmissions().filter(s => s.id !== submissionId);
      this.safeSetItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (error) {
      throw this.handleError('delete submission', error);
    }
  }

  getSubmissionById(id: string): FormSubmission | undefined {
    return this.getSubmissions().find(submission => submission.id === id);
  }

  getSubmissionsByDateRange(formId: string, startDate: Date, endDate: Date): FormSubmission[] {
    return this.getSubmissions(formId).filter(submission => {
      const submissionWithMetadata = submission as FormSubmission & {
        metadata?: { submittedAt?: string };
        submittedAt?: string;
      };
      const submittedAt = new Date(submissionWithMetadata.metadata?.submittedAt || submissionWithMetadata.submittedAt || '');
      return submittedAt >= startDate && submittedAt <= endDate;
    });
  }

  // Utility methods
  clearAll(): void {
    try {
      localStorage.removeItem(FORMS_KEY);
      localStorage.removeItem(SCHEMAS_KEY);
      localStorage.removeItem(SUBMISSIONS_KEY);
    } catch (error) {
      throw this.handleError('clear all data', error);
    }
  }

  getStorageInfo() {
    try {
      const schemas = this.getSchemas();
      const submissions = this.getSubmissions();
      const forms = this.getForms();

      return {
        schemas: {
          count: schemas.length,
          size: this.getStorageSize(SCHEMAS_KEY)
        },
        submissions: {
          count: submissions.length,
          size: this.getStorageSize(SUBMISSIONS_KEY)
        },
        forms: {
          count: forms.length,
          size: this.getStorageSize(FORMS_KEY)
        },
        total: this.getTotalStorageSize()
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  private getStorageSize(key: string): number {
    try {
      const data = localStorage.getItem(key);
      return data ? new Blob([data]).size : 0;
    } catch {
      return 0;
    }
  }

  private getTotalStorageSize(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }

  // Export/Import functionality
  exportData() {
    try {
      return {
        schemas: this.getSchemas(),
        submissions: this.getSubmissions(),
        forms: this.getForms(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      throw this.handleError('export data', error);
    }
  }

  importData(data: unknown): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      if (typeof data === 'object' && data !== null && 'schemas' in data && Array.isArray((data as { schemas: unknown }).schemas)) {
        this.safeSetItem(SCHEMAS_KEY, JSON.stringify((data as { schemas: unknown }).schemas));
      }
    } catch {
      errors.push('Failed to import schemas');
    }

    try {
      if (typeof data === 'object' && data !== null && 'submissions' in data && Array.isArray((data as { submissions: unknown }).submissions)) {
        this.safeSetItem(SUBMISSIONS_KEY, JSON.stringify((data as { submissions: unknown }).submissions));
      }
    } catch {
      errors.push('Failed to import submissions');
    }

    try {
      if (typeof data === 'object' && data !== null && 'forms' in data && Array.isArray((data as { forms: unknown }).forms)) {
        this.safeSetItem(FORMS_KEY, JSON.stringify((data as { forms: unknown }).forms));
      }
    } catch {
      errors.push('Failed to import forms');
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}

export const storage = new StorageManager();
// Legacy types - kept for backward compatibility
// Use types from schema.ts for new implementations

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormData {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  createdAt: Date;
  updatedAt: Date;
}

// Legacy FormSubmission - deprecated, use FormSubmission from schema.ts
export interface LegacyFormSubmission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: Date;
}

// Re-export new schema types for convenience
export type {
  FormSchema,
  FieldSchema,
  FormSection,
  FormSettings,
  FormMetadata,
  FieldType,
  ValidationError,
  FormSubmissionData,
  FormSubmission
} from './schema';
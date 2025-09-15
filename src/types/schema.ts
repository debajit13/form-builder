export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'checkbox' | 'radio';

export interface BaseValidationRule {
  required?: boolean;
  message?: string;
}

export interface StringValidationRule extends BaseValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'email' | 'url' | 'phone';
}

export interface NumberValidationRule extends BaseValidationRule {
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}

export interface DateValidationRule extends BaseValidationRule {
  minDate?: string;
  maxDate?: string;
  format?: 'date' | 'datetime-local' | 'time';
}

export interface SelectValidationRule extends BaseValidationRule {
  minItems?: number;
  maxItems?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BaseFieldSchema {
  id: string;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  order?: number;
  conditional?: ConditionalRule;
}

export interface TextFieldSchema extends BaseFieldSchema {
  type: 'text' | 'email' | 'textarea';
  validation?: StringValidationRule;
  multiline?: boolean;
  rows?: number;
}

export interface NumberFieldSchema extends BaseFieldSchema {
  type: 'number';
  validation?: NumberValidationRule;
  unit?: string;
  prefix?: string;
  suffix?: string;
}

export interface DateFieldSchema extends BaseFieldSchema {
  type: 'date';
  validation?: DateValidationRule;
  showTime?: boolean;
}

export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select' | 'radio';
  validation?: SelectValidationRule;
  options: SelectOption[];
  multiple?: boolean;
}

export interface CheckboxFieldSchema extends BaseFieldSchema {
  type: 'checkbox';
  validation?: BaseValidationRule;
  options?: SelectOption[];
}

export type FieldSchema =
  | TextFieldSchema
  | NumberFieldSchema
  | DateFieldSchema
  | SelectFieldSchema
  | CheckboxFieldSchema;

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  logic?: 'and' | 'or';
  rules?: ConditionalRule[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
  collapsible?: boolean;
  collapsed?: boolean;
  conditional?: ConditionalRule;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  version: string;
  sections: FormSection[];
  settings: FormSettings;
  metadata: FormMetadata;
}

export interface FormSettings {
  allowDrafts?: boolean;
  requireAuth?: boolean;
  multiStep?: boolean;
  showProgress?: boolean;
  submitButtonText?: string;
  resetButtonText?: string;
  theme?: FormTheme;
  notifications?: NotificationSettings;
}

export interface FormTheme {
  primaryColor?: string;
  secondaryColor?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  spacing?: 'compact' | 'normal' | 'relaxed';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';
}

export interface NotificationSettings {
  email?: {
    enabled: boolean;
    recipients: string[];
    subject?: string;
    template?: string;
  };
  webhook?: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
  };
}

export interface FormMetadata {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  version: string;
  tags?: string[];
  category?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'min' | 'max' | 'pattern' | 'custom';
}

export interface FormSubmissionData {
  [fieldName: string]: any;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: FormSubmissionData;
  metadata: {
    submittedAt: string;
    userAgent?: string;
    ipAddress?: string;
    duration?: number;
  };
  status: 'complete' | 'draft' | 'invalid';
  validationErrors?: ValidationError[];
}
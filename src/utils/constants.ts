/**
 * Application constants following DRY principle
 */

// Form field types
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DATE: 'date',
  TIME: 'time',
  FILE: 'file',
  URL: 'url',
  TEL: 'tel',
} as const;

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type ThemeType = typeof THEMES[keyof typeof THEMES];

// Form validation rules
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  MIN: 'min',
  MAX: 'max',
  CUSTOM: 'custom',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  FORM_SCHEMAS: 'form-schemas',
  FORM_SUBMISSIONS: 'form-submissions',
  THEME: 'theme',
  USER_PREFERENCES: 'user-preferences',
} as const;

// UI constants
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
} as const;

export const Z_INDEX = {
  DROPDOWN: 10,
  MODAL: 20,
  TOAST: 30,
  TOOLTIP: 40,
} as const;

// Form constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must not exceed ${max} characters`,
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  FILE_TOO_LARGE: 'File size must not exceed 10MB',
  INVALID_FILE_TYPE: 'File type not supported',
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
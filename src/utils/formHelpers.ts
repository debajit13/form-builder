/**
 * Form utility functions following DRY and SOLID principles
 */

import { VALIDATION_MESSAGES } from './constants';

/**
 * Error message extraction utility
 * Follows Single Responsibility Principle
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return VALIDATION_MESSAGES.REQUIRED;

  // Direct string
  if (typeof error === 'string') {
    return error;
  }

  // Standard React Hook Form error with string message
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  // Handle complex error objects where message is nested
  if (error.message && typeof error.message === 'object') {
    // React Hook Form + Zod can create nested message structures
    if (error.message.message && typeof error.message.message === 'string') {
      return error.message.message;
    }

    // Sometimes the message is in a different property
    if (error.message.text && typeof error.message.text === 'string') {
      return error.message.text;
    }

    // Zod error array structure
    if (Array.isArray(error.message) && error.message.length > 0) {
      const firstIssue = error.message[0];
      if (firstIssue && typeof firstIssue.message === 'string') {
        return firstIssue.message;
      }
    }
  }

  // Fallback for unknown error structures
  if (error.type) {
    const typeToMessageMap: Record<string, string> = {
      required: VALIDATION_MESSAGES.REQUIRED,
      email: VALIDATION_MESSAGES.INVALID_EMAIL,
      pattern: 'Please enter a valid format',
      minLength: 'Input is too short',
      maxLength: 'Input is too long',
      min: 'Value is too small',
      max: 'Value is too large',
    };

    return typeToMessageMap[error.type] || 'Invalid value';
  }

  return 'Invalid value';
};

/**
 * Generate unique ID utility
 */
export const generateId = (prefix: string = 'item'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce utility for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Deep clone utility
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/**
 * Class name utility for conditional styling
 */
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Format date utility
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Validate email utility
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL utility
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * File size formatter utility
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text utility
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate color from string (for avatars, etc.)
 */
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};
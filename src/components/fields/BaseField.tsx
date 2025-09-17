/**
 * Base field component following SOLID principles
 * Provides common field structure and styling
 */

import React from 'react';
import { classNames } from '../../utils/formHelpers';

export interface BaseFieldProps {
  id: string;
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function BaseField({
  id,
  name,
  label,
  description,
  required = false,
  disabled = false,
  error,
  className,
  children,
}: BaseFieldProps) {
  const fieldClassName = classNames(
    'space-y-2',
    disabled && 'opacity-50 pointer-events-none',
    className
  );

  return (
    <div className={fieldClassName}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {children}

      {error && (
        <p className="flex items-center text-sm text-red-600 dark:text-red-400">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
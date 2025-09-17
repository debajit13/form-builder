import { useMemo } from 'react';
import type { FieldSchema, ValidationError } from '../types/schema';
import { SchemaValidator } from '../utils/validation';

interface ValidationDisplayProps {
  field: FieldSchema;
  error?: ValidationError | null;
  status?: 'idle' | 'validating' | 'valid' | 'error';
  showRules?: boolean;
  showSuccess?: boolean;
  compact?: boolean;
  className?: string;
}

export function ValidationDisplay({
  field,
  error,
  status = 'idle',
  showRules = false,
  showSuccess = true,
  compact = false,
  className = '',
}: ValidationDisplayProps) {
  const validationRules = useMemo(() =>
    SchemaValidator.getValidationRules(field),
    [field]
  );

  const getStatusIcon = () => {
    switch (status) {
      case 'validating':
        return (
          <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case 'valid':
        return showSuccess ? (
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : null;
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'validating':
        return 'text-blue-600 dark:text-blue-400';
      case 'valid':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'validating':
        return 'border-blue-300';
      case 'valid':
        return 'border-green-300';
      case 'error':
        return 'border-red-300';
      default:
        return 'border-gray-300';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {getStatusIcon()}
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">{error.message}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              {error.message}
            </p>
            {error.type && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Error type: {error.type}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'valid' && !error && showSuccess && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <p className="text-sm text-green-800 dark:text-green-300">
            Valid input
          </p>
        </div>
      )}

      {/* Validating State */}
      {status === 'validating' && (
        <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Validating...
          </p>
        </div>
      )}

      {/* Validation Rules */}
      {showRules && validationRules.length > 0 && (
        <div className="mt-2">
          <details className="group">
            <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none">
              <span className="inline-flex items-center">
                <svg
                  className="w-3 h-3 mr-1 transition-transform group-open:rotate-90"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Validation Rules
              </span>
            </summary>
            <div className="mt-2 ml-4 space-y-1">
              {validationRules.map((rule, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{rule}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

interface FieldValidationIndicatorProps {
  status: 'idle' | 'validating' | 'valid' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FieldValidationIndicator({
  status,
  size = 'md',
  className = ''
}: FieldValidationIndicatorProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const iconSize = sizeClasses[size];

  switch (status) {
    case 'validating':
      return (
        <div className={`${iconSize} ${className}`}>
          <svg className="animate-spin h-full w-full text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      );
    case 'valid':
      return (
        <svg className={`${iconSize} text-green-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'error':
      return (
        <svg className={`${iconSize} text-red-500 ${className}`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  className?: string;
  title?: string;
  maxDisplay?: number;
}

export function ValidationSummary({
  errors,
  className = '',
  title = 'Validation Errors',
  maxDisplay = 5
}: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  const displayErrors = errors.slice(0, maxDisplay);
  const hasMore = errors.length > maxDisplay;

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
            {title} ({errors.length})
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-400">
            <ul className="list-disc space-y-1 pl-5">
              {displayErrors.map((error, index) => (
                <li key={`${error.field}-${index}`}>
                  <span className="font-medium">{error.field}:</span> {error.message}
                </li>
              ))}
              {hasMore && (
                <li className="text-red-600 dark:text-red-400 font-medium">
                  ... and {errors.length - maxDisplay} more errors
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
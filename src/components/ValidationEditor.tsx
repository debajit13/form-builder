import { useState } from 'react';
import type {
  FieldSchema,
  StringValidationRule,
  NumberValidationRule,
  DateValidationRule,
  SelectValidationRule,
  BaseValidationRule
} from '../types/schema';

interface ValidationEditorProps {
  field: FieldSchema;
  onChange: (updates: Partial<FieldSchema>) => void;
}

export function ValidationEditor({ field, onChange }: ValidationEditorProps) {
  const [showValidation, setShowValidation] = useState(false);

  const updateValidation = (updates: any) => {
    const currentValidation = field.validation || {};
    onChange({
      validation: {
        ...currentValidation,
        ...updates
      }
    });
  };

  const renderStringValidation = () => {
    const validation = field.validation as StringValidationRule;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Length
            </label>
            <input
              type="number"
              value={validation?.minLength || ''}
              onChange={(e) => updateValidation({
                minLength: e.target.value ? parseInt(e.target.value) : undefined
              })}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Length
            </label>
            <input
              type="number"
              value={validation?.maxLength || ''}
              onChange={(e) => updateValidation({
                maxLength: e.target.value ? parseInt(e.target.value) : undefined
              })}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="255"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pattern (RegEx)
          </label>
          <input
            type="text"
            value={validation?.pattern || ''}
            onChange={(e) => updateValidation({ pattern: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="^[A-Za-z]+$"
          />
          <p className="text-xs text-gray-500 mt-1">
            Regular expression pattern for validation
          </p>
        </div>

        {field.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={validation?.format || ''}
              onChange={(e) => updateValidation({
                format: e.target.value || undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No specific format</option>
              <option value="email">Email</option>
              <option value="url">URL</option>
              <option value="phone">Phone Number</option>
            </select>
          </div>
        )}
      </div>
    );
  };

  const renderNumberValidation = () => {
    const validation = field.validation as NumberValidationRule;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Value
            </label>
            <input
              type="number"
              value={validation?.min ?? ''}
              onChange={(e) => updateValidation({
                min: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Value
            </label>
            <input
              type="number"
              value={validation?.max ?? ''}
              onChange={(e) => updateValidation({
                max: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step
          </label>
          <input
            type="number"
            value={validation?.step ?? ''}
            onChange={(e) => updateValidation({
              step: e.target.value ? parseFloat(e.target.value) : undefined
            })}
            min={0}
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Increment/decrement step value
          </p>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={validation?.integer || false}
              onChange={(e) => updateValidation({ integer: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Must be an integer (whole number)</span>
          </label>
        </div>
      </div>
    );
  };

  const renderDateValidation = () => {
    const validation = field.validation as DateValidationRule;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Date
            </label>
            <input
              type="date"
              value={validation?.minDate || ''}
              onChange={(e) => updateValidation({ minDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Date
            </label>
            <input
              type="date"
              value={validation?.maxDate || ''}
              onChange={(e) => updateValidation({ maxDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Format
          </label>
          <select
            value={validation?.format || 'date'}
            onChange={(e) => updateValidation({
              format: e.target.value as 'date' | 'datetime-local' | 'time'
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date Only</option>
            <option value="datetime-local">Date and Time</option>
            <option value="time">Time Only</option>
          </select>
        </div>
      </div>
    );
  };

  const renderSelectValidation = () => {
    const validation = field.validation as SelectValidationRule;
    const isMultiple = (field as any).multiple;

    if (!isMultiple) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Selections
            </label>
            <input
              type="number"
              value={validation?.minItems || ''}
              onChange={(e) => updateValidation({
                minItems: e.target.value ? parseInt(e.target.value) : undefined
              })}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Selections
            </label>
            <input
              type="number"
              value={validation?.maxItems || ''}
              onChange={(e) => updateValidation({
                maxItems: e.target.value ? parseInt(e.target.value) : undefined
              })}
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderValidationByType = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'textarea':
        return renderStringValidation();
      case 'number':
        return renderNumberValidation();
      case 'date':
        return renderDateValidation();
      case 'select':
        return renderSelectValidation();
      default:
        return null;
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <button
        onClick={() => setShowValidation(!showValidation)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-700">Validation Rules</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${showValidation ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showValidation && (
        <div className="mt-4 space-y-4">
          {/* Required Field */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.validation?.required || false}
                onChange={(e) => updateValidation({ required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Required Field</span>
            </label>
          </div>

          {/* Custom Error Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Error Message
            </label>
            <input
              type="text"
              value={field.validation?.message || ''}
              onChange={(e) => updateValidation({ message: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="This field is required"
            />
            <p className="text-xs text-gray-500 mt-1">
              Override the default validation error message
            </p>
          </div>

          {/* Type-specific validation */}
          {renderValidationByType()}

          {/* Validation Preview */}
          {field.validation && Object.keys(field.validation).length > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Validation Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                {field.validation.required && (
                  <div>• Field is required</div>
                )}
                {(field.validation as StringValidationRule)?.minLength && (
                  <div>• Minimum {(field.validation as StringValidationRule).minLength} characters</div>
                )}
                {(field.validation as StringValidationRule)?.maxLength && (
                  <div>• Maximum {(field.validation as StringValidationRule).maxLength} characters</div>
                )}
                {(field.validation as NumberValidationRule)?.min !== undefined && (
                  <div>• Minimum value: {(field.validation as NumberValidationRule).min}</div>
                )}
                {(field.validation as NumberValidationRule)?.max !== undefined && (
                  <div>• Maximum value: {(field.validation as NumberValidationRule).max}</div>
                )}
                {(field.validation as StringValidationRule)?.pattern && (
                  <div>• Must match pattern: {(field.validation as StringValidationRule).pattern}</div>
                )}
                {(field.validation as StringValidationRule)?.format && (
                  <div>• Must be valid {(field.validation as StringValidationRule).format}</div>
                )}
                {(field.validation as NumberValidationRule)?.integer && (
                  <div>• Must be a whole number</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
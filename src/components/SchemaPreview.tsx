import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormSchema, FieldSchema, SelectOption } from '../types/schema';
import { SchemaValidator } from '../utils/validation';

// Helper function to extract error message from React Hook Form errors
function getErrorMessage(error: any): string {
  if (!error) return 'This field has an error';

  // React Hook Form error can be:
  // 1. { message: string, type: string, ... }
  // 2. { message: { message: string }, type: string, ... }
  // 3. String directly

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

  // Try alternative properties
  if (error.text && typeof error.text === 'string') return error.text;
  if (error.error && typeof error.error === 'string') return error.error;

  // Generate message based on error type
  if (error.type) {
    switch (error.type) {
      case 'required':
        return 'This field is required';
      case 'min':
        return 'Value is too small';
      case 'max':
        return 'Value is too large';
      case 'minLength':
        return 'Text is too short';
      case 'maxLength':
        return 'Text is too long';
      case 'pattern':
        return 'Invalid format';
      case 'email':
        return 'Invalid email address';
      default:
        return `Invalid value (${error.type})`;
    }
  }

  // Absolute fallback
  return 'This field has an error';
}

interface SchemaPreviewProps {
  schema: FormSchema;
  onSubmit?: (data: any) => void;
}

export function SchemaPreview({ schema, onSubmit }: SchemaPreviewProps) {
  const validator = SchemaValidator.createFormValidator(schema);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(validator),
    mode: 'onBlur'
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: any) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log('Form Data:', data);
      alert('Form submitted successfully! Check console for data.');
    }
  };

  const shouldShowField = (field: FieldSchema): boolean => {
    if (field.hidden) return false;

    if (!field.conditional) return true;

    // Simple conditional logic evaluation
    const conditionField = field.conditional.field;
    const conditionValue = watchedValues[conditionField];

    switch (field.conditional.operator) {
      case 'equals':
        return conditionValue === field.conditional.value;
      case 'not_equals':
        return conditionValue !== field.conditional.value;
      case 'greater_than':
        return Number(conditionValue) > Number(field.conditional.value);
      case 'less_than':
        return Number(conditionValue) < Number(field.conditional.value);
      case 'contains':
        return String(conditionValue).includes(String(field.conditional.value));
      case 'not_contains':
        return !String(conditionValue).includes(String(field.conditional.value));
      default:
        return true;
    }
  };

  const renderField = (field: FieldSchema) => {
    if (!shouldShowField(field)) return null;

    const fieldError = errors[field.name];
    const hasError = !!fieldError;

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError
        ? 'border-red-300 focus:ring-red-500'
        : 'border-gray-300'
    } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    const renderInput = () => {
      switch (field.type) {
        case 'text':
        case 'email':
          return (
            <input
              type={field.type}
              {...register(field.name)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              readOnly={field.readonly}
              className={baseClasses}
            />
          );

        case 'number':
          const numberField = field as any;
          return (
            <div className="relative">
              {numberField.prefix && (
                <span className="absolute left-3 top-2 text-gray-500">
                  {numberField.prefix}
                </span>
              )}
              <input
                type="number"
                {...register(field.name, { valueAsNumber: true })}
                placeholder={field.placeholder}
                disabled={field.disabled}
                readOnly={field.readonly}
                min={field.validation?.min}
                max={field.validation?.max}
                step={(field.validation as any)?.step}
                className={`${baseClasses} ${
                  numberField.prefix ? 'pl-8' : ''
                } ${numberField.suffix ? 'pr-16' : ''}`}
              />
              {numberField.suffix && (
                <span className="absolute right-3 top-2 text-gray-500">
                  {numberField.suffix}
                </span>
              )}
            </div>
          );

        case 'date':
          return (
            <input
              type="date"
              {...register(field.name)}
              disabled={field.disabled}
              readOnly={field.readonly}
              className={baseClasses}
            />
          );

        case 'textarea':
          const textareaField = field as any;
          return (
            <textarea
              {...register(field.name)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              readOnly={field.readonly}
              rows={textareaField.rows || 3}
              className={baseClasses}
            />
          );

        case 'select':
          const selectField = field as any;
          if (selectField.multiple) {
            return (
              <select
                {...register(field.name)}
                multiple
                disabled={field.disabled}
                className={`${baseClasses} h-32`}
              >
                {selectField.options?.map((option: SelectOption) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

          return (
            <select
              {...register(field.name)}
              disabled={field.disabled}
              className={baseClasses}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {selectField.options?.map((option: SelectOption) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'radio':
          const radioField = field as any;
          return (
            <div className="space-y-2">
              {radioField.options?.map((option: SelectOption) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    {...register(field.name)}
                    value={option.value}
                    disabled={field.disabled || option.disabled}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className={option.disabled ? 'text-gray-400' : 'text-gray-700'}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          );

        case 'checkbox':
          const checkboxField = field as any;

          if (checkboxField.options) {
            // Multiple checkboxes
            return (
              <div className="space-y-2">
                {checkboxField.options.map((option: SelectOption) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      {...register(field.name)}
                      value={option.value}
                      disabled={field.disabled || option.disabled}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className={option.disabled ? 'text-gray-400' : 'text-gray-700'}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            );
          }

          // Single checkbox
          return (
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                {...register(field.name)}
                disabled={field.disabled}
                className="text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-gray-700">{field.label}</span>
            </label>
          );

        default:
          return (
            <input
              type="text"
              {...register((field as any).name)}
              placeholder={(field as any).placeholder}
              disabled={(field as any).disabled}
              readOnly={(field as any).readonly}
              className={baseClasses}
            />
          );
      }
    };

    return (
      <div key={field.id} className="space-y-2">
        {field.type !== 'checkbox' || (field as any).options ? (
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
        ) : null}

        {field.description && (
          <p className="text-sm text-gray-600">{field.description}</p>
        )}

        {renderInput()}

        {hasError && (
          <p className="text-sm text-red-600">
{getErrorMessage(fieldError)}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold mb-2">{schema.title}</h1>
          {schema.description && (
            <p className="text-blue-100">{schema.description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-8">
            {schema.sections.map((section) => (
              <div key={section.id} className="space-y-6">
                {/* Section Header */}
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Section Fields */}
                <div className="grid gap-6">
                  {section.fields
                    .filter(shouldShowField)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(renderField)}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              {schema.settings.resetButtonText || 'Reset'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              {schema.settings.submitButtonText || 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* Form Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Form Information</h3>
        <dl className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <dt>Fields:</dt>
            <dd>{schema.sections.reduce((total, section) => total + section.fields.length, 0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Sections:</dt>
            <dd>{schema.sections.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Version:</dt>
            <dd>{schema.version}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Status:</dt>
            <dd className="capitalize">{schema.metadata.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
import { useFormContext } from 'react-hook-form';
import type {
  FieldSchema,
  FormTheme,
  SelectOption,
  FormSubmissionData,
} from '../types/schema';
import { useRealTimeValidation } from '../hooks/useRealTimeValidation';
import { ValidationDisplay } from './ValidationDisplay';
import { extractErrorMessage, classNames } from '../utils/formHelpers';
import { FIELD_TYPES } from '../utils/constants';

interface DynamicFormFieldProps {
  field: FieldSchema;
  watchedValues: FormSubmissionData;
  theme?: FormTheme;
  showValidation?: boolean;
  showValidationRules?: boolean;
  realTimeValidation?: boolean;
}

export function DynamicFormField({
  field,
  watchedValues: _watchedValues,
  theme,
  showValidation = true,
  showValidationRules = false,
  realTimeValidation = true,
}: DynamicFormFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const { validationState, handlers } = useRealTimeValidation({
    field,
    validateOnChange: realTimeValidation,
    validateOnBlur: true,
    debounceMs: 300,
  });

  const fieldError = errors[field.name];
  const hasError = !!fieldError || !!validationState.error;

  // Base styling with theme support and validation states
  const getValidationClasses = () => {
    if (hasError) {
      return 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 shadow-sm';
    }
    if (validationState.status === 'valid' && validationState.isTouched) {
      return 'border-green-300 dark:border-green-600 focus:ring-green-500 focus:border-green-500 shadow-sm';
    }
    if (validationState.status === 'validating') {
      return 'border-blue-300 dark:border-blue-600 focus:ring-blue-500 focus:border-blue-500 shadow-sm';
    }
    return 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-gray-400 dark:hover:border-gray-500';
  };

  const baseClasses = `w-full px-3 py-2.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${getValidationClasses()} ${
    field.disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-white dark:bg-gray-800'
  } ${field.readonly ? 'bg-gray-50 dark:bg-gray-700 cursor-default' : ''} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`;

  const getThemeClasses = () => {
    const borderRadius = theme?.borderRadius || 'md';
    const radiusClass = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
    }[borderRadius];

    return radiusClass;
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            {...register(field.name)}
            id={field.name}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readonly}
            defaultValue={field.defaultValue}
            onBlur={handlers.onBlur}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize:
                theme?.fontSize === 'sm'
                  ? '0.875rem'
                  : theme?.fontSize === 'lg'
                  ? '1.125rem'
                  : '1rem',
            }}
            aria-describedby={`${field.name}-description ${field.name}-error`}
            aria-invalid={hasError}
          />
        );

      case 'number':
        const numberField = field as any;
        return (
          <div className='relative'>
            {numberField.prefix && (
              <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none'>
                {numberField.prefix}
              </span>
            )}
            <input
              id={field.name}
              type='number'
              {...register(field.name, {
                valueAsNumber: true,
                setValueAs: (value) =>
                  value === '' ? undefined : Number(value),
              })}
              placeholder={field.placeholder}
              disabled={field.disabled}
              readOnly={field.readonly}
              defaultValue={field.defaultValue}
              min={field.validation?.min}
              max={field.validation?.max}
              step={(field.validation as any)?.step || 'any'}
              onBlur={handlers.onBlur}
              className={`${baseClasses} ${getThemeClasses()} ${
                numberField.prefix ? 'pl-8' : ''
              } ${numberField.suffix ? 'pr-16' : ''}`}
              aria-describedby={`${field.name}-description ${field.name}-error`}
              aria-invalid={hasError}
              style={{
                fontSize:
                  theme?.fontSize === 'sm'
                    ? '0.875rem'
                    : theme?.fontSize === 'lg'
                    ? '1.125rem'
                    : '1rem',
              }}
            />
            {numberField.suffix && (
              <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none'>
                {numberField.suffix}
              </span>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            id={field.name}
            type='date'
            {...register(field.name)}
            disabled={field.disabled}
            readOnly={field.readonly}
            defaultValue={field.defaultValue}
            min={(field.validation as any)?.minDate}
            max={(field.validation as any)?.maxDate}
            onBlur={handlers.onBlur}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize:
                theme?.fontSize === 'sm'
                  ? '0.875rem'
                  : theme?.fontSize === 'lg'
                  ? '1.125rem'
                  : '1rem',
            }}
            aria-describedby={`${field.name}-description ${field.name}-error`}
            aria-invalid={hasError}
          />
        );

      case 'textarea':
        const textareaField = field as any;
        return (
          <textarea
            id={field.name}
            {...register(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readonly}
            defaultValue={field.defaultValue}
            rows={textareaField.rows || 3}
            onBlur={handlers.onBlur}
            className={`${baseClasses} ${getThemeClasses()} resize-vertical`}
            style={{
              fontSize:
                theme?.fontSize === 'sm'
                  ? '0.875rem'
                  : theme?.fontSize === 'lg'
                  ? '1.125rem'
                  : '1rem',
            }}
            aria-describedby={`${field.name}-description ${field.name}-error`}
            aria-invalid={hasError}
          />
        );

      case 'select':
        const selectField = field as any;

        if (selectField.multiple) {
          return (
            <select
              id={field.name}
              {...register(field.name)}
              multiple
              disabled={field.disabled}
              size={Math.min(selectField.options?.length || 5, 8)}
              onBlur={handlers.onBlur}
              className={`${baseClasses} ${getThemeClasses()}`}
              style={{
                fontSize:
                  theme?.fontSize === 'sm'
                    ? '0.875rem'
                    : theme?.fontSize === 'lg'
                    ? '1.125rem'
                    : '1rem',
                minHeight: '6rem',
              }}
              aria-describedby={`${field.name}-description ${field.name}-error`}
              aria-invalid={hasError}
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
            id={field.name}
            {...register(field.name)}
            disabled={field.disabled}
            defaultValue={field.defaultValue || ''}
            onBlur={handlers.onBlur}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize:
                theme?.fontSize === 'sm'
                  ? '0.875rem'
                  : theme?.fontSize === 'lg'
                  ? '1.125rem'
                  : '1rem',
            }}
            aria-describedby={`${field.name}-description ${field.name}-error`}
            aria-invalid={hasError}
          >
            <option value=''>{field.placeholder || 'Select an option'}</option>
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
          <div className='space-y-3'>
            {radioField.options?.map((option: SelectOption) => (
              <label
                key={option.value}
                className={`flex items-center space-x-3 cursor-pointer ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type='radio'
                  {...register(field.name)}
                  value={option.value}
                  disabled={field.disabled || option.disabled}
                  defaultChecked={field.defaultValue === option.value}
                  className='text-blue-600 focus:ring-blue-500 h-4 w-4'
                  style={{
                    accentColor: theme?.primaryColor || '#3b82f6',
                  }}
                />
                <span
                  className={`${
                    option.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  style={{
                    fontSize:
                      theme?.fontSize === 'sm'
                        ? '0.875rem'
                        : theme?.fontSize === 'lg'
                        ? '1.125rem'
                        : '1rem',
                  }}
                >
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
            <div className='space-y-3'>
              {checkboxField.options.map((option: SelectOption) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 cursor-pointer ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type='checkbox'
                    {...register(field.name)}
                    value={option.value}
                    disabled={field.disabled || option.disabled}
                    defaultChecked={
                      Array.isArray(field.defaultValue)
                        ? field.defaultValue.includes(option.value)
                        : field.defaultValue === option.value
                    }
                    className='text-blue-600 focus:ring-blue-500 h-4 w-4 rounded'
                    style={{
                      accentColor: theme?.primaryColor || '#3b82f6',
                    }}
                  />
                  <span
                    className={`${
                      option.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    style={{
                      fontSize:
                        theme?.fontSize === 'sm'
                          ? '0.875rem'
                          : theme?.fontSize === 'lg'
                          ? '1.125rem'
                          : '1rem',
                    }}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          );
        }

        // Single checkbox
        return (
          <label className='flex items-center space-x-3 cursor-pointer'>
            <input
              type='checkbox'
              {...register(field.name)}
              disabled={field.disabled}
              defaultChecked={field.defaultValue}
              className='text-blue-600 focus:ring-blue-500 h-4 w-4 rounded'
              style={{
                accentColor: theme?.primaryColor || '#3b82f6',
              }}
            />
            <span
              className='text-gray-700 dark:text-gray-300'
              style={{
                fontSize:
                  theme?.fontSize === 'sm'
                    ? '0.875rem'
                    : theme?.fontSize === 'lg'
                    ? '1.125rem'
                    : '1rem',
              }}
            >
              {field.label}
            </span>
          </label>
        );

      default:
        const defaultField = field as any;
        return (
          <input
            id={defaultField.name}
            type='text'
            {...register(defaultField.name)}
            placeholder={defaultField.placeholder}
            disabled={defaultField.disabled}
            readOnly={defaultField.readonly}
            defaultValue={defaultField.defaultValue}
            onBlur={handlers.onBlur}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize:
                theme?.fontSize === 'sm'
                  ? '0.875rem'
                  : theme?.fontSize === 'lg'
                  ? '1.125rem'
                  : '1rem',
            }}
            aria-describedby={`${defaultField.name}-description ${defaultField.name}-error`}
            aria-invalid={hasError}
          />
        );
    }
  };

  return (
    <div
      className='space-y-2'
      style={{
        marginBottom:
          theme?.spacing === 'compact'
            ? '0.75rem'
            : theme?.spacing === 'relaxed'
            ? '2rem'
            : '1.5rem',
      }}
    >
      {/* Field Label */}
      {field.type !== 'checkbox' || (field as any).options ? (
        <label
          htmlFor={field.name}
          className={`block text-sm font-medium transition-colors ${
            hasError ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {field.label}
          {field.validation?.required && (
            <span className='text-red-500 ml-0.5'>*</span>
          )}
        </label>
      ) : null}

      {/* Field Description */}
      {field.description && (
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{field.description}</p>
      )}

      {/* Field Input */}
      <div className='relative'>
        {renderField()}

        {/* Field Unit (for number fields) */}
        {field.type === 'number' && (field as any).unit && (
          <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none text-sm'>
            {(field as any).unit}
          </span>
        )}
      </div>

      {/* Validation feedback */}
      <div className='min-h-[1.25rem]'>
        {' '}
        {/* Reserve space to prevent layout shift */}
        {showValidation && (
          <>
            {fieldError && (
              <p
                id={`${field.name}-error`}
                className='text-red-600 dark:text-red-400 text-sm flex items-center mt-1'
                role='alert'
              >
                <svg
                  className='w-4 h-4 mr-1 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {extractErrorMessage(fieldError)}
              </p>
            )}

            {validationState.error && !fieldError && (
              <p
                id={`${field.name}-error`}
                className='text-red-600 dark:text-red-400 text-sm flex items-center mt-1'
                role='alert'
              >
                <svg
                  className='w-4 h-4 mr-1 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {extractErrorMessage(validationState.error)}
              </p>
            )}

            {validationState.status === 'valid' &&
              validationState.isTouched &&
              !hasError && (
                <p className='text-green-600 dark:text-green-400 text-sm flex items-center mt-1'>
                  <svg
                    className='w-4 h-4 mr-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Valid
                </p>
              )}

            {validationState.status === 'validating' && (
              <p className='text-blue-600 dark:text-blue-400 text-sm flex items-center mt-1'>
                <svg
                  className='w-4 h-4 mr-1 flex-shrink-0 animate-spin'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Validating...
              </p>
            )}
          </>
        )}
      </div>

      {/* Validation rules display */}
      {showValidationRules && (
        <ValidationDisplay field={field} showRules={true} className='mt-1' />
      )}

      {/* Description for screen readers */}
      <p id={`${field.name}-description`} className='sr-only'>
        {field.description || ''}
      </p>
    </div>
  );
}

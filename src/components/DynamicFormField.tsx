import { useFormContext } from 'react-hook-form';
import type { FieldSchema, FormTheme, SelectOption, FormSubmissionData } from '../types/schema';

interface DynamicFormFieldProps {
  field: FieldSchema;
  watchedValues: FormSubmissionData;
  theme?: FormTheme;
}

export function DynamicFormField({ field, watchedValues, theme }: DynamicFormFieldProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch
  } = useFormContext();

  const fieldError = errors[field.name];
  const hasError = !!fieldError;
  const fieldValue = watch(field.name);

  // Base styling with theme support
  const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${
    field.readonly ? 'bg-gray-50' : ''
  }`;

  const getThemeClasses = () => {
    const borderRadius = theme?.borderRadius || 'md';
    const radiusClass = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg'
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
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readonly}
            defaultValue={field.defaultValue}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
            }}
          />
        );

      case 'number':
        const numberField = field as any;
        return (
          <div className="relative">
            {numberField.prefix && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                {numberField.prefix}
              </span>
            )}
            <input
              type="number"
              {...register(field.name, {
                valueAsNumber: true,
                setValueAs: (value) => value === '' ? undefined : Number(value)
              })}
              placeholder={field.placeholder}
              disabled={field.disabled}
              readOnly={field.readonly}
              defaultValue={field.defaultValue}
              min={field.validation?.min}
              max={field.validation?.max}
              step={(field.validation as any)?.step || 'any'}
              className={`${baseClasses} ${getThemeClasses()} ${
                numberField.prefix ? 'pl-8' : ''
              } ${numberField.suffix ? 'pr-16' : ''}`}
              style={{
                fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
              }}
            />
            {numberField.suffix && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
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
            defaultValue={field.defaultValue}
            min={(field.validation as any)?.minDate}
            max={(field.validation as any)?.maxDate}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
            }}
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
            defaultValue={field.defaultValue}
            rows={textareaField.rows || 3}
            className={`${baseClasses} ${getThemeClasses()} resize-vertical`}
            style={{
              fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
            }}
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
              size={Math.min(selectField.options?.length || 5, 8)}
              className={`${baseClasses} ${getThemeClasses()}`}
              style={{
                fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem',
                minHeight: '6rem'
              }}
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
            defaultValue={field.defaultValue || ''}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
            }}
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
          <div className="space-y-3">
            {radioField.options?.map((option: SelectOption) => (
              <label
                key={option.value}
                className={`flex items-center space-x-3 cursor-pointer ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <input
                  type="radio"
                  {...register(field.name)}
                  value={option.value}
                  disabled={field.disabled || option.disabled}
                  defaultChecked={field.defaultValue === option.value}
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  style={{
                    accentColor: theme?.primaryColor || '#3b82f6'
                  }}
                />
                <span
                  className={`${option.disabled ? 'text-gray-400' : 'text-gray-700'}`}
                  style={{
                    fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
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
            <div className="space-y-3">
              {checkboxField.options.map((option: SelectOption) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 cursor-pointer ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    {...register(field.name)}
                    value={option.value}
                    disabled={field.disabled || option.disabled}
                    defaultChecked={
                      Array.isArray(field.defaultValue)
                        ? field.defaultValue.includes(option.value)
                        : field.defaultValue === option.value
                    }
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4 rounded"
                    style={{
                      accentColor: theme?.primaryColor || '#3b82f6'
                    }}
                  />
                  <span
                    className={`${option.disabled ? 'text-gray-400' : 'text-gray-700'}`}
                    style={{
                      fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
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
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register(field.name)}
              disabled={field.disabled}
              defaultChecked={field.defaultValue}
              className="text-blue-600 focus:ring-blue-500 h-4 w-4 rounded"
              style={{
                accentColor: theme?.primaryColor || '#3b82f6'
              }}
            />
            <span
              className="text-gray-700"
              style={{
                fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
              }}
            >
              {field.label}
            </span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            {...register(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            readOnly={field.readonly}
            defaultValue={field.defaultValue}
            className={`${baseClasses} ${getThemeClasses()}`}
            style={{
              fontSize: theme?.fontSize === 'sm' ? '0.875rem' : theme?.fontSize === 'lg' ? '1.125rem' : '1rem'
            }}
          />
        );
    }
  };

  return (
    <div
      className="space-y-2"
      style={{
        marginBottom: theme?.spacing === 'compact' ? '0.75rem' : theme?.spacing === 'relaxed' ? '2rem' : '1.5rem'
      }}
    >
      {/* Field Label */}
      {field.type !== 'checkbox' || (field as any).options ? (
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      ) : null}

      {/* Field Description */}
      {field.description && (
        <p className="text-sm text-gray-600">{field.description}</p>
      )}

      {/* Field Input */}
      <div className="relative">
        {renderField()}

        {/* Field Unit (for number fields) */}
        {field.type === 'number' && (field as any).unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none text-sm">
            {(field as any).unit}
          </span>
        )}
      </div>

      {/* Field Error */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {fieldError?.message?.toString() || 'This field has an error'}
        </p>
      )}

      {/* Field Help Text */}
      {!hasError && field.validation?.message && (
        <p className="text-xs text-gray-500">{field.validation.message}</p>
      )}
    </div>
  );
}
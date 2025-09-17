/**
 * Select field component following Single Responsibility Principle
 */

import React, { forwardRef } from 'react';
import { classNames } from '../../utils/formHelpers';
import { BaseField, type BaseFieldProps } from './BaseField';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<BaseFieldProps, 'children'> {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  multiple?: boolean;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      id,
      name,
      label,
      description,
      required,
      disabled,
      error,
      className,
      options,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      multiple,
      ...rest
    },
    ref
  ) => {
    const selectClassName = classNames(
      'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm',
      'focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
      'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500',
      error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
      'sm:text-sm'
    );

    return (
      <BaseField
        id={id}
        name={name}
        label={label}
        description={description}
        required={required}
        disabled={disabled}
        error={error}
        className={className}
      >
        <select
          ref={ref}
          id={id}
          name={name}
          className={selectClassName}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          multiple={multiple}
          {...rest}
        >
          {placeholder && !multiple && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </BaseField>
    );
  }
);

SelectField.displayName = 'SelectField';
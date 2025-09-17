/**
 * Text field component following Single Responsibility Principle
 */

import React, { forwardRef } from 'react';
import { classNames } from '../../utils/formHelpers';
import { BaseField, type BaseFieldProps } from './BaseField';

export interface TextFieldProps extends Omit<BaseFieldProps, 'children'> {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  readOnly?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
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
      type = 'text',
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      autoComplete,
      maxLength,
      minLength,
      pattern,
      readOnly,
      ...rest
    },
    ref
  ) => {
    const inputClassName = classNames(
      'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm',
      'focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400',
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
      'placeholder-gray-400 dark:placeholder-gray-500',
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
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          className={inputClassName}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          readOnly={readOnly}
          {...rest}
        />
      </BaseField>
    );
  }
);

TextField.displayName = 'TextField';
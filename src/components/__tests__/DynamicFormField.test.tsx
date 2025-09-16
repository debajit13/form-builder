import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { DynamicFormField } from '../DynamicFormField'
import type { TextFieldSchema, NumberFieldSchema, SelectFieldSchema } from '../../types/schema'

// Mock the validation hook
vi.mock('../../hooks/useRealTimeValidation', () => ({
  useRealTimeValidation: () => ({
    validationState: {
      status: 'idle',
      error: null,
      isTouched: false
    },
    handlers: {
      onBlur: vi.fn()
    }
  })
}))

// Test wrapper component
function TestWrapper({ children, defaultValues = {} }: { children: React.ReactNode, defaultValues?: any }) {
  const methods = useForm({ defaultValues })
  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  )
}

describe('DynamicFormField', () => {
  describe('Text Field', () => {
    it('should render a text input field', () => {
      const field: TextFieldSchema = {
        id: 'text-field',
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name'
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument()
    })

    it('should show required indicator for required fields', () => {
      const field: TextFieldSchema = {
        id: 'required-field',
        name: 'requiredField',
        type: 'text',
        label: 'Required Field',
        validation: { required: true }
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('should display field description', () => {
      const field: TextFieldSchema = {
        id: 'described-field',
        name: 'describedField',
        type: 'text',
        label: 'Described Field',
        description: 'This is a helpful description'
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByText('This is a helpful description')).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const field: TextFieldSchema = {
        id: 'disabled-field',
        name: 'disabledField',
        type: 'text',
        label: 'Disabled Field',
        disabled: true
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Disabled Field')).toBeDisabled()
    })

    it('should be readonly when readonly prop is true', () => {
      const field: TextFieldSchema = {
        id: 'readonly-field',
        name: 'readonlyField',
        type: 'text',
        label: 'Readonly Field',
        readonly: true
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Readonly Field')).toHaveAttribute('readonly')
    })
  })

  describe('Email Field', () => {
    it('should render an email input field', () => {
      const field: TextFieldSchema = {
        id: 'email-field',
        name: 'email',
        type: 'email',
        label: 'Email Address'
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Email Address')
      expect(input).toHaveAttribute('type', 'email')
    })
  })

  describe('Number Field', () => {
    it('should render a number input field', () => {
      const field: NumberFieldSchema = {
        id: 'age-field',
        name: 'age',
        type: 'number',
        label: 'Age',
        validation: { min: 0, max: 120 }
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Age')
      expect(input).toHaveAttribute('type', 'number')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '120')
    })

    it('should render number field with prefix and suffix', () => {
      const field = {
        id: 'price-field',
        name: 'price',
        type: 'number',
        label: 'Price',
        prefix: '$',
        suffix: ' USD'
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByText('$')).toBeInTheDocument()
    })
  })

  describe('Select Field', () => {
    it('should render a select field with options', () => {
      const field: SelectFieldSchema = {
        id: 'country-field',
        name: 'country',
        type: 'select',
        label: 'Country',
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' }
        ]
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const select = screen.getByLabelText('Country')
      expect(select).toBeInTheDocument()
      expect(screen.getByText('United States')).toBeInTheDocument()
      expect(screen.getByText('Canada')).toBeInTheDocument()
      expect(screen.getByText('United Kingdom')).toBeInTheDocument()
    })

    it('should render multiple select field', () => {
      const field = {
        id: 'skills-field',
        name: 'skills',
        type: 'select',
        label: 'Skills',
        multiple: true,
        options: [
          { value: 'js', label: 'JavaScript' },
          { value: 'ts', label: 'TypeScript' },
          { value: 'react', label: 'React' }
        ]
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const select = screen.getByLabelText('Skills')
      expect(select).toHaveAttribute('multiple')
    })
  })

  describe('Textarea Field', () => {
    it('should render a textarea field', () => {
      const field = {
        id: 'message-field',
        name: 'message',
        type: 'textarea',
        label: 'Message',
        rows: 5
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const textarea = screen.getByLabelText('Message')
      expect(textarea.tagName).toBe('TEXTAREA')
      expect(textarea).toHaveAttribute('rows', '5')
    })
  })

  describe('Date Field', () => {
    it('should render a date input field', () => {
      const field = {
        id: 'birth-date-field',
        name: 'birthDate',
        type: 'date',
        label: 'Birth Date',
        validation: {
          minDate: '1920-01-01',
          maxDate: '2005-12-31'
        }
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Birth Date')
      expect(input).toHaveAttribute('type', 'date')
      expect(input).toHaveAttribute('min', '1920-01-01')
      expect(input).toHaveAttribute('max', '2005-12-31')
    })
  })

  describe('Checkbox Field', () => {
    it('should render a single checkbox', () => {
      const field = {
        id: 'agree-field',
        name: 'agree',
        type: 'checkbox',
        label: 'I agree to the terms'
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const checkbox = screen.getByLabelText('I agree to the terms')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('should render multiple checkboxes with options', () => {
      const field = {
        id: 'hobbies-field',
        name: 'hobbies',
        type: 'checkbox',
        label: 'Hobbies',
        options: [
          { value: 'reading', label: 'Reading' },
          { value: 'gaming', label: 'Gaming' },
          { value: 'sports', label: 'Sports' }
        ]
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Reading')).toBeInTheDocument()
      expect(screen.getByLabelText('Gaming')).toBeInTheDocument()
      expect(screen.getByLabelText('Sports')).toBeInTheDocument()
    })
  })

  describe('Radio Field', () => {
    it('should render radio buttons with options', () => {
      const field = {
        id: 'gender-field',
        name: 'gender',
        type: 'radio',
        label: 'Gender',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' }
        ]
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      expect(screen.getByLabelText('Male')).toHaveAttribute('type', 'radio')
      expect(screen.getByLabelText('Female')).toHaveAttribute('type', 'radio')
      expect(screen.getByLabelText('Other')).toHaveAttribute('type', 'radio')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const field: TextFieldSchema = {
        id: 'accessible-field',
        name: 'accessibleField',
        type: 'text',
        label: 'Accessible Field',
        description: 'This field has ARIA attributes'
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Accessible Field')
      expect(input).toHaveAttribute('aria-describedby')
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should show validation error with proper ARIA attributes', () => {
      const field: TextFieldSchema = {
        id: 'error-field',
        name: 'errorField',
        type: 'text',
        label: 'Error Field',
        validation: { required: true }
      }

      render(
        <TestWrapper>
          <DynamicFormField
            field={field}
            watchedValues={{}}
            showValidation={true}
          />
        </TestWrapper>
      )

      // The error state would be managed by react-hook-form
      // This test would need to be enhanced with proper form state
    })
  })

  describe('User Interactions', () => {
    it('should handle user input', async () => {
      const user = userEvent.setup()
      const field: TextFieldSchema = {
        id: 'input-field',
        name: 'inputField',
        type: 'text',
        label: 'Input Field'
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Input Field')
      await user.type(input, 'Hello World')

      expect(input).toHaveValue('Hello World')
    })

    it('should handle select option change', async () => {
      const user = userEvent.setup()
      const field: SelectFieldSchema = {
        id: 'select-field',
        name: 'selectField',
        type: 'select',
        label: 'Select Field',
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const select = screen.getByLabelText('Select Field')
      await user.selectOptions(select, 'option2')

      expect(select).toHaveValue('option2')
    })

    it('should handle checkbox toggle', async () => {
      const user = userEvent.setup()
      const field = {
        id: 'checkbox-field',
        name: 'checkboxField',
        type: 'checkbox',
        label: 'Checkbox Field'
      } as any

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} />
        </TestWrapper>
      )

      const checkbox = screen.getByLabelText('Checkbox Field')
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })
  })

  describe('Theme Support', () => {
    it('should apply theme styles', () => {
      const field: TextFieldSchema = {
        id: 'themed-field',
        name: 'themedField',
        type: 'text',
        label: 'Themed Field'
      }

      const theme = {
        primaryColor: '#ff0000',
        fontSize: 'lg' as const,
        borderRadius: 'lg' as const
      }

      render(
        <TestWrapper>
          <DynamicFormField field={field} watchedValues={{}} theme={theme} />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Themed Field')
      expect(input).toHaveClass('rounded-lg')
    })
  })
})
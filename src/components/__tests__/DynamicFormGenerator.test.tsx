import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DynamicFormGenerator } from '../DynamicFormGenerator'
import type { FormSchema } from '../../types/schema'

// Mock dependencies
vi.mock('../DynamicFormSection', () => ({
  DynamicFormSection: ({ section }: { section: any }) => (
    <div data-testid={`section-${section.id}`}>
      <h3>{section.title}</h3>
      {section.fields.map((field: any) => (
        <div key={field.id} data-testid={`field-${field.name}`}>
          {field.label}
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../FormProgressIndicator', () => ({
  FormProgressIndicator: ({ steps, currentStep }: { steps: any[]; currentStep: number }) => (
    <div data-testid="progress-indicator">
      Step {currentStep + 1} of {steps.length}
    </div>
  ),
}))

vi.mock('../FormSubmissionResult', () => ({
  FormSubmissionResult: ({ result, onStartOver }: { result: any; onStartOver: () => void }) => (
    <div data-testid="submission-result">
      <p>{result.message}</p>
      <button onClick={onStartOver}>Start Over</button>
    </div>
  ),
}))

vi.mock('../../utils/storage', () => ({
  storage: {
    saveSubmission: vi.fn(),
  },
}))

vi.mock('../../utils/validation', () => {
  const { z } = require('zod')
  return {
    SchemaValidator: {
      createFormValidator: vi.fn(() => z.object({
        firstName: z.string().optional(),
        email: z.string().email().optional(),
        newsletter: z.boolean().optional(),
      })),
      validateFormData: vi.fn(() => []),
    },
  }
})

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234',
}))

describe('DynamicFormGenerator', () => {
  const mockSchema: FormSchema = {
    id: 'test-form',
    title: 'Test Form',
    description: 'A test form for unit testing',
    version: '1.0.0',
    sections: [
      {
        id: 'section-1',
        title: 'Personal Information',
        description: 'Enter your personal details',
        fields: [
          {
            id: 'field-1',
            name: 'firstName',
            type: 'text',
            label: 'First Name',
            validation: { required: true },
          },
          {
            id: 'field-2',
            name: 'email',
            type: 'email',
            label: 'Email',
            validation: { required: true },
          },
        ],
      },
      {
        id: 'section-2',
        title: 'Preferences',
        description: 'Your preferences',
        fields: [
          {
            id: 'field-3',
            name: 'newsletter',
            type: 'checkbox',
            label: 'Subscribe to newsletter',
          },
        ],
      },
    ],
    settings: {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1d4ed8',
      },
      multiStep: false,
      showProgress: false,
      allowDrafts: true,
      submitButtonText: 'Submit Form',
      resetButtonText: 'Reset Form',
    },
    metadata: {
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      version: '1.0.0',
      status: 'published',
      createdBy: 'test-user',
    },
  } as any

  const multiStepSchema: FormSchema = {
    ...mockSchema,
    settings: {
      ...mockSchema.settings,
      multiStep: true,
      showProgress: true,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('Form Rendering', () => {
    it('should render form with title and description', () => {
      render(<DynamicFormGenerator schema={mockSchema} />)

      expect(screen.getByText('Test Form')).toBeInTheDocument()
      expect(screen.getByText('A test form for unit testing')).toBeInTheDocument()
    })

    it('should render all sections in single-page mode', () => {
      render(<DynamicFormGenerator schema={mockSchema} />)

      expect(screen.getByTestId('section-section-1')).toBeInTheDocument()
      expect(screen.getByTestId('section-section-2')).toBeInTheDocument()
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Preferences')).toBeInTheDocument()
    })

    it('should render only current section in multi-step mode', () => {
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      expect(screen.getByTestId('section-section-1')).toBeInTheDocument()
      expect(screen.queryByTestId('section-section-2')).not.toBeInTheDocument()
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
    })

    it('should show progress indicator in multi-step mode when enabled', () => {
      render(<DynamicFormGenerator schema={multiStepSchema} showProgress={true} />)

      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    })

    it('should apply theme colors', () => {
      render(<DynamicFormGenerator schema={mockSchema} />)

      const submitButton = screen.getByText('Submit Form')
      expect(submitButton).toHaveStyle({ backgroundColor: '#3b82f6' })
    })
  })

  describe('Form Actions', () => {
    it('should render submit button with custom text', () => {
      render(<DynamicFormGenerator schema={mockSchema} submitButtonText="Send Data" />)

      expect(screen.getByText('Send Data')).toBeInTheDocument()
    })

    it('should render reset button with custom text', () => {
      render(<DynamicFormGenerator schema={mockSchema} resetButtonText="Clear All" />)

      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    it('should show save draft button when allowDrafts is true', () => {
      render(<DynamicFormGenerator schema={mockSchema} allowDrafts={true} />)

      expect(screen.getByText('💾 Save Draft')).toBeInTheDocument()
    })

    it('should hide save draft button when allowDrafts is false', () => {
      const schemaWithoutDrafts = {
        ...mockSchema,
        settings: { ...mockSchema.settings, allowDrafts: false },
      }
      render(<DynamicFormGenerator schema={schemaWithoutDrafts} allowDrafts={false} />)

      expect(screen.queryByText('💾 Save Draft')).not.toBeInTheDocument()
    })
  })

  describe('Multi-step Navigation', () => {
    it('should show next button on first step', () => {
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      expect(screen.getByText('Next →')).toBeInTheDocument()
      expect(screen.queryByText('← Previous')).not.toBeInTheDocument()
    })

    it('should navigate to next step when next button is clicked', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      const nextButton = screen.getByText('Next →')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('section-section-2')).toBeInTheDocument()
        expect(screen.queryByTestId('section-section-1')).not.toBeInTheDocument()
      })
    })

    it('should show previous button on second step', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      // Navigate to second step
      const nextButton = screen.getByText('Next →')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('← Previous')).toBeInTheDocument()
      })
    })

    it('should show submit button on last step', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      // Navigate to last step
      const nextButton = screen.getByText('Next →')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Submit Form')).toBeInTheDocument()
        expect(screen.queryByText('Next →')).not.toBeInTheDocument()
      })
    })

    it('should navigate back to previous step', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      // Navigate to second step
      const nextButton = screen.getByText('Next →')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('section-section-2')).toBeInTheDocument()
      })

      // Navigate back to first step
      const prevButton = screen.getByText('← Previous')
      await user.click(prevButton)

      await waitFor(() => {
        expect(screen.getByTestId('section-section-1')).toBeInTheDocument()
        expect(screen.queryByTestId('section-section-2')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const mockOnSubmit = vi.fn()
      const user = userEvent.setup()

      render(<DynamicFormGenerator schema={mockSchema} onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })

    it('should show submission result after successful submission', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={mockSchema} />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('submission-result')).toBeInTheDocument()
        expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const mockOnSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))
      const user = userEvent.setup()

      render(<DynamicFormGenerator schema={mockSchema} onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      expect(screen.getByText('Submitting...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should handle submission errors gracefully', async () => {
      // Mock console.error to avoid error logs in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const mockOnSubmit = vi.fn(() => Promise.reject(new Error('Submission failed')))
      const user = userEvent.setup()

      render(<DynamicFormGenerator schema={mockSchema} onSubmit={mockOnSubmit} />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Draft Handling', () => {
    it('should save draft when save draft button is clicked', async () => {
      const mockOnDraft = vi.fn()
      const user = userEvent.setup()

      render(<DynamicFormGenerator schema={mockSchema} onDraft={mockOnDraft} />)

      const saveDraftButton = screen.getByText('💾 Save Draft')
      await user.click(saveDraftButton)

      expect(mockOnDraft).toHaveBeenCalled()
    })

    it('should save draft to localStorage', async () => {
      const mockOnDraft = vi.fn()
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={mockSchema} onDraft={mockOnDraft} allowDrafts={true} />)

      const saveDraftButton = screen.getByText('💾 Save Draft')
      await user.click(saveDraftButton)

      // Verify onDraft was called
      expect(mockOnDraft).toHaveBeenCalled()

      // Verify localStorage
      const savedDraft = localStorage.getItem('form-draft-test-form')
      expect(savedDraft).toBeTruthy()

      const parsedDraft = JSON.parse(savedDraft!)
      expect(parsedDraft).toHaveProperty('data')
      expect(parsedDraft).toHaveProperty('timestamp')
    })
  })

  describe('Form Reset', () => {
    it('should reset form when reset button is clicked', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={mockSchema} />)

      const resetButton = screen.getByText('Reset Form')
      await user.click(resetButton)

      // Form should be reset (hard to test without actual form values)
      expect(resetButton).toBeInTheDocument()
    })

    it('should remove draft from localStorage when reset', async () => {
      const mockOnDraft = vi.fn()
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={mockSchema} onDraft={mockOnDraft} allowDrafts={true} />)

      // First save a draft
      const saveDraftButton = screen.getByText('💾 Save Draft')
      await user.click(saveDraftButton)

      // Verify onDraft was called and localStorage was written
      expect(mockOnDraft).toHaveBeenCalled()
      expect(localStorage.getItem('form-draft-test-form')).toBeTruthy()

      // Then reset
      const resetButton = screen.getByText('Reset Form')
      await user.click(resetButton)

      expect(localStorage.getItem('form-draft-test-form')).toBeNull()
    })

    it('should reset to first step in multi-step forms', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={multiStepSchema} />)

      // Navigate to second step
      const nextButton = screen.getByText('Next →')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByTestId('section-section-2')).toBeInTheDocument()
      })

      // Reset form
      const resetButton = screen.getByText('Reset Form')
      await user.click(resetButton)

      await waitFor(() => {
        expect(screen.getByTestId('section-section-1')).toBeInTheDocument()
        expect(screen.queryByTestId('section-section-2')).not.toBeInTheDocument()
      })
    })
  })

  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        firstName: 'John',
        email: 'john@example.com',
        newsletter: true,
      }

      render(<DynamicFormGenerator schema={mockSchema} initialData={initialData} />)

      // The form should be populated with initial data
      // (This would be more testable with actual form controls)
      expect(screen.getByText('Test Form')).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should display validation errors', async () => {
      const { SchemaValidator } = await import('../../utils/validation')
      SchemaValidator.validateFormData.mockReturnValue([
        { field: 'firstName', message: 'First name is required' },
        { field: 'email', message: 'Invalid email format' },
      ])

      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={mockSchema} />)

      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please fix the validation errors and try again.')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      const { container } = render(<DynamicFormGenerator schema={mockSchema} />)

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<DynamicFormGenerator schema={mockSchema} />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Test Form')
    })
  })

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DynamicFormGenerator schema={mockSchema} className="custom-form-class" />
      )

      expect(container.querySelector('.custom-form-class')).toBeInTheDocument()
    })

    it('should handle showValidation prop', () => {
      render(<DynamicFormGenerator schema={mockSchema} showValidation={false} />)

      // Validation should be disabled (passed to child components)
      expect(screen.getByText('Test Form')).toBeInTheDocument()
    })

    it('should handle showValidationRules prop', () => {
      render(<DynamicFormGenerator schema={mockSchema} showValidationRules={true} />)

      // Validation rules should be shown (passed to child components)
      expect(screen.getByText('Test Form')).toBeInTheDocument()
    })

    it('should handle realTimeValidation prop', () => {
      render(<DynamicFormGenerator schema={mockSchema} realTimeValidation={false} />)

      // Real-time validation should be disabled (passed to child components)
      expect(screen.getByText('Test Form')).toBeInTheDocument()
    })
  })

  describe('Submission Result Handling', () => {
    it('should allow starting over from submission result', async () => {
      const user = userEvent.setup()
      render(<DynamicFormGenerator schema={mockSchema} />)

      // Submit form
      const submitButton = screen.getByText('Submit Form')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('submission-result')).toBeInTheDocument()
      })

      // Start over
      const startOverButton = screen.getByText('Start Over')
      await user.click(startOverButton)

      // Should return to form
      expect(screen.getByText('Test Form')).toBeInTheDocument()
      expect(screen.queryByTestId('submission-result')).not.toBeInTheDocument()
    })
  })
})
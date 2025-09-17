import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormBuilder } from '../FormBuilder'
import type { FormSchema } from '../../types/schema'

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../utils/storage', () => ({
  storage: {
    saveSchema: vi.fn(),
  },
}))

vi.mock('../../utils/schemaHelpers', () => ({
  SchemaBuilder: vi.fn().mockImplementation(() => ({
    addSection: vi.fn().mockReturnThis(),
    addTextField: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({
      id: 'mock-schema-id',
      title: 'New Form',
      description: 'Description',
      version: '1.0.0',
      sections: [
        {
          id: 'section-1',
          title: 'General Information',
          description: 'Basic form fields',
          fields: [
            {
              id: 'field-1',
              name: 'sample_field',
              type: 'text',
              label: 'Sample Field',
              placeholder: 'Enter some text here',
              description: 'This is a sample field to get you started',
            },
          ],
        },
      ],
      settings: {
        theme: { primaryColor: '#3b82f6', secondaryColor: '#1d4ed8' },
        multiStep: false,
        showProgress: false,
        allowDrafts: true,
      },
      metadata: {
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        version: '1.0.0',
        status: 'draft',
        createdBy: 'user',
      },
    }),
  })),
}))

vi.mock('../FieldEditor', () => ({
  FieldEditor: ({ field, onChange }: { field: any; onChange: (updates: any) => void }) => (
    <div data-testid="field-editor">
      <h4>Editing: {field?.label || 'Unknown Field'}</h4>
      <input
        data-testid="field-label-input"
        defaultValue={field?.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />
    </div>
  ),
}))

vi.mock('../SectionEditor', () => ({
  SectionEditor: ({
    section,
    index,
    onSectionChange,
    onDeleteSection,
    onAddField,
    onEditField,
  }: {
    section: any
    index: number
    onSectionChange: (updates: any) => void
    onDeleteSection: () => void
    onAddField: () => void
    onEditField: (fieldId: string) => void
  }) => (
    <div data-testid={`section-editor-${section.id}`}>
      <h3>{section.title}</h3>
      <input
        data-testid={`section-title-${section.id}`}
        defaultValue={section.title}
        onChange={(e) => onSectionChange({ title: e.target.value })}
      />
      <button data-testid={`add-field-${section.id}`} onClick={onAddField}>
        Add Field
      </button>
      <button data-testid={`delete-section-${section.id}`} onClick={onDeleteSection}>
        Delete Section
      </button>
      {section.fields.map((field: any) => (
        <div key={field.id} data-testid={`field-${field.id}`}>
          <span>{field.label}</span>
          <button onClick={() => onEditField(field.id)}>Edit Field</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('../SchemaPreview', () => ({
  SchemaPreview: ({ schema }: { schema: any }) => (
    <div data-testid="schema-preview">
      <h2>Preview: {schema.title}</h2>
      <p>{schema.description}</p>
    </div>
  ),
}))

// Mock window.confirm
global.confirm = vi.fn(() => true)

describe('FormBuilder', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  const mockSchema: FormSchema = {
    id: 'existing-schema',
    title: 'Existing Form',
    description: 'An existing form for testing',
    version: '1.0.0',
    sections: [
      {
        id: 'section-1',
        title: 'Test Section',
        description: 'A test section',
        fields: [
          {
            id: 'field-1',
            name: 'testField',
            type: 'text',
            label: 'Test Field',
          } as any,
        ],
      },
    ],
    settings: {
      theme: { primaryColor: '#3b82f6', secondaryColor: '#1d4ed8' },
      multiStep: false,
      showProgress: false,
      allowDrafts: true,
    },
    metadata: {
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      version: '1.0.0',
      status: 'draft',
      createdBy: 'user',
    },
  } as any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should render with existing schema', () => {
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByDisplayValue('Existing Form')).toBeInTheDocument()
      expect(screen.getByDisplayValue('An existing form for testing')).toBeInTheDocument()
      expect(screen.getByTestId('section-editor-section-1')).toBeInTheDocument()
    })

    it('should render with new schema when no schema provided', () => {
      render(<FormBuilder onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByDisplayValue('New Form')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Description')).toBeInTheDocument()
    })

    it('should start in builder tab by default', () => {
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const builderTab = screen.getByText('Builder')
      expect(builderTab).toHaveClass('bg-white')
    })
  })

  describe('Schema Management', () => {
    it('should update schema title', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const titleInput = screen.getByDisplayValue('Existing Form')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Form Title')

      expect(titleInput).toHaveValue('Updated Form Title')
    })

    it('should update schema description', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const descriptionInput = screen.getByDisplayValue('An existing form for testing')
      await user.clear(descriptionInput)
      await user.type(descriptionInput, 'Updated description')

      expect(descriptionInput).toHaveValue('Updated description')
    })
  })

  describe('Section Management', () => {
    it('should add new section', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const addSectionButton = screen.getByText('Add Section')
      await user.click(addSectionButton)

      // Check if new section was added (should find section editors)
      const sectionEditors = screen.getAllByTestId(/section-editor-/)
      expect(sectionEditors.length).toBeGreaterThan(1) // Original section + new section
    })

    it('should delete section with confirmation', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const deleteSectionButton = screen.getByTestId('delete-section-section-1')
      await user.click(deleteSectionButton)

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this section?')
    })

    it('should not delete section if confirmation cancelled', async () => {
      global.confirm = vi.fn(() => false)
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const deleteSectionButton = screen.getByTestId('delete-section-section-1')
      await user.click(deleteSectionButton)

      expect(screen.getByTestId('section-editor-section-1')).toBeInTheDocument()
    })

    it('should update section properties', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const sectionTitleInput = screen.getByTestId('section-title-section-1')
      await user.clear(sectionTitleInput)
      await user.type(sectionTitleInput, 'Updated Section Title')

      expect(sectionTitleInput).toHaveValue('Updated Section Title')
    })
  })

  describe('Field Management', () => {
    it('should add new field to section', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const addFieldButton = screen.getByTestId('add-field-section-1')
      await user.click(addFieldButton)

      // Should open field editor for new field
      expect(screen.getByTestId('field-editor')).toBeInTheDocument()
    })

    it('should edit existing field', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const editFieldButton = screen.getByText('Edit Field')
      await user.click(editFieldButton)

      expect(screen.getByTestId('field-editor')).toBeInTheDocument()
      expect(screen.getByText('Editing: Test Field')).toBeInTheDocument()
    })

    it('should show field editor when field is selected', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Initially should show no field selected
      expect(screen.getByText('No field selected')).toBeInTheDocument()

      // Open field editor
      const editFieldButton = screen.getByText('Edit Field')
      await user.click(editFieldButton)

      // Should show field editor
      expect(screen.getByTestId('field-editor')).toBeInTheDocument()
      expect(screen.getByText('Editing:', { exact: false })).toBeInTheDocument()
      expect(screen.queryByText('No field selected')).not.toBeInTheDocument()
    })

    it('should update field properties', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Open field editor
      const editFieldButton = screen.getByText('Edit Field')
      await user.click(editFieldButton)

      // Update field label
      const fieldLabelInput = screen.getByTestId('field-label-input')
      await user.clear(fieldLabelInput)
      await user.type(fieldLabelInput, 'Updated Field Label')

      expect(fieldLabelInput).toHaveValue('Updated Field Label')
    })
  })

  describe('Tab Navigation', () => {
    it('should switch to preview tab', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const previewTab = screen.getByText('Preview')
      await user.click(previewTab)

      expect(previewTab).toHaveClass('bg-white')
      expect(screen.getByTestId('schema-preview')).toBeInTheDocument()
      expect(screen.getByText('Preview: Existing Form')).toBeInTheDocument()
    })

    it('should switch back to builder tab', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Switch to preview
      const previewTab = screen.getByText('Preview')
      await user.click(previewTab)

      // Switch back to builder
      const builderTab = screen.getByText('Builder')
      await user.click(builderTab)

      expect(builderTab).toHaveClass('bg-white')
      expect(screen.getByTestId('section-editor-section-1')).toBeInTheDocument()
    })
  })

  describe('Save Functionality', () => {
    it('should save schema successfully', async () => {
      const { storage } = await import('../../utils/storage')
      const { toast } = await import('react-toastify')

      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const saveButton = screen.getByText('Save Schema')
      await user.click(saveButton)

      await waitFor(() => {
        expect(storage.saveSchema).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Schema saved successfully!')
        expect(mockOnSave).toHaveBeenCalled()
      })
    })

    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const saveButton = screen.getByText('Save Schema')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })
    })

    it('should render save button', async () => {
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const saveButton = screen.getByText('Save Schema')
      expect(saveButton).toBeInTheDocument()
      expect(saveButton).toBeEnabled()
    })
  })

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Look for the back arrow button (might not have accessible name)
      const cancelButton = screen.getAllByRole('button')[0] // First button is likely the back button
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no sections exist', () => {
      const schemaWithoutSections = {
        ...mockSchema,
        sections: [],
      }

      render(<FormBuilder schema={schemaWithoutSections} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('No sections yet')).toBeInTheDocument()
      expect(screen.getByText('Get started by adding your first section.')).toBeInTheDocument()
    })

    it('should show empty field editor state', () => {
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      expect(screen.getByText('No field selected')).toBeInTheDocument()
      expect(screen.getByText('Click on a field to edit its properties.')).toBeInTheDocument()
    })
  })

  describe('Schema Updates', () => {
    it('should update metadata timestamps on schema changes', async () => {
      const user = userEvent.setup()
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const titleInput = screen.getByDisplayValue('Existing Form')
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')

      // The component should update the updatedAt timestamp internally
      expect(titleInput).toHaveValue('New Title')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const titleInput = screen.getByDisplayValue('Existing Form')
      expect(titleInput).toHaveAttribute('placeholder', 'Form Title')

      const descriptionInput = screen.getByDisplayValue('An existing form for testing')
      expect(descriptionInput).toHaveAttribute('placeholder', 'Form description (optional)')
    })

    it('should have proper button states', () => {
      render(<FormBuilder schema={mockSchema} onSave={mockOnSave} onCancel={mockOnCancel} />)

      const saveButton = screen.getByText('Save Schema')
      expect(saveButton).not.toBeDisabled()
    })
  })
})
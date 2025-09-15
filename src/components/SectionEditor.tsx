import type { FormSection, FieldSchema } from '../types/schema';

interface SectionEditorProps {
  section: FormSection;
  index: number;
  onSectionChange: (updates: Partial<FormSection>) => void;
  onDeleteSection: () => void;
  onFieldChange: (fieldId: string, updates: Partial<FieldSchema>) => void;
  onAddField: () => void;
  onDeleteField: (fieldId: string) => void;
  onEditField: (fieldId: string) => void;
  editingFieldId: string | null;
}

export function SectionEditor({
  section,
  index,
  onSectionChange,
  onDeleteSection,
  onAddField,
  onDeleteField,
  onEditField,
  editingFieldId
}: SectionEditorProps) {
  const getFieldTypeIcon = (type: string) => {
    const icons = {
      text: '📝',
      email: '📧',
      number: '🔢',
      date: '📅',
      select: '📋',
      radio: '🔘',
      checkbox: '☑️',
      textarea: '📄'
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  const getFieldTypeLabel = (type: string) => {
    const labels = {
      text: 'Text',
      email: 'Email',
      number: 'Number',
      date: 'Date',
      select: 'Select',
      radio: 'Radio',
      checkbox: 'Checkbox',
      textarea: 'Textarea'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Section Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-500">Section {index + 1}</span>
            <input
              type="text"
              value={section.title}
              onChange={(e) => onSectionChange({ title: e.target.value })}
              className="text-lg font-medium text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none px-0"
              placeholder="Section Title"
            />
          </div>
          <button
            onClick={onDeleteSection}
            className="text-red-600 hover:text-red-700 p-1 rounded"
            title="Delete Section"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {section.description !== undefined && (
          <input
            type="text"
            value={section.description || ''}
            onChange={(e) => onSectionChange({ description: e.target.value })}
            className="mt-1 text-sm text-gray-600 bg-transparent border-0 focus:ring-0 focus:outline-none px-0 w-full"
            placeholder="Section description (optional)"
          />
        )}
      </div>

      {/* Fields */}
      <div className="p-4">
        {section.fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fields yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add your first field to this section.</p>
            <button
              onClick={onAddField}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Field
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {section.fields.map((field) => (
              <div
                key={field.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  editingFieldId === field.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onEditField(field.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg" title={getFieldTypeLabel(field.type)}>
                      {getFieldTypeIcon(field.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {field.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {field.name} • {getFieldTypeLabel(field.type)}
                        {field.validation?.required && ' • Required'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {field.validation?.required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Required
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteField(field.id);
                      }}
                      className="text-red-600 hover:text-red-700 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Field"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={onAddField}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Field</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
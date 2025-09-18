import { useState } from 'react';
import type { FieldSchema, FieldType, SelectOption } from '../types/schema';
import { ValidationEditor } from './ValidationEditor';

interface FieldEditorProps {
  field: FieldSchema;
  onChange: (updates: Partial<FieldSchema>) => void;
}

export function FieldEditor({ field, onChange }: FieldEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' }
  ];

  const handleOptionsChange = (options: SelectOption[]) => {
    onChange({ options: options } as Partial<FieldSchema>);
  };

  const addOption = () => {
    const currentOptions = (field as FieldSchema & { options?: SelectOption[] }).options || [];
    const newOption: SelectOption = {
      value: `option-${currentOptions.length + 1}`,
      label: `Option ${currentOptions.length + 1}`
    };
    handleOptionsChange([...currentOptions, newOption]);
  };

  const updateOption = (index: number, updates: Partial<SelectOption>) => {
    const currentOptions = (field as FieldSchema & { options?: SelectOption[] }).options || [];
    const updatedOptions = currentOptions.map((option: SelectOption, i: number) =>
      i === index ? { ...option, ...updates } : option
    );
    handleOptionsChange(updatedOptions);
  };

  const removeOption = (index: number) => {
    const currentOptions = (field as FieldSchema & { options?: SelectOption[] }).options || [];
    const updatedOptions = currentOptions.filter((_: SelectOption, i: number) => i !== index);
    handleOptionsChange(updatedOptions);
  };

  const needsOptions = field.type === 'select' || field.type === 'radio' ||
    (field.type === 'checkbox' && (field as FieldSchema & { options?: SelectOption[] }).options);

  return (
    <div className="space-y-6">
      {/* Basic Properties */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type
          </label>
          <select
            value={field.type}
            onChange={(e) => onChange({ type: e.target.value as FieldType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name *
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="field_name"
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for data storage (lowercase, underscores only)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label *
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Field Label"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={field.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional field description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Placeholder text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Value
          </label>
          <input
            type="text"
            value={(field.defaultValue as string) || ''}
            onChange={(e) => onChange({ defaultValue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Default value"
          />
        </div>
      </div>

      {/* Options for select, radio, checkbox */}
      {needsOptions && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            <button
              onClick={addOption}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Option
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {((field as FieldSchema & { options?: SelectOption[] }).options || []).map((option: SelectOption, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(index, { label: e.target.value })}
                  placeholder="Option label"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => updateOption(index, { value: e.target.value })}
                  placeholder="Option value"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field-specific options */}
      {field.type === 'textarea' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rows
          </label>
          <input
            type="number"
            value={(field as FieldSchema & { rows?: number }).rows || 3}
            onChange={(e) => onChange({ rows: parseInt(e.target.value) } as Partial<FieldSchema>)}
            min={1}
            max={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {field.type === 'number' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prefix
            </label>
            <input
              type="text"
              value={(field as FieldSchema & { prefix?: string }).prefix || ''}
              onChange={(e) => onChange({ prefix: e.target.value } as Partial<FieldSchema>)}
              placeholder="$"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suffix
            </label>
            <input
              type="text"
              value={(field as FieldSchema & { suffix?: string }).suffix || ''}
              onChange={(e) => onChange({ suffix: e.target.value } as Partial<FieldSchema>)}
              placeholder="USD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {field.type === 'select' && (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={(field as FieldSchema & { multiple?: boolean }).multiple || false}
              onChange={(e) => onChange({ multiple: e.target.checked } as Partial<FieldSchema>)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow multiple selections</span>
          </label>
        </div>
      )}

      {/* Advanced Options */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>Advanced Options</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 pl-6 space-y-4 border-l-2 border-gray-200">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.disabled || false}
                  onChange={(e) => onChange({ disabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Disabled</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.readonly || false}
                  onChange={(e) => onChange({ readonly: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Read Only</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.hidden || false}
                  onChange={(e) => onChange({ hidden: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hidden</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={field.order || 0}
                onChange={(e) => onChange({ order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation Rules */}
      <ValidationEditor
        field={field}
        onChange={onChange}
      />
    </div>
  );
}
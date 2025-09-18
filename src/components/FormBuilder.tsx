import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { FormSchema, FormSection, FieldSchema } from '../types/schema';
import { SchemaBuilder } from '../utils/schemaHelpers';
import { storage } from '../utils/storage';
import { FieldEditor } from './FieldEditor';
import { SectionEditor } from './SectionEditor';
import { SchemaPreview } from './SchemaPreview';

interface FormBuilderProps {
  schema?: FormSchema;
  onSave: () => void;
  onCancel: () => void;
}

export function FormBuilder({ schema, onSave, onCancel }: FormBuilderProps) {
  const [currentSchema, setCurrentSchema] = useState<FormSchema>(() => {
    if (schema) {
      return schema;
    }
    // Create a new schema with a default section
    const builder = new SchemaBuilder('New Form', 'Description');
    builder.addSection('General Information', 'Basic form fields')
      .addTextField('sample_field', 'Sample Field', {
        placeholder: 'Enter some text here',
        description: 'This is a sample field to get you started'
      });
    return builder.build();
  });
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [editingField, setEditingField] = useState<{
    sectionId: string;
    fieldId: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (schema) {
      setCurrentSchema(schema);
    }
  }, [schema]);

  const handleSchemaChange = (updates: Partial<FormSchema>) => {
    setCurrentSchema(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const handleSectionChange = (sectionId: string, updates: Partial<FormSection>) => {
    setCurrentSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const handleAddSection = () => {
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      fields: []
    };

    setCurrentSchema(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    setCurrentSchema(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const handleFieldChange = (sectionId: string, fieldId: string, updates: Partial<FieldSchema>) => {
    setCurrentSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } as FieldSchema : field
              )
            }
          : section
      )
    }));
  };

  const handleAddField = (sectionId: string) => {
    const newField: FieldSchema = {
      id: `field-${Date.now()}`,
      name: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field'
    };

    setCurrentSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      )
    }));

    setEditingField({ sectionId, fieldId: newField.id });
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;

    setCurrentSchema(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      )
    }));

    if (editingField?.fieldId === fieldId) {
      setEditingField(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      storage.saveSchema(currentSchema);
      toast.success('Schema saved successfully!');
      onSave();
    } catch (error) {
      console.error('Failed to save schema:', error);
      toast.error('Failed to save schema. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'builder', label: 'Builder', icon: '🔧' },
    { id: 'preview', label: 'Preview', icon: '👀' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="flex flex-col space-y-4 py-4 sm:hidden">
            <div className="flex items-center justify-between">
              <button
                onClick={onCancel}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={currentSchema.title}
                onChange={(e) => handleSchemaChange({ title: e.target.value })}
                className="w-full text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-0 focus:ring-0 focus:outline-none px-0 dark:placeholder-gray-400"
                placeholder="Form Title"
              />
              <input
                type="text"
                value={currentSchema.description || ''}
                onChange={(e) => handleSchemaChange({ description: e.target.value })}
                className="w-full text-sm text-gray-500 dark:text-gray-400 bg-transparent border-0 focus:ring-0 focus:outline-none px-0 dark:placeholder-gray-500"
                placeholder="Form description (optional)"
              />
            </div>

            {/* Mobile Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'builder' | 'preview')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="mr-1 text-xs">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <input
                  type="text"
                  value={currentSchema.title}
                  onChange={(e) => handleSchemaChange({ title: e.target.value })}
                  className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-0 focus:ring-0 focus:outline-none px-0 dark:placeholder-gray-400"
                  placeholder="Form Title"
                />
                <input
                  type="text"
                  value={currentSchema.description || ''}
                  onChange={(e) => handleSchemaChange({ description: e.target.value })}
                  className="block text-sm text-gray-500 dark:text-gray-400 bg-transparent border-0 focus:ring-0 focus:outline-none px-0 w-96 dark:placeholder-gray-500"
                  placeholder="Form description (optional)"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'builder' | 'preview')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Schema'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'builder' ? (
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Schema Structure */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/10">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Form Structure</h3>
                  <button
                    onClick={handleAddSection}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
                  >
                    Add Section
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {currentSchema.sections.map((section, index) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      index={index}
                      onSectionChange={(updates) => handleSectionChange(section.id, updates)}
                      onDeleteSection={() => handleDeleteSection(section.id)}
                      onFieldChange={(fieldId, updates) => handleFieldChange(section.id, fieldId, updates)}
                      onAddField={() => handleAddField(section.id)}
                      onDeleteField={(fieldId) => handleDeleteField(section.id, fieldId)}
                      onEditField={(fieldId) => setEditingField({ sectionId: section.id, fieldId })}
                      editingFieldId={editingField?.sectionId === section.id ? editingField.fieldId : null}
                    />
                  ))}

                  {currentSchema.sections.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sections yet</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first section.</p>
                      <div className="mt-6">
                        <button
                          onClick={handleAddSection}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Add Section
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Field Editor */}
            <div className="lg:sticky lg:top-8">
              {editingField ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/10">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Field</h3>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 sm:p-6">
                    <FieldEditor
                      field={
                        currentSchema.sections
                          .find(s => s.id === editingField.sectionId)
                          ?.fields.find(f => f.id === editingField.fieldId) as FieldSchema
                      }
                      onChange={(updates) =>
                        handleFieldChange(editingField.sectionId, editingField.fieldId, updates)
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/10 p-4 sm:p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No field selected</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click on a field to edit its properties.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SchemaPreview schema={currentSchema} />
        )}
      </div>
    </div>
  );
}
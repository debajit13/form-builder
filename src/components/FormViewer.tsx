import { useState } from 'react';
import { DynamicFormGenerator } from './DynamicFormGenerator';
import type { FormSchema, FormSubmissionData } from '../types/schema';
import { sampleSchemas } from '../utils/sampleSchemas';

export function FormViewer() {
  const [selectedSchema, setSelectedSchema] = useState<FormSchema | null>(null);
  const [submissionData, setSubmissionData] = useState<FormSubmissionData | null>(null);

  const schemas = Object.values(sampleSchemas);

  const handleFormSubmit = async (data: FormSubmissionData) => {
    console.log('Form submitted:', data);
    setSubmissionData(data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would send this to your backend
    alert('Form submitted successfully! Check console for data.');
  };

  const handleSaveDraft = (data: FormSubmissionData) => {
    console.log('Draft saved:', data);
    alert('Draft saved locally!');
  };

  if (selectedSchema) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedSchema(null);
                setSubmissionData(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Form Gallery
            </button>
          </div>

          {/* Dynamic Form Generator */}
          <DynamicFormGenerator
            schema={selectedSchema}
            onSubmit={handleFormSubmit}
            onDraft={handleSaveDraft}
            showProgress={true}
            allowDrafts={true}
          />

          {/* Debug Information */}
          {import.meta.env.DEV && submissionData && (
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-white dark:text-gray-200 font-medium mb-2">Debug: Submitted Data</h3>
                <pre className="text-green-400 dark:text-green-300 text-sm overflow-x-auto">
                  {JSON.stringify(submissionData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Dynamic Form Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience powerful form generation with JSON schemas. Choose from sample forms below to see the dynamic form generator in action.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Validation</h3>
            <p className="text-gray-600 dark:text-gray-400">Built-in validation with Zod and React Hook Form for instant feedback.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Conditional Logic</h3>
            <p className="text-gray-600 dark:text-gray-400">Show or hide fields based on user input with dynamic conditional rules.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M11 7.343V10a1 1 0 001 1h2.657" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi-step Forms</h3>
            <p className="text-gray-600 dark:text-gray-400">Break complex forms into manageable steps with progress tracking.</p>
          </div>
        </div>

        {/* Sample Forms Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemas.map((schema) => (
            <div
              key={schema.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSchema(schema)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {schema.title}
                    </h3>
                    {schema.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {schema.description}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                    {schema.metadata.category || 'General'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Fields:</span>
                    <span className="font-medium">
                      {schema.sections.reduce((total, section) => total + section.fields.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sections:</span>
                    <span className="font-medium">{schema.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multi-step:</span>
                    <span className="font-medium">
                      {schema.settings.multiStep ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {schema.sections.slice(0, 3).map((section) => (
                    <span
                      key={section.id}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                    >
                      {section.title}
                    </span>
                  ))}
                  {schema.sections.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                      +{schema.sections.length - 3} more
                    </span>
                  )}
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Try This Form →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* JSON Schema Viewer */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              The Dynamic Form Generator takes JSON schemas and renders fully functional forms with validation.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">JSON Schema Input</h3>
                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
                  <pre className="text-green-400 dark:text-green-300 text-xs">
{`{
  "id": "contact-form",
  "title": "Contact Us",
  "sections": [{
    "title": "Personal Info",
    "fields": [{
      "name": "firstName",
      "type": "text",
      "label": "First Name",
      "validation": {
        "required": true,
        "minLength": 2
      }
    }]
  }]
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Generated Form</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">Interactive form with validation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Click on a sample form above to see it in action</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
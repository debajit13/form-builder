import type { FormSchema, FormSubmissionData } from '../types/schema';
import { DynamicFormGenerator } from './DynamicFormGenerator';

interface SchemaPreviewProps {
  schema: FormSchema;
  onSubmit?: (data: FormSubmissionData) => void;
}

export function SchemaPreview({ schema, onSubmit }: SchemaPreviewProps) {
  const handleFormSubmit = (data: FormSubmissionData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log('Form Data:', data);
      alert('Form submitted successfully! Check console for data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Form Preview</h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              This is how your form will appear to users. All layout settings and styling are applied here.
            </p>
          </div>
        </div>
      </div>

      {/* Form Preview */}
      <DynamicFormGenerator
        schema={schema}
        onSubmit={handleFormSubmit}
        showValidation={true}
        realTimeValidation={true}
        saveToStorage={false}
        className=""
      />
    </div>
  );
}
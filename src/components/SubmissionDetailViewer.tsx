import { useState } from 'react';
import type { FormSubmission, FormSchema } from '../types/schema';

interface SubmissionDetailViewerProps {
  submission: FormSubmission;
  schema?: FormSchema;
  onClose: () => void;
  onDelete?: (submissionId: string) => void;
}

export function SubmissionDetailViewer({
  submission,
  schema,
  onClose,
  onDelete
}: SubmissionDetailViewerProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('Are you sure you want to delete this submission?')) {
      setIsDeleting(true);
      try {
        await onDelete(submission.id);
        onClose();
      } catch (error) {
        console.error('Error deleting submission:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getFieldLabel = (fieldName: string) => {
    if (!schema) return fieldName;

    for (const section of schema.sections) {
      const field = section.fields.find(f => f.name === fieldName);
      if (field) {
        return field.label;
      }
    }
    return fieldName;
  };

  const getFieldType = (fieldName: string) => {
    if (!schema) return 'text';

    for (const section of schema.sections) {
      const field = section.fields.find(f => f.name === fieldName);
      if (field) {
        return field.type;
      }
    }
    return 'text';
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'complete':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'invalid':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const exportSubmission = () => {
    const exportData = {
      submission: {
        id: submission.id,
        formId: submission.formId,
        formTitle: schema?.title || 'Unknown Form',
        status: submission.status,
        data: submission.data,
        metadata: submission.metadata
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submission-${submission.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submission Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {schema?.title || 'Unknown Form'} • {formatDate(submission.metadata.submittedAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={getStatusBadge(submission.status)}>
              {submission.status}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Metadata Section */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Submission Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Submission ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{submission.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Form ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{submission.formId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted At</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(submission.metadata.submittedAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={getStatusBadge(submission.status)}>
                    {submission.status}
                  </span>
                </p>
              </div>
              {submission.metadata.userAgent && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-900 break-all">{submission.metadata.userAgent}</p>
                </div>
              )}
              {submission.metadata.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completion Time</label>
                  <p className="mt-1 text-sm text-gray-900">{submission.metadata.duration} seconds</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Data Section */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Form Responses</h3>

            {Object.keys(submission.data).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No form data available
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(submission.data).map(([fieldName, value]) => {
                  const fieldLabel = getFieldLabel(fieldName);
                  const fieldType = getFieldType(fieldName);

                  return (
                    <div key={fieldName} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {fieldLabel}
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {fieldType}
                        </span>
                      </div>

                      <div className="mt-2">
                        {fieldType === 'textarea' || (typeof value === 'string' && value.length > 100) ? (
                          <div className="bg-gray-50 p-3 rounded border text-sm text-gray-900 whitespace-pre-wrap">
                            {formatValue(value)}
                          </div>
                        ) : fieldType === 'checkbox' && Array.isArray(value) ? (
                          <div className="flex flex-wrap gap-2">
                            {value.map((item, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900">{formatValue(value)}</p>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Field: <code className="bg-gray-100 px-1 rounded">{fieldName}</code>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {submission.validationErrors && submission.validationErrors.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-red-900 mb-3">Validation Errors</h3>
              <div className="space-y-2">
                {submission.validationErrors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">
                          {getFieldLabel(error.field)}
                        </h4>
                        <p className="text-sm text-red-700">{error.message}</p>
                        <p className="text-xs text-red-600 mt-1">Type: {error.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={exportSubmission}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
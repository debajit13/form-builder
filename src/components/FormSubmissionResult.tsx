import { useState } from 'react';
import type { FormSchema, FormSubmissionData } from '../types/schema';
import { LoadingSpinner } from './LoadingSpinner';

interface FormSubmissionResultProps {
  result: {
    success: boolean;
    message: string;
    data?: FormSubmissionData;
  };
  schema: FormSchema;
  onStartOver: () => void;
  className?: string;
}

export function FormSubmissionResult({ result, schema, onStartOver, className = '' }: FormSubmissionResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const downloadAsJSON = async () => {
    if (!result.data || isDownloading) return;

    setIsDownloading(true);
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${schema.title.replace(/\s+/g, '_').toLowerCase()}_submission.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result.data || isCopying) return;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 200));
      alert('Data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    } finally {
      setIsCopying(false);
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getFieldLabel = (fieldName: string): string => {
    for (const section of schema.sections) {
      const field = section.fields.find(f => f.name === fieldName);
      if (field) return field.label;
    }
    return fieldName;
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/10 overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-8 text-white ${
            result.success ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {result.success ? (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold">
                {result.success ? 'Form Submitted Successfully!' : 'Submission Failed'}
              </h1>
              <p className="mt-1 text-lg opacity-90">
                {result.message}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {result.success && result.data ? (
            <div className="space-y-6">
              {/* Submission Summary */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submission Summary</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Form:</span>
                      <div className="text-gray-900 dark:text-white">{schema.title}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                      <div className="text-gray-900 dark:text-white">{new Date().toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Fields Completed:</span>
                      <div className="text-gray-900 dark:text-white">
                        {Object.keys(result.data).length} of{' '}
                        {schema.sections.reduce((total, section) => total + section.fields.length, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Display */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submitted Data</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={downloadAsJSON}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>

                {/* Organized by Sections */}
                <div className="space-y-6">
                  {schema.sections.map((section) => {
                    const sectionData = section.fields
                      .filter(field => result.data![field.name] !== undefined)
                      .map(field => ({
                        label: field.label,
                        name: field.name,
                        value: result.data![field.name],
                        type: field.type
                      }));

                    if (sectionData.length === 0) return null;

                    return (
                      <div key={section.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{section.title}</h3>
                        </div>
                        <div className="px-4 py-3">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {sectionData.map((item) => (
                              <div key={item.name}>
                                <dt className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                  <span className="inline-block">
                                    {formatValue(item.value)}
                                  </span>
                                  {item.type === 'email' && item.value && (
                                    <a
                                      href={`mailto:${item.value}`}
                                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                      <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </a>
                                  )}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Raw JSON View */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    View Raw JSON Data
                  </summary>
                  <div className="mt-2 bg-gray-900 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 dark:text-green-300 whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            // Error state - show helpful information
            <div className="text-center py-8">
              <svg className="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Something went wrong
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {result.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-center space-x-4">
          <button
            onClick={onStartOver}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {result.success ? 'Submit Another Response' : 'Try Again'}
          </button>

          {result.success && (
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
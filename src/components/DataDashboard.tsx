import { useState, useEffect } from 'react';
import { DataViewer } from './DataViewer';
import { SubmissionDetailViewer } from './SubmissionDetailViewer';
import { useSubmissionManager } from '../hooks/useSubmissionManager';
import { useSchemaManager } from '../hooks/useSchemaManager';
import { DataManager } from '../utils/dataManager';
import type { FormSubmission } from '../types/schema';

export function DataDashboard() {
  const {
    submissions,
    isLoading,
    error,
    loadSubmissions,
    deleteSubmission,
    exportSubmissions,
    getSubmissionStats
  } = useSubmissionManager();

  const { schemas, loadSchemas, getSchema } = useSchemaManager();

  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadSubmissions();
    loadSchemas();
  }, [loadSubmissions, loadSchemas]);

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    setIsExporting(true);
    try {
      const exportData = DataManager.exportData({
        includeSubmissions: true,
        includeSchemas: true,
        format
      });

      const blob = new Blob([exportData], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-data-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getTotalStats = () => {
    const total = submissions.length;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total,
      today: submissions.filter(s => new Date(s.metadata.submittedAt) >= startOfDay).length,
      thisWeek: submissions.filter(s => new Date(s.metadata.submittedAt) >= startOfWeek).length,
      thisMonth: submissions.filter(s => new Date(s.metadata.submittedAt) >= startOfMonth).length,
      complete: submissions.filter(s => s.status === 'complete').length,
      draft: submissions.filter(s => s.status === 'draft').length,
      invalid: submissions.filter(s => s.status === 'invalid').length
    };
  };

  const getFormStats = () => {
    const formCounts: Record<string, number> = {};
    submissions.forEach(submission => {
      formCounts[submission.formId] = (formCounts[submission.formId] || 0) + 1;
    });

    return Object.entries(formCounts)
      .map(([formId, count]) => ({
        formId,
        formTitle: getSchema(formId)?.title || 'Unknown Form',
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">Error loading data: {error}</div>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();
  const formStats = getFormStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Dashboard</h1>
              <p className="text-sm text-gray-500">View and manage form submissions</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.today} today, {stats.thisWeek} this week
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Complete</p>
                <p className="text-3xl font-bold text-green-600">{stats.complete}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0}% completion rate
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Incomplete submissions
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Forms</p>
                <p className="text-3xl font-bold text-purple-600">{schemas.length}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Available schemas
            </div>
          </div>
        </div>

        {/* Form Performance */}
        {formStats.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Form Performance</h3>
              <p className="text-sm text-gray-500">Submission counts by form</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {formStats.slice(0, 5).map((form) => (
                  <div key={form.formId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{form.formTitle}</p>
                          <p className="text-xs text-gray-500">{form.formId}</p>
                        </div>
                        <div className="ml-4">
                          <span className="text-sm font-medium text-gray-900">{form.count}</span>
                          <span className="text-xs text-gray-500 ml-1">submissions</span>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (form.count / Math.max(...formStats.map(f => f.count))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataViewer
          onSubmissionSelect={(submission) => setSelectedSubmission(submission)}
        />
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailViewer
          submission={selectedSubmission}
          schema={getSchema(selectedSubmission.formId)}
          onClose={() => setSelectedSubmission(null)}
          onDelete={deleteSubmission}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-500 mt-1">Choose your export format</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <button
                  onClick={() => handleExportData('json')}
                  disabled={isExporting}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">JSON Format</h4>
                      <p className="text-sm text-gray-500">Complete data with metadata and structure</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportData('csv')}
                  disabled={isExporting}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">CSV Format</h4>
                      <p className="text-sm text-gray-500">Spreadsheet-friendly tabular data</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
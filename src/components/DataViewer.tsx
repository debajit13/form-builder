import { useState, useMemo, useEffect } from 'react';
import type { FormSubmission } from '../types/schema';
import { useSubmissionManager } from '../hooks/useSubmissionManager';
import { useSchemaManager } from '../hooks/useSchemaManager';
import { DataManager } from '../utils/dataManager';

interface DataViewerProps {
  formId?: string;
  onSubmissionSelect?: (submission: FormSubmission) => void;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'submittedAt' | 'status' | 'formId' | string;

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function DataViewer({ formId, onSubmissionSelect }: DataViewerProps) {
  const { submissions, isLoading, error, loadSubmissions, deleteSubmission } = useSubmissionManager();
  const { schemas, getSchema } = useSchemaManager();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formFilter, setFormFilter] = useState<string>(formId || 'all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'submittedAt', direction: 'desc' });
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    if (formId) {
      setFormFilter(formId);
    }
  }, [formId]);

  // Get filtered and sorted data
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by form if specified
    if (formFilter !== 'all') {
      filtered = filtered.filter(submission => submission.formId === formFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(submission => {
        // Search in submission data values
        const dataMatch = Object.values(submission.data).some(value =>
          String(value).toLowerCase().includes(searchLower)
        );

        // Search in form title
        const schema = getSchema(submission.formId);
        const formTitleMatch = schema?.title.toLowerCase().includes(searchLower);

        // Search in submission ID
        const idMatch = submission.id.toLowerCase().includes(searchLower);

        return dataMatch || formTitleMatch || idMatch;
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      if (sortConfig.field === 'submittedAt') {
        aValue = new Date(a.metadata.submittedAt);
        bValue = new Date(b.metadata.submittedAt);
      } else if (sortConfig.field === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else if (sortConfig.field === 'formId') {
        const aSchema = getSchema(a.formId);
        const bSchema = getSchema(b.formId);
        aValue = aSchema?.title || a.formId;
        bValue = bSchema?.title || b.formId;
      } else {
        // Sort by submission data field
        aValue = (a.data[sortConfig.field] as string | number | Date) || '';
        bValue = (b.data[sortConfig.field] as string | number | Date) || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [submissions, formFilter, statusFilter, searchTerm, sortConfig, getSchema]);

  // Pagination
  const totalItems = filteredSubmissions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

  // Get unique field names from all submissions for column headers
  const allFieldNames = useMemo(() => {
    const fieldSet = new Set<string>();
    filteredSubmissions.forEach(submission => {
      Object.keys(submission.data).forEach(key => fieldSet.add(key));
    });
    return Array.from(fieldSet);
  }, [filteredSubmissions]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectSubmission = (submissionId: string) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.size === paginatedSubmissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(paginatedSubmissions.map(s => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubmissions.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedSubmissions.size} submission(s)?`)) {
      try {
        for (const submissionId of selectedSubmissions) {
          await deleteSubmission(submissionId);
        }
        setSelectedSubmissions(new Set());
      } catch (error) {
        console.error('Error deleting submissions:', error);
      }
    }
  };

  const handleExportSelected = (format: 'json' | 'csv' = 'csv') => {
    if (selectedSubmissions.size === 0) return;

    const selectedSubmissionData = filteredSubmissions.filter(submission =>
      selectedSubmissions.has(submission.id)
    );

    try {
      const exportData = DataManager.exportData({
        includeSubmissions: true,
        includeSchemas: false,
        format
      });

      // Extract only selected submissions for export
      const exportObject = format === 'json' ? JSON.parse(exportData) : null;
      let finalExportData: string;

      if (format === 'json') {
        exportObject.submissions = selectedSubmissionData;
        exportObject.metadata.totalSubmissions = selectedSubmissionData.length;
        finalExportData = JSON.stringify(exportObject, null, 2);
      } else {
        // For CSV, convert selected submissions only
        finalExportData = DataManager.convertToCSV({ submissions: selectedSubmissionData });
      }

      const blob = new Blob([finalExportData], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selected-submissions-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSelectedSubmissions(new Set());
    } catch (error) {
      console.error('Export failed:', error);
      window.alert('Export failed. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">Error loading submissions: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Form Submissions</h3>
            <p className="text-sm text-gray-500">{totalItems} total submissions</p>
          </div>

          {selectedSubmissions.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedSubmissions.size} selected
              </span>
              <button
                onClick={() => handleExportSelected('csv')}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportSelected('json')}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Export JSON
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          ) : filteredSubmissions.length > 0 && (
            <button
              onClick={() => {
                const allSubmissions = filteredSubmissions;
                const csvData = DataManager.convertToCSV({ submissions: allSubmissions });
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all-submissions-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
            >
              📊 Export All as CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search submissions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Form Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form
            </label>
            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Forms</option>
              {schemas.map(schema => (
                <option key={schema.id} value={schema.id}>
                  {schema.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="complete">Complete</option>
              <option value="draft">Draft</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per Page
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={paginatedSubmissions.length > 0 && selectedSubmissions.size === paginatedSubmissions.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('formId')}
              >
                Form
                {sortConfig.field === 'formId' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('submittedAt')}
              >
                Submitted
                {sortConfig.field === 'submittedAt' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status
                {sortConfig.field === 'status' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>

              {/* Dynamic columns for form fields */}
              {allFieldNames.slice(0, 5).map(fieldName => (
                <th
                  key={fieldName}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(fieldName)}
                >
                  {fieldName}
                  {sortConfig.field === fieldName && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSubmissions.map((submission) => {
              const schema = getSchema(submission.formId);
              return (
                <tr
                  key={submission.id}
                  className={`hover:bg-gray-50 ${selectedSubmissions.has(submission.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.has(submission.id)}
                      onChange={() => handleSelectSubmission(submission.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{schema?.title || 'Unknown Form'}</div>
                      <div className="text-gray-500 text-xs">{submission.formId}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(submission.metadata.submittedAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(submission.status)}>
                      {submission.status}
                    </span>
                  </td>

                  {/* Dynamic data columns */}
                  {allFieldNames.slice(0, 5).map(fieldName => (
                    <td key={fieldName} className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {formatValue(submission.data[fieldName])}
                    </td>
                  ))}

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSubmissionSelect?.(submission)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteSubmission(submission.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No submissions found</div>
            {(searchTerm || statusFilter !== 'all' || formFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setFormFilter(formId || 'all');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-700 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
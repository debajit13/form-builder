import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { storage } from '../utils/storage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { DataManager } from '../utils/dataManager'
import type { FormSchema, FormSubmission } from '../types/schema'

type ViewMode = 'forms' | 'submissions' | 'analytics'

interface AnalyticsData {
  totalSubmissions: number
  submissionsByForm: Record<string, number>
  recentSubmissions: FormSubmission[]
  completionRate: number
  averageCompletionTime: number
}

export function DataManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [forms, setForms] = useState<FormSchema[]>([])
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('forms')

  const formIdParam = searchParams.get('formId')
  const viewParam = searchParams.get('view') as ViewMode

  useEffect(() => {
    if (viewParam && ['forms', 'submissions', 'analytics'].includes(viewParam)) {
      setViewMode(viewParam)
    }
    if (formIdParam) {
      setSelectedFormId(formIdParam)
    }
  }, [formIdParam, viewParam])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const allForms = storage.getSchemas()
        const allSubmissions = storage.getSubmissions()

        setForms(allForms)
        setSubmissions(allSubmissions as FormSubmission[])

        // Calculate analytics
        const submissionsByForm = allSubmissions.reduce((acc, sub) => {
          acc[sub.formId] = (acc[sub.formId] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const completedSubmissions = allSubmissions.filter(sub => (sub as FormSubmission).status === 'complete')
        const completionRate = allSubmissions.length > 0
          ? (completedSubmissions.length / allSubmissions.length) * 100
          : 0

        const analyticsData: AnalyticsData = {
          totalSubmissions: allSubmissions.length,
          submissionsByForm,
          recentSubmissions: allSubmissions
            .sort((a, b) => new Date((b as FormSubmission).submittedAt || (b as FormSubmission).metadata?.submittedAt).getTime() - new Date((a as FormSubmission).submittedAt || (a as FormSubmission).metadata?.submittedAt).getTime())
            .slice(0, 10) as FormSubmission[],
          completionRate,
          averageCompletionTime: 0 // We don't track completion time yet
        }

        setAnalytics(analyticsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('view', mode)
    setSearchParams(newParams)
  }

  const handleFormSelect = (formId: string | null) => {
    setSelectedFormId(formId)
    const newParams = new URLSearchParams(searchParams)
    if (formId) {
      newParams.set('formId', formId)
    } else {
      newParams.delete('formId')
    }
    setSearchParams(newParams)
  }

  const handleExportSubmissions = (format: 'json' | 'csv' = 'csv') => {
    if (filteredSubmissions.length === 0) {
      window.alert('No submissions to export.')
      return
    }

    try {
      let exportData: string
      let filename: string
      let mimeType: string

      if (format === 'csv') {
        exportData = DataManager.convertToCSV({ submissions: filteredSubmissions })
        filename = selectedForm
          ? `${selectedForm.title.replace(/[^a-zA-Z0-9]/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.csv`
          : `all_submissions_${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      } else {
        const exportObject = {
          submissions: filteredSubmissions,
          form: selectedForm,
          exportedAt: new Date().toISOString(),
          metadata: {
            totalSubmissions: filteredSubmissions.length,
            formFilter: selectedForm ? selectedForm.title : 'All forms'
          }
        }
        exportData = JSON.stringify(exportObject, null, 2)
        filename = selectedForm
          ? `${selectedForm.title.replace(/[^a-zA-Z0-9]/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}.json`
          : `all_submissions_${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      }

      const blob = new Blob([exportData], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      window.alert('Export failed. Please try again.')
    }
  }

  const filteredSubmissions = selectedFormId
    ? submissions.filter(sub => sub.formId === selectedFormId)
    : submissions

  const selectedForm = selectedFormId ? forms.find(f => f.id === selectedFormId) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading data..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            View and analyze your form submissions and performance data.
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {([
            { key: 'forms', label: 'Forms', icon: '📋' },
            { key: 'submissions', label: 'Submissions', icon: '📊' },
            { key: 'analytics', label: 'Analytics', icon: '📈' }
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleViewModeChange(key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                viewMode === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Forms View */}
      {viewMode === 'forms' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Forms</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Manage your forms and view their submission statistics.
            </p>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No forms found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Create your first form to start collecting data.</p>
              <Link
                to="/builder/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Form
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Form
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {forms.map((form) => {
                    const submissionCount = analytics?.submissionsByForm[form.id] || 0
                    return (
                      <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{form.title}</div>
                            {form.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{form.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {submissionCount} submissions
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(form.metadata.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              handleFormSelect(form.id)
                              handleViewModeChange('submissions')
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Submissions
                          </button>
                          <Link
                            to={`/preview/form/${form.id}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Preview
                          </Link>
                          <Link
                            to={`/builder/edit/${form.id}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Submissions View */}
      {viewMode === 'submissions' && (
        <div className="space-y-6">
          {/* Form Filter */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="form-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by form:
                </label>
                <select
                  id="form-filter"
                  value={selectedFormId || ''}
                  onChange={(e) => handleFormSelect(e.target.value || null)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All forms</option>
                  {forms.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  ))}
                </select>
              </div>
              {selectedForm && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing submissions for: <span className="font-medium">{selectedForm.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Submissions ({filteredSubmissions.length})
                </h2>
                {filteredSubmissions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportSubmissions('csv')}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      📊 Export CSV
                    </button>
                    <button
                      onClick={() => handleExportSubmissions('json')}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      📄 Export JSON
                    </button>
                  </div>
                )}
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No submissions found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedForm ? `No submissions for "${selectedForm.title}" yet.` : 'No form submissions yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Form
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSubmissions.map((submission) => {
                      const form = forms.find(f => f.id === submission.formId)
                      return (
                        <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {form?.title || 'Unknown Form'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date((submission as FormSubmission).submittedAt || (submission as FormSubmission).metadata?.submittedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.status === 'complete'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/data/submissions/${submission.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalSubmissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Forms</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{forms.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions by Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submissions by Form</h3>
            {Object.keys(analytics.submissionsByForm).length === 0 ? (
              <p className="text-gray-500">No submission data available.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.submissionsByForm).map(([formId, count]) => {
                  const form = forms.find(f => f.id === formId)
                  const percentage = (count / analytics.totalSubmissions) * 100
                  return (
                    <div key={formId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {form?.title || 'Unknown Form'}
                        </span>
                        <span className="text-sm text-gray-500">{count} submissions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Submissions</h3>
            {analytics.recentSubmissions.length === 0 ? (
              <p className="text-gray-500">No recent submissions.</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentSubmissions.slice(0, 5).map((submission) => {
                  const form = forms.find(f => f.id === submission.formId)
                  return (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {form?.title || 'Unknown Form'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date((submission as FormSubmission).submittedAt || (submission as FormSubmission).metadata?.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.status === 'complete'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
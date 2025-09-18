import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { storage } from '../utils/storage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { FormSchema, FormSubmission } from '../types/schema'

export function SubmissionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState<FormSubmission | null>(null)
  const [form, setForm] = useState<FormSchema | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubmissionDetails = async () => {
      if (!id) {
        setError('No submission ID provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Get the submission
        const submissions = storage.getSubmissions()
        const foundSubmission = submissions.find(sub => sub.id === id) as FormSubmission | undefined

        if (!foundSubmission) {
          setError('Submission not found')
          setIsLoading(false)
          return
        }

        // Get the associated form
        const forms = storage.getSchemas()
        const associatedForm = forms.find(form => form.id === foundSubmission.formId)

        if (!associatedForm) {
          setError('Associated form not found')
          setIsLoading(false)
          return
        }

        setSubmission(foundSubmission)
        setForm(associatedForm)
      } catch (err) {
        console.error('Error loading submission details:', err)
        setError('Failed to load submission details')
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissionDetails()
  }, [id])

  const handleDeleteSubmission = () => {
    if (!submission || !window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return
    }

    try {
      // Get all submissions and filter out the current one
      const submissions = storage.getSubmissions()
      const updatedSubmissions = submissions.filter(sub => sub.id !== submission.id)

      // Save updated submissions back to storage
      localStorage.setItem('form-submissions', JSON.stringify(updatedSubmissions))

      // Navigate back to data management
      navigate('/data?view=submissions')
    } catch (err) {
      console.error('Error deleting submission:', err)
      alert('Failed to delete submission. Please try again.')
    }
  }

  const formatFieldValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'N/A'
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None selected'
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  }

  const getFieldLabel = (fieldName: string): string => {
    if (!form) return fieldName

    // Find the field in the form schema to get its label
    for (const section of form.sections) {
      for (const field of section.fields) {
        if (field.name === fieldName) {
          return field.label || fieldName
        }
      }
    }

    // Convert camelCase to readable format if no label found
    return fieldName
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, str => str.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading submission details..." />
      </div>
    )
  }

  if (error || !submission || !form) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/data?view=submissions"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Submissions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submission Details</h1>
          <p className="text-gray-600 mt-2">
            View detailed information about this form submission.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link
            to={`/data?view=submissions&formId=${form.id}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Submissions
          </Link>

          <button
            onClick={handleDeleteSubmission}
            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Submission
          </button>
        </div>
      </div>

      {/* Submission Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Form</dt>
            <dd className="mt-1 text-sm text-gray-900 break-words">{form.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submitted At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date((submission as FormSubmission).submittedAt || (submission as FormSubmission).metadata?.submittedAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                submission.status === 'complete'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {submission.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Submission ID</dt>
            <dd className="mt-1 text-xs text-gray-600 font-mono break-all">{submission.id}</dd>
          </div>
        </div>
      </div>

      {/* Form Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Data</h2>

        {Object.keys(submission.data || {}).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No data available for this submission.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group fields by section */}
            {form.sections.map((section) => {
              const sectionFields = section.fields.filter(field =>
                submission.data && Object.prototype.hasOwnProperty.call(submission.data, field.name)
              )

              if (sectionFields.length === 0) return null

              return (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionFields.map((field) => (
                      <div key={field.id}>
                        <dt className="text-sm font-medium text-gray-500">{getFieldLabel(field.name)}</dt>
                        <dd className="mt-1 text-sm text-gray-900 break-words">
                          {formatFieldValue(submission.data[field.name])}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Show any additional fields not in the form schema */}
            {submission.data && (() => {
              const schemaFields = form.sections.flatMap(section => section.fields.map(field => field.name))
              const additionalFields = Object.keys(submission.data).filter(key => !schemaFields.includes(key))

              if (additionalFields.length === 0) return null

              return (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Additional Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {additionalFields.map((fieldName) => (
                      <div key={fieldName}>
                        <dt className="text-sm font-medium text-gray-500">{getFieldLabel(fieldName)}</dt>
                        <dd className="mt-1 text-sm text-gray-900 break-words">
                          {formatFieldValue(submission.data[fieldName])}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Raw Data (for debugging) */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Raw Data</h2>
        <div className="bg-white rounded border p-4 overflow-auto">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(submission, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
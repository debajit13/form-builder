import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { DynamicFormGenerator } from '../components/DynamicFormGenerator'
import { storage } from '../utils/storage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { FormSchema, FormSubmissionData } from '../types/schema'
import { v4 as uuidv4 } from 'uuid'

export function FormPreviewPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [allSchemas, setAllSchemas] = useState<FormSchema[]>([])
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(id || '')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handle direct navigation to /preview/form without ID - redirect to /preview
  const isPreviewFormRoute = location.pathname === '/preview/form'

  useEffect(() => {
    if (isPreviewFormRoute) {
      navigate('/preview', { replace: true })
      return
    }
  }, [isPreviewFormRoute, navigate])
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean
    message: string
    data?: FormSubmissionData
  } | null>(null)

  const isSpecificForm = !!id
  const isFormSelector = !id

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const schemas = storage.getSchemas()
        setAllSchemas(schemas)

        if (isSpecificForm && id) {
          const foundSchema = storage.getSchemaById(id)
          if (!foundSchema) {
            setError('Form not found')
            return
          }
          setSchema(foundSchema)
          setSelectedSchemaId(id)
        } else if (schemas.length > 0) {
          // If no specific form, use the first available form
          setSchema(schemas[0])
          setSelectedSchemaId(schemas[0].id)
        }
      } catch (err) {
        setError('Failed to load form data')
        console.error('Error loading form data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isSpecificForm, id])

  const handleSchemaChange = (schemaId: string) => {
    const foundSchema = allSchemas.find(s => s.id === schemaId)
    if (foundSchema) {
      setSchema(foundSchema)
      setSelectedSchemaId(schemaId)
      setSubmissionResult(null)

      // Update URL without navigation
      if (!isSpecificForm) {
        window.history.replaceState(null, '', `/preview/form/${schemaId}`)
      }
    }
  }

  const handleFormSubmit = async (data: FormSubmissionData) => {
    try {
      // Save the submission
      const submission = {
        id: uuidv4(),
        formId: schema!.id,
        data,
        metadata: {
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          duration: 0
        },
        status: 'complete' as const,
        validationErrors: []
      }

      storage.saveSubmission(submission)

      setSubmissionResult({
        success: true,
        message: 'Form submitted successfully! This is a preview submission.',
        data
      })

      // Scroll to top to show the result
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmissionResult({
        success: false,
        message: 'Failed to submit form. Please try again.'
      })
      console.error('Error submitting form:', err)
    }
  }

  const resetForm = () => {
    setSubmissionResult(null)
    // Force re-render of the form by updating the key
    setSchema({ ...schema! })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading form preview..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            to="/preview"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Preview
          </Link>
        </div>
      </div>
    )
  }

  if (allSchemas.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No forms available</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Create a form first to preview it here.
        </p>
        <Link
          to="/builder/new"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Form
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Form Preview</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Test your forms and see how they look to your users.
          </p>
        </div>

        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          {/* Form Selector (only show if not viewing a specific form) */}
          {isFormSelector && allSchemas.length > 1 && (
            <div className="w-full sm:min-w-0 sm:w-auto">
              <select
                value={selectedSchemaId}
                onChange={(e) => handleSchemaChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {allSchemas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
            {schema && (
              <>
                <Link
                  to={`/builder/edit/${schema.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Form
                </Link>

                <Link
                  to={`/data?formId=${schema.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Data
                </Link>
              </>
            )}

            {isSpecificForm && (
              <Link
                to="/preview"
                className="inline-flex items-center justify-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Forms
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Submission Result */}
      {submissionResult && (
        <div className={`rounded-lg p-6 ${
          submissionResult.success
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {submissionResult.success ? (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-lg font-semibold ${
                submissionResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {submissionResult.success ? 'Success!' : 'Error'}
              </h3>
              <p className={`mt-1 ${
                submissionResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {submissionResult.message}
              </p>
              {submissionResult.success && submissionResult.data && (
                <div className="mt-4 p-4 bg-white rounded-md border border-green-200">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Submitted Data:</h4>
                  <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                    {JSON.stringify(submissionResult.data, null, 2)}
                  </pre>
                </div>
              )}
              <div className="mt-4">
                <button
                  onClick={resetForm}
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Notice */}
      {!submissionResult && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-800 dark:text-blue-300 font-medium">Preview Mode</p>
              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                This is how your form will appear to users. Submissions will be saved for testing purposes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Preview */}
      {schema && !submissionResult && (
        <div key={schema.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <DynamicFormGenerator
            schema={schema}
            onSubmit={handleFormSubmit}
            showValidation={true}
            realTimeValidation={true}
            saveToStorage={false}
          />
        </div>
      )}

      {/* Form Info */}
      {schema && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Form Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Form Title</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white break-words">{schema.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sections</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{schema.sections.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fields</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {schema.sections.reduce((acc, section) => acc + section.fields.length, 0)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Multi-Step</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {schema.settings.multiStep ? 'Yes' : 'No'}
              </dd>
            </div>
            {schema.description && (
              <div className="col-span-2 sm:col-span-2 lg:col-span-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white break-words">{schema.description}</dd>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FormBuilder } from '../components/FormBuilder'
import { storage } from '../utils/storage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { DataManager } from '../utils/dataManager'
import type { FormSchema } from '../types/schema'

export function FormBuilderPage() {
  const { action, id } = useParams<{ action?: string; id?: string }>()
  const navigate = useNavigate()
  const [currentSchema, setCurrentSchema] = useState<FormSchema | null>(null)
  const [allSchemas, setAllSchemas] = useState<FormSchema[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importOptions, setImportOptions] = useState({
    overwrite: false,
    generateNewId: true,
    renameIfExists: false
  })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = action === 'edit' && id
  const isCreating = action === 'new'
  const isListing = !action

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const schemas = storage.getSchemas()
        setAllSchemas(schemas)

        if (isEditing && id) {
          const schema = storage.getSchemaById(id)
          if (!schema) {
            setError('Form not found')
            return
          }
          setCurrentSchema(schema)
        } else if (isCreating) {
          // FormBuilder will create a new schema
          setCurrentSchema(null)
        }
      } catch (err) {
        setError('Failed to load form data')
        console.error('Error loading form data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isEditing, isCreating, id])

  const handleSave = () => {
    try {
      // The FormBuilder handles the saving internally now
      // Just refresh the schemas list
      setAllSchemas(storage.getSchemas())

      // If we were creating a new form, we'll stay on the current page
      // since the FormBuilder will update the URL appropriately
    } catch (err) {
      setError('Failed to save form')
      console.error('Error saving form:', err)
    }
  }

  const handleDelete = (schemaId: string) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      try {
        storage.deleteSchema(schemaId)
        setAllSchemas(storage.getSchemas())

        // If we're currently editing the deleted form, navigate to the list
        if (isEditing && id === schemaId) {
          navigate('/builder')
        }
      } catch (err) {
        setError('Failed to delete form')
        console.error('Error deleting form:', err)
      }
    }
  }

  const handleExportSchema = (schema: FormSchema) => {
    try {
      const exportData = DataManager.exportSchema(schema.id)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${schema.title.replace(/[^a-zA-Z0-9]/g, '_')}_schema.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      window.alert('Export failed. Please try again.')
    }
  }

  const handleImportSchema = async () => {
    if (!importFile) return

    setImporting(true)
    setImportResult(null)

    try {
      const fileContent = await importFile.text()
      const result = await DataManager.importSchema(fileContent, importOptions)

      if (result.success && result.importedSchema) {
        setImportResult(`✅ Successfully imported "${result.importedSchema.title}"`)
        setAllSchemas(storage.getSchemas()) // Reload schemas to show the imported one
        setShowImportModal(false)
        setImportFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setImportResult(`❌ Import failed: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      setImportResult(`❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/json') {
      setImportFile(file)
      setImportResult(null)
    } else {
      window.alert('Please select a valid JSON file.')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading form builder..." />
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
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/builder"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Forms
          </Link>
        </div>
      </div>
    )
  }

  // Form List View
  if (isListing) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Builder</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Create and manage your dynamic forms with our visual editor.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import Schema
            </button>
            <Link
              to="/builder/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Form
            </Link>
          </div>
        </div>

        {/* Forms Grid */}
        {allSchemas.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No forms yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Get started by creating your first dynamic form.
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSchemas.map((schema) => (
              <FormCard
                key={schema.id}
                schema={schema}
                onDelete={handleDelete}
                onExport={handleExportSchema}
              />
            ))}
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Import Schema</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select JSON file to import
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-400"
                  />
                </div>

                {/* Import Options */}
                {importFile && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Import Options</h4>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions.generateNewId}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          generateNewId: e.target.checked,
                          overwrite: e.target.checked ? false : prev.overwrite
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        Generate new ID (recommended for imports)
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions.renameIfExists}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          renameIfExists: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        Rename if schema with same title exists
                      </span>
                    </label>

                    {!importOptions.generateNewId && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={importOptions.overwrite}
                          onChange={(e) => setImportOptions(prev => ({
                            ...prev,
                            overwrite: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-red-600 dark:text-red-400">
                          Overwrite existing schema with same ID (dangerous)
                        </span>
                      </label>
                    )}
                  </div>
                )}

                {/* Import Result */}
                {importResult && (
                  <div className={`p-3 rounded-md text-sm ${
                    importResult.startsWith('✅')
                      ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                  }`}>
                    {importResult}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportResult(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportSchema}
                    disabled={!importFile || importing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Importing...
                      </div>
                    ) : (
                      'Import Schema'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Form Builder View (Edit/Create)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/builder"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            title="Back to forms"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isCreating ? 'Create New Form' : 'Edit Form'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {isCreating
                ? 'Build your form using our drag-and-drop editor.'
                : `Editing: ${currentSchema?.title || 'Untitled Form'}`
              }
            </p>
          </div>
        </div>

        {currentSchema && (
          <div className="flex items-center space-x-3">
            <Link
              to={`/preview/form/${currentSchema.id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
            <button
              onClick={() => handleDelete(currentSchema.id)}
              className="inline-flex items-center px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Form Builder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <FormBuilder
          schema={currentSchema}
          onSave={handleSave}
          onCancel={() => navigate('/builder')}
        />
      </div>
    </div>
  )
}

interface FormCardProps {
  schema: FormSchema
  onDelete: (id: string) => void
  onExport: (schema: FormSchema) => void
}

function FormCard({ schema, onDelete, onExport }: FormCardProps) {
  const totalFields = schema.sections.reduce((acc, section) => acc + section.fields.length, 0)
  const lastUpdated = new Date(schema.metadata.updatedAt).toLocaleDateString()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {schema.title}
            </h3>
            {schema.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {schema.description}
              </p>
            )}
          </div>
          <div className="ml-3 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onExport(schema)}
                className="p-1 text-gray-400 hover:text-green-600 rounded"
                title="Export schema"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(schema.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete form"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {schema.sections.length} sections
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a.997.997 0 01-1.414 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {totalFields} fields
          </span>
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Updated {lastUpdated}
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex space-x-2">
          <Link
            to={`/preview/form/${schema.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Preview
          </Link>
          <Link
            to={`/data?formId=${schema.id}`}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Data
          </Link>
        </div>
        <Link
          to={`/builder/edit/${schema.id}`}
          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Link>
      </div>
    </div>
  )
}
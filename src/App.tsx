import { useState } from 'react';
import { SchemaManagerProvider } from './hooks/useSchemaManager';
import { SchemaList } from './components/SchemaList';
import { FormBuilder } from './components/FormBuilder';
import { FormViewer } from './components/FormViewer';
import type { FormSchema } from './types/schema';

type MainView = 'home' | 'builder' | 'viewer';
type BuilderView = 'list' | 'edit';

function App() {
  const [mainView, setMainView] = useState<MainView>('home');
  const [builderView, setBuilderView] = useState<BuilderView>('list');
  const [editingSchema, setEditingSchema] = useState<FormSchema | null>(null);

  const handleSelectSchema = (schema: FormSchema) => {
    setEditingSchema(schema);
    setBuilderView('edit');
  };

  const handleCreateNew = () => {
    setEditingSchema(null);
    setBuilderView('edit');
  };

  const handleSave = () => {
    setEditingSchema(null);
    setBuilderView('list');
  };

  const handleCancel = () => {
    setEditingSchema(null);
    setBuilderView('list');
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600">📋</span>
              <span className="ml-2 text-xl font-bold text-gray-900">Dynamic Forms</span>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <button
              onClick={() => {
                setMainView('home');
                setBuilderView('list');
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mainView === 'home'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => {
                setMainView('builder');
                setBuilderView('list');
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mainView === 'builder'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔧 Schema Builder
            </button>
            <button
              onClick={() => setMainView('viewer')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                mainView === 'viewer'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👀 Form Viewer
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  // Home Page Component
  const HomePage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Dynamic Form Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create, manage, and deploy dynamic forms with JSON schemas. Build complex forms with validation, conditional logic, and multi-step flows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setMainView('builder')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              🔧 Build Forms
            </button>
            <button
              onClick={() => setMainView('viewer')}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              👀 View Examples
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Builder</h3>
            <p className="text-gray-600">Drag-and-drop interface for creating complex forms</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Validation</h3>
            <p className="text-gray-600">Real-time validation with custom rules and messages</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conditional Logic</h3>
            <p className="text-gray-600">Dynamic forms that adapt based on user input</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-step</h3>
            <p className="text-gray-600">Break complex forms into manageable steps</p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Schema</h3>
              <p className="text-sm text-gray-600">Use the visual builder to create your form schema</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Preview & Test</h3>
              <p className="text-sm text-gray-600">Test your form with live preview and validation</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Deploy</h3>
              <p className="text-sm text-gray-600">Export JSON schema and integrate with your app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SchemaManagerProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        {mainView === 'home' && <HomePage />}

        {mainView === 'viewer' && <FormViewer />}

        {mainView === 'builder' && (
          <>
            {builderView === 'list' ? (
              <div className="container mx-auto px-4 py-8">
                <SchemaList
                  onSelectSchema={handleSelectSchema}
                  onCreateNew={handleCreateNew}
                />
              </div>
            ) : (
              <FormBuilder
                schema={editingSchema || undefined}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}
          </>
        )}
      </div>
    </SchemaManagerProvider>
  );
}

export default App

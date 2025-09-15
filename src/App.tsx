import { useState } from 'react';
import { SchemaManagerProvider } from './hooks/useSchemaManager';
import { SchemaList } from './components/SchemaList';
import { FormBuilder } from './components/FormBuilder';
import type { FormSchema } from './types/schema';

type View = 'list' | 'builder';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [editingSchema, setEditingSchema] = useState<FormSchema | null>(null);

  const handleSelectSchema = (schema: FormSchema) => {
    setEditingSchema(schema);
    setCurrentView('builder');
  };

  const handleCreateNew = () => {
    setEditingSchema(null);
    setCurrentView('builder');
  };

  const handleSave = (schema: FormSchema) => {
    setEditingSchema(null);
    setCurrentView('list');
  };

  const handleCancel = () => {
    setEditingSchema(null);
    setCurrentView('list');
  };

  return (
    <SchemaManagerProvider>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'list' ? (
          <div className="container mx-auto px-4 py-8">
            <SchemaList
              onSelectSchema={handleSelectSchema}
              onCreateNew={handleCreateNew}
            />
          </div>
        ) : (
          <FormBuilder
            schema={editingSchema}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </SchemaManagerProvider>
  );
}

export default App

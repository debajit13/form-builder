import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FormSchema } from '../types/schema';
import { v4 as uuidv4 } from 'uuid';

interface SchemaManagerContextType {
  schemas: FormSchema[];
  currentSchema: FormSchema | null;
  isLoading: boolean;
  error: string | null;
  createSchema: (schema: Omit<FormSchema, 'id' | 'metadata'>) => Promise<FormSchema>;
  updateSchema: (id: string, schema: Partial<FormSchema>) => Promise<FormSchema>;
  deleteSchema: (id: string) => Promise<void>;
  getSchema: (id: string) => FormSchema | null;
  setCurrentSchema: (schema: FormSchema | null) => void;
  duplicateSchema: (id: string) => Promise<FormSchema>;
  loadSchemas: () => Promise<void>;
}

const SchemaManagerContext = createContext<SchemaManagerContextType | undefined>(undefined);

const STORAGE_KEY = 'form-schemas';

export function SchemaManagerProvider({ children }: { children: ReactNode }) {
  const [schemas, setSchemas] = useState<FormSchema[]>([]);
  const [currentSchema, setCurrentSchema] = useState<FormSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load schemas from localStorage on mount
  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSchemas = JSON.parse(stored) as FormSchema[];
        setSchemas(parsedSchemas);
      } else {
        setSchemas([]);
      }
    } catch (err) {
      setError('Failed to load schemas');
      console.error('Error loading schemas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchemas = (newSchemas: FormSchema[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchemas));
      setSchemas(newSchemas);
    } catch (err) {
      setError('Failed to save schemas');
      console.error('Error saving schemas:', err);
    }
  };

  const createSchema = async (schemaData: Omit<FormSchema, 'id' | 'metadata'>): Promise<FormSchema> => {
    try {
      setError(null);

      const now = new Date().toISOString();
      const newSchema: FormSchema = {
        ...schemaData,
        id: uuidv4(),
        metadata: {
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          status: 'draft'
        }
      };

      const updatedSchemas = [...schemas, newSchema];
      saveSchemas(updatedSchemas);

      return newSchema;
    } catch (err) {
      setError('Failed to create schema');
      throw err;
    }
  };

  const updateSchema = async (id: string, updates: Partial<FormSchema>): Promise<FormSchema> => {
    try {
      setError(null);

      const schemaIndex = schemas.findIndex(s => s.id === id);
      if (schemaIndex === -1) {
        throw new Error('Schema not found');
      }

      const updatedSchema: FormSchema = {
        ...schemas[schemaIndex],
        ...updates,
        metadata: {
          ...schemas[schemaIndex].metadata,
          ...updates.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      const updatedSchemas = [...schemas];
      updatedSchemas[schemaIndex] = updatedSchema;
      saveSchemas(updatedSchemas);

      // Update current schema if it's the one being edited
      if (currentSchema?.id === id) {
        setCurrentSchema(updatedSchema);
      }

      return updatedSchema;
    } catch (err) {
      setError('Failed to update schema');
      throw err;
    }
  };

  const deleteSchema = async (id: string): Promise<void> => {
    try {
      setError(null);

      const updatedSchemas = schemas.filter(s => s.id !== id);
      saveSchemas(updatedSchemas);

      // Clear current schema if it's the one being deleted
      if (currentSchema?.id === id) {
        setCurrentSchema(null);
      }
    } catch (err) {
      setError('Failed to delete schema');
      throw err;
    }
  };

  const getSchema = (id: string): FormSchema | null => {
    return schemas.find(s => s.id === id) || null;
  };

  const duplicateSchema = async (id: string): Promise<FormSchema> => {
    try {
      setError(null);

      const originalSchema = getSchema(id);
      if (!originalSchema) {
        throw new Error('Schema not found');
      }

      const duplicatedSchema = await createSchema({
        ...originalSchema,
        title: `${originalSchema.title} (Copy)`,
        sections: originalSchema.sections,
        settings: originalSchema.settings
      });

      return duplicatedSchema;
    } catch (err) {
      setError('Failed to duplicate schema');
      throw err;
    }
  };

  const value: SchemaManagerContextType = {
    schemas,
    currentSchema,
    isLoading,
    error,
    createSchema,
    updateSchema,
    deleteSchema,
    getSchema,
    setCurrentSchema,
    duplicateSchema,
    loadSchemas
  };

  return (
    <SchemaManagerContext.Provider value={value}>
      {children}
    </SchemaManagerContext.Provider>
  );
}

export function useSchemaManager() {
  const context = useContext(SchemaManagerContext);
  if (context === undefined) {
    throw new Error('useSchemaManager must be used within a SchemaManagerProvider');
  }
  return context;
}
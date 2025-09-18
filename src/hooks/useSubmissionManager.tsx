/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FormSubmission, FormSubmissionData } from '../types/schema';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface SubmissionManagerContextType {
  submissions: FormSubmission[];
  isLoading: boolean;
  error: string | null;
  submitForm: (formId: string, data: FormSubmissionData, metadata?: Partial<FormSubmission['metadata']>) => Promise<FormSubmission>;
  getSubmissionsByForm: (formId: string) => FormSubmission[];
  getSubmissionById: (id: string) => FormSubmission | undefined;
  deleteSubmission: (id: string) => Promise<void>;
  clearSubmissions: (formId?: string) => Promise<void>;
  loadSubmissions: () => Promise<void>;
  exportSubmissions: (formId?: string) => FormSubmission[];
  getSubmissionStats: (formId: string) => {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

const SubmissionManagerContext = createContext<SubmissionManagerContextType | undefined>(undefined);

export function SubmissionManagerProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const loadedSubmissions = storage.getSubmissions();
      setSubmissions(loadedSubmissions as FormSubmission[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load submissions';
      setError(errorMessage);
      console.error('Error loading submissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitForm = useCallback(async (
    formId: string,
    data: FormSubmissionData,
    metadata: Partial<FormSubmission['metadata']> = {}
  ): Promise<FormSubmission> => {
    try {
      setError(null);

      const submission: FormSubmission = {
        id: uuidv4(),
        formId,
        data,
        metadata: {
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          duration: metadata.duration || 0,
          ...metadata
        },
        status: 'complete',
        validationErrors: []
      };

      storage.saveSubmission(submission as FormSubmission);

      // Update local state
      setSubmissions(prev => [...prev, submission as FormSubmission]);

      return submission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getSubmissionsByForm = useCallback((formId: string): FormSubmission[] => {
    return submissions.filter(submission => submission.formId === formId);
  }, [submissions]);

  const getSubmissionById = useCallback((id: string): FormSubmission | undefined => {
    return submissions.find(submission => submission.id === id);
  }, [submissions]);

  const deleteSubmission = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);

      storage.deleteSubmission(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete submission';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const clearSubmissions = useCallback(async (formId?: string): Promise<void> => {
    try {
      setError(null);

      if (formId) {
        // Clear submissions for specific form
        const remainingSubmissions = submissions.filter(s => s.formId !== formId);
        storage.saveSubmissions(remainingSubmissions as FormSubmission[]);
        setSubmissions(remainingSubmissions);
      } else {
        // Clear all submissions
        storage.clearAll();
        setSubmissions([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear submissions';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [submissions]);

  const exportSubmissions = useCallback((formId?: string) => {
    try {
      const submissionsToExport = formId
        ? getSubmissionsByForm(formId)
        : submissions;

      return {
        submissions: submissionsToExport,
        exportedAt: new Date().toISOString(),
        formId,
        count: submissionsToExport.length
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export submissions';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [submissions, getSubmissionsByForm]);

  const getSubmissionStats = useCallback((formId: string) => {
    const formSubmissions = getSubmissionsByForm(formId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: formSubmissions.length,
      today: formSubmissions.filter(s =>
        new Date(s.metadata.submittedAt) >= today
      ).length,
      thisWeek: formSubmissions.filter(s =>
        new Date(s.metadata.submittedAt) >= weekAgo
      ).length,
      thisMonth: formSubmissions.filter(s =>
        new Date(s.metadata.submittedAt) >= monthAgo
      ).length
    };
  }, [getSubmissionsByForm]);

  const value: SubmissionManagerContextType = {
    submissions,
    isLoading,
    error,
    submitForm,
    getSubmissionsByForm,
    getSubmissionById,
    deleteSubmission,
    clearSubmissions,
    loadSubmissions,
    exportSubmissions,
    getSubmissionStats
  };

  return (
    <SubmissionManagerContext.Provider value={value}>
      {children}
    </SubmissionManagerContext.Provider>
  );
}

export function useSubmissionManager() {
  const context = useContext(SubmissionManagerContext);
  if (context === undefined) {
    throw new Error('useSubmissionManager must be used within a SubmissionManagerProvider');
  }
  return context;
}
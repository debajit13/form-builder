import { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormSchema, FormSubmissionData, ValidationError, FieldSchema, SelectOption, FormSubmission } from '../types/schema';
import { SchemaValidator } from '../utils/validation';
import { DynamicFormSection } from './DynamicFormSection';
import { FormProgressIndicator } from './FormProgressIndicator';
import { FormSubmissionResult } from './FormSubmissionResult';
import { storage } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface DynamicFormGeneratorProps {
  schema: FormSchema;
  onSubmit?: (data: FormSubmissionData) => void | Promise<void>;
  onDraft?: (data: FormSubmissionData) => void;
  initialData?: FormSubmissionData;
  className?: string;
  showProgress?: boolean;
  allowDrafts?: boolean;
  submitButtonText?: string;
  resetButtonText?: string;
  showValidation?: boolean;
  showValidationRules?: boolean;
  realTimeValidation?: boolean;
  saveToStorage?: boolean;
}

type FormStep = {
  sectionId: string;
  title: string;
  fields: number;
};

export function DynamicFormGenerator({
  schema,
  onSubmit,
  onDraft,
  initialData,
  className = '',
  showProgress,
  allowDrafts,
  submitButtonText,
  resetButtonText,
  showValidation = true,
  showValidationRules = false,
  realTimeValidation = true,
  saveToStorage = true
}: DynamicFormGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    data?: FormSubmissionData;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Create form validator
  const validator = SchemaValidator.createFormValidator(schema);

  // Setup form with React Hook Form
  const methods = useForm({
    resolver: zodResolver(validator),
    mode: 'onBlur',
    defaultValues: initialData || {}
  });

  const { handleSubmit, watch, reset, trigger } = methods;
  const watchedValues = watch();

  // Determine if multi-step form
  const isMultiStep = schema.settings.multiStep && schema.sections.length > 1;
  const shouldShowProgress = showProgress ?? schema.settings.showProgress ?? isMultiStep;

  // Create form steps for multi-step forms
  const formSteps: FormStep[] = schema.sections.map(section => ({
    sectionId: section.id,
    title: section.title,
    fields: section.fields.length
  }));

  const currentSection = schema.sections[currentStep];

  // Process form data (convert types, handle special fields)
  const processFormData = useCallback((data: FormSubmissionData): FormSubmissionData => {
    const processed: FormSubmissionData = {};

    schema.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = data[field.name];

        if (value !== undefined && value !== null && value !== '') {
          switch (field.type) {
            case 'number':
              processed[field.name] = typeof value === 'string' ? parseFloat(value) : value;
              break;
            case 'date':
              processed[field.name] = typeof value === 'string' ? value : value;
              break;
            case 'checkbox': {
              const checkboxField = field as FieldSchema & { options?: SelectOption[] };
              if (checkboxField.options) {
                // Multiple checkboxes - array of values
                processed[field.name] = Array.isArray(value) ? value : [value];
              } else {
                // Single checkbox - boolean
                processed[field.name] = Boolean(value);
              }
              break;
            }
            case 'select': {
              const selectField = field as FieldSchema & { multiple?: boolean };
              if (selectField.multiple) {
                processed[field.name] = Array.isArray(value) ? value : [value];
              } else {
                processed[field.name] = value;
              }
              break;
            }
            default:
              processed[field.name] = value;
          }
        }
      });
    });

    return processed;
  }, [schema]);

  // Track form start time for analytics
  const [startTime] = useState(Date.now());

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: FormSubmissionData) => {
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Validate form data
      const errors = SchemaValidator.validateFormData(schema, data);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setSubmissionResult({
          success: false,
          message: 'Please fix the validation errors and try again.'
        });
        return;
      }

      // Process form data
      const processedData = processFormData(data);

      // Save submission to storage only if saveToStorage is true
      if (saveToStorage) {
        const submission: FormSubmission = {
          id: uuidv4(),
          formId: schema.id,
          data: processedData,
          metadata: {
            submittedAt: new Date().toISOString(),
            userAgent: navigator.userAgent,
            duration: Date.now() - startTime
          },
          status: 'complete' as const,
          validationErrors: []
        };

        storage.saveSubmission(submission);
      }

      // Call custom onSubmit handler
      if (onSubmit) {
        await onSubmit(processedData);
      }

      setSubmissionResult({
        success: true,
        message: 'Form submitted successfully!',
        data: processedData
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionResult({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while submitting the form.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [schema, onSubmit, processFormData, startTime, saveToStorage]);

  // Save draft
  const handleSaveDraft = useCallback(() => {
    if (onDraft) {
      const currentData = methods.getValues();
      onDraft(currentData);

      // Save draft to localStorage
      localStorage.setItem(`form-draft-${schema.id}`, JSON.stringify({
        data: currentData,
        timestamp: new Date().toISOString()
      }));
    }
  }, [methods, onDraft, schema.id]);

  // Multi-step navigation
  const handleNextStep = async () => {
    // Validate current step fields
    const currentSectionFields = currentSection.fields.map(f => f.name);
    const isValid = await trigger(currentSectionFields);

    if (isValid && currentStep < schema.sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    // Validate all previous steps
    let allValid = true;
    for (let i = 0; i <= Math.min(stepIndex - 1, currentStep); i++) {
      const sectionFields = schema.sections[i].fields.map(f => f.name);
      const isValid = await trigger(sectionFields);
      if (!isValid) {
        allValid = false;
        break;
      }
    }

    if (allValid) {
      setCurrentStep(stepIndex);
    }
  };


  // Reset form
  const handleReset = () => {
    reset();
    setCurrentStep(0);
    setSubmissionResult(null);
    setValidationErrors([]);
    localStorage.removeItem(`form-draft-${schema.id}`);
  };

  // If submission is complete, show result
  if (submissionResult) {
    return (
      <FormSubmissionResult
        result={submissionResult}
        schema={schema}
        onStartOver={handleReset}
        className={className}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <div className={`max-w-4xl mx-auto ${className}`}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Form Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/10 overflow-hidden">
            <div
              className="px-6 py-8 text-white"
              style={{
                backgroundColor: schema.settings.theme?.primaryColor || '#3b82f6',
                background: `linear-gradient(135deg, ${schema.settings.theme?.primaryColor || '#3b82f6'}, ${schema.settings.theme?.secondaryColor || '#1d4ed8'})`
              }}
            >
              <h1 className="text-2xl font-bold mb-2">{schema.title}</h1>
              {schema.description && (
                <p className="text-blue-100 dark:text-blue-200">{schema.description}</p>
              )}

              {shouldShowProgress && isMultiStep && (
                <div className="mt-6">
                  <FormProgressIndicator
                    steps={formSteps}
                    currentStep={currentStep}
                    onStepClick={handleStepClick}
                    variant="dark"
                  />
                </div>
              )}
            </div>

            {/* Form Content */}
            <div className="p-6">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                        Please correct the following errors:
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                        <ul className="list-disc space-y-1 pl-5">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Sections */}
              {isMultiStep ? (
                // Multi-step: Show only current section
                <DynamicFormSection
                  key={currentSection.id}
                  section={currentSection}
                  watchedValues={watchedValues}
                  theme={schema.settings.theme}
                  showValidation={showValidation}
                  showValidationRules={showValidationRules}
                  realTimeValidation={realTimeValidation}
                />
              ) : (
                // Single page: Show all sections
                <div className="space-y-8">
                  {schema.sections.map((section) => (
                    <DynamicFormSection
                      key={section.id}
                      section={section}
                      watchedValues={watchedValues}
                      theme={schema.settings.theme}
                      showValidation={showValidation}
                      showValidationRules={showValidationRules}
                      realTimeValidation={realTimeValidation}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-4">
                {/* Draft Save */}
                {(allowDrafts ?? schema.settings.allowDrafts) && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm font-medium"
                  >
                    💾 Save Draft
                  </button>
                )}

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm font-medium"
                >
                  {resetButtonText || schema.settings.resetButtonText || 'Reset'}
                </button>
              </div>

                <div className="flex flex-col xs:flex-row items-center space-y-2 xs:space-y-0 xs:space-x-4">
                  {/* Multi-step Navigation */}
                  {isMultiStep && (
                  <>
                    {currentStep > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                      >
                        ← Previous
                      </button>
                    )}

                    {currentStep < schema.sections.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
                        style={{
                          backgroundColor: schema.settings.theme?.primaryColor || '#3b82f6'
                        }}
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
                        style={{
                          backgroundColor: schema.settings.theme?.primaryColor || '#3b82f6'
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : (submitButtonText || schema.settings.submitButtonText || 'Submit')}
                      </button>
                    )}
                  </>
                  )}

                  {/* Single Page Submit */}
                  {!isMultiStep && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
                    style={{
                      backgroundColor: schema.settings.theme?.primaryColor || '#3b82f6'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : (submitButtonText || schema.settings.submitButtonText || 'Submit')}
                  </button>
                  )}
                </div>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
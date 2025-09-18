import React from 'react';
import { DynamicFormGenerator } from '../components/DynamicFormGenerator';
import type { FormSchema } from '../types/schema';

const validatedFormSchema: FormSchema = {
  id: 'validated-form-example',
  title: 'Comprehensive Validation Example',
  description: 'Demonstrates all validation features including real-time validation, error messages, and validation rules.',
  version: '1.0.0',
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Basic personal details with various validation rules',
      fields: [
        {
          id: 'name',
          name: 'fullName',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your full name',
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50,
            message: 'Full name must be between 2 and 50 characters'
          }
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your.email@example.com',
          validation: {
            required: true,
            format: 'email',
            message: 'Please enter a valid email address'
          }
        },
        {
          id: 'phone',
          name: 'phone',
          label: 'Phone Number',
          type: 'text',
          placeholder: '+1234567890',
          validation: {
            format: 'phone',
            message: 'Please enter a valid phone number'
          }
        },
        {
          id: 'website',
          name: 'website',
          label: 'Website (Optional)',
          type: 'text',
          placeholder: 'https://example.com',
          validation: {
            format: 'url',
            message: 'Please enter a valid URL'
          }
        }
      ]
    },
    {
      id: 'demographics',
      title: 'Demographics',
      description: 'Age and date validation examples',
      fields: [
        {
          id: 'age',
          name: 'age',
          label: 'Age',
          type: 'number',
          validation: {
            required: true,
            min: 18,
            max: 120,
            integer: true,
            message: 'Age must be between 18 and 120'
          }
        },
        {
          id: 'salary',
          name: 'salary',
          label: 'Annual Salary',
          type: 'number',
          prefix: '$',
          suffix: 'USD',
          validation: {
            min: 0,
            max: 10000000,
            message: 'Salary must be a positive number'
          }
        },
        {
          id: 'birthdate',
          name: 'birthdate',
          label: 'Birth Date',
          type: 'date',
          validation: {
            required: true,
            maxDate: '2006-01-01',
            message: 'You must be at least 18 years old'
          }
        },
        {
          id: 'start-date',
          name: 'startDate',
          label: 'Employment Start Date',
          type: 'date',
          validation: {
            minDate: '2020-01-01',
            maxDate: new Date().toISOString().split('T')[0],
            message: 'Start date must be between 2020 and today'
          }
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Selection validation examples',
      fields: [
        {
          id: 'department',
          name: 'department',
          label: 'Department',
          type: 'select',
          options: [
            { value: 'engineering', label: 'Engineering' },
            { value: 'marketing', label: 'Marketing' },
            { value: 'sales', label: 'Sales' },
            { value: 'hr', label: 'Human Resources' },
            { value: 'finance', label: 'Finance' }
          ],
          validation: {
            required: true,
            message: 'Please select a department'
          }
        },
        {
          id: 'skills',
          name: 'skills',
          label: 'Skills (Select 2-4)',
          type: 'select',
          multiple: true,
          options: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue.js' },
            { value: 'angular', label: 'Angular' },
            { value: 'nodejs', label: 'Node.js' },
            { value: 'python', label: 'Python' },
            { value: 'java', label: 'Java' }
          ],
          validation: {
            required: true,
            minItems: 2,
            maxItems: 4,
            message: 'Please select between 2 and 4 skills'
          }
        },
        {
          id: 'experience',
          name: 'experience',
          label: 'Experience Level',
          type: 'radio',
          options: [
            { value: 'junior', label: 'Junior (0-2 years)' },
            { value: 'mid', label: 'Mid-level (3-5 years)' },
            { value: 'senior', label: 'Senior (6-10 years)' },
            { value: 'expert', label: 'Expert (10+ years)' }
          ],
          validation: {
            required: true,
            message: 'Please select your experience level'
          }
        },
        {
          id: 'certifications',
          name: 'certifications',
          label: 'Professional Certifications',
          type: 'checkbox',
          options: [
            { value: 'aws', label: 'AWS Certified' },
            { value: 'azure', label: 'Azure Certified' },
            { value: 'gcp', label: 'Google Cloud Certified' },
            { value: 'pmp', label: 'PMP Certified' },
            { value: 'scrum', label: 'Scrum Master' }
          ]
        }
      ]
    },
    {
      id: 'additional-info',
      title: 'Additional Information',
      description: 'Text validation and conditional fields',
      fields: [
        {
          id: 'bio',
          name: 'bio',
          label: 'Professional Bio',
          type: 'textarea',
          rows: 4,
          placeholder: 'Tell us about your professional background...',
          validation: {
            required: true,
            minLength: 50,
            maxLength: 500,
            message: 'Bio must be between 50 and 500 characters'
          }
        },
        {
          id: 'portfolio',
          name: 'portfolio',
          label: 'Portfolio URL',
          type: 'text',
          placeholder: 'https://your-portfolio.com',
          validation: {
            format: 'url',
            message: 'Please enter a valid portfolio URL'
          },
          conditional: {
            field: 'experience',
            operator: 'not_equals',
            value: 'junior'
          }
        },
        {
          id: 'references',
          name: 'hasReferences',
          label: 'I can provide professional references',
          type: 'checkbox',
          validation: {
            required: true,
            message: 'You must confirm you can provide references'
          }
        }
      ]
    }
  ],
  settings: {
    allowDrafts: true,
    multiStep: true,
    showProgress: true,
    submitButtonText: 'Submit Application',
    resetButtonText: 'Clear Form',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8',
      fontSize: 'md',
      spacing: 'normal',
      borderRadius: 'md'
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'published'
  }
};

export function ValidatedFormExample() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log('Form submitted with data:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Form submitted successfully! Check the console for submitted data.');
  };

  const handleDraft = (data: Record<string, unknown>) => {
    console.log('Draft saved:', data);
    alert('Draft saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Validation Demo
          </h1>
          <p className="text-gray-600">
            This form demonstrates comprehensive validation features including:
          </p>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Real-time validation with debounced input</li>
            <li>Required field validation</li>
            <li>String length validation (min/max)</li>
            <li>Email, URL, and phone format validation</li>
            <li>Number range validation</li>
            <li>Date range validation</li>
            <li>Selection validation (min/max items)</li>
            <li>Conditional field visibility</li>
            <li>Custom validation messages</li>
            <li>Visual validation indicators</li>
          </ul>
        </div>

        <DynamicFormGenerator
          schema={validatedFormSchema}
          onSubmit={handleSubmit}
          onDraft={handleDraft}
          showValidation={true}
          showValidationRules={true}
          realTimeValidation={true}
          className="bg-white shadow-lg rounded-lg"
        />
      </div>
    </div>
  );
}
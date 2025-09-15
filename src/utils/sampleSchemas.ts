import type { FormSchema } from '../types/schema';

export const contactFormSchema: FormSchema = {
  id: 'contact-form',
  title: 'Contact Us',
  description: 'Get in touch with our team',
  version: '1.0.0',
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      fields: [
        {
          id: 'first-name',
          name: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter your first name',
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50,
            message: 'First name must be between 2 and 50 characters'
          },
          order: 1
        },
        {
          id: 'last-name',
          name: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50
          },
          order: 2
        },
        {
          id: 'email',
          name: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email',
          validation: {
            required: true,
            format: 'email',
            message: 'Please enter a valid email address'
          },
          order: 3
        },
        {
          id: 'phone',
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
          placeholder: '+1 (555) 123-4567',
          validation: {
            pattern: '^\\+?[1-9]\\d{1,14}$',
            message: 'Please enter a valid phone number'
          },
          order: 4
        }
      ]
    },
    {
      id: 'inquiry',
      title: 'Your Inquiry',
      fields: [
        {
          id: 'inquiry-type',
          name: 'inquiryType',
          type: 'select',
          label: 'Type of Inquiry',
          validation: {
            required: true
          },
          options: [
            { value: 'general', label: 'General Question' },
            { value: 'support', label: 'Technical Support' },
            { value: 'sales', label: 'Sales Inquiry' },
            { value: 'partnership', label: 'Partnership' }
          ],
          order: 5
        },
        {
          id: 'message',
          name: 'message',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Tell us more about your inquiry...',
          multiline: true,
          rows: 5,
          validation: {
            required: true,
            minLength: 10,
            maxLength: 1000
          },
          order: 6
        },
        {
          id: 'budget',
          name: 'budget',
          type: 'number',
          label: 'Budget Range',
          placeholder: 'Enter your budget',
          prefix: '$',
          validation: {
            min: 100,
            max: 1000000
          },
          conditional: {
            field: 'inquiryType',
            operator: 'equals',
            value: 'sales'
          },
          order: 7
        }
      ]
    }
  ],
  settings: {
    allowDrafts: true,
    multiStep: false,
    showProgress: false,
    submitButtonText: 'Send Message',
    theme: {
      primaryColor: '#3b82f6',
      fontSize: 'md',
      spacing: 'normal',
      borderRadius: 'md'
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'published',
    category: 'contact'
  }
};

export const userRegistrationSchema: FormSchema = {
  id: 'user-registration',
  title: 'User Registration',
  description: 'Create your account',
  version: '1.0.0',
  sections: [
    {
      id: 'account-details',
      title: 'Account Details',
      fields: [
        {
          id: 'username',
          name: 'username',
          type: 'text',
          label: 'Username',
          placeholder: 'Choose a username',
          validation: {
            required: true,
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9_]+$',
            message: 'Username must contain only letters, numbers, and underscores'
          },
          order: 1
        },
        {
          id: 'email',
          name: 'email',
          type: 'email',
          label: 'Email',
          validation: {
            required: true,
            format: 'email'
          },
          order: 2
        },
        {
          id: 'age',
          name: 'age',
          type: 'number',
          label: 'Age',
          validation: {
            required: true,
            min: 13,
            max: 120,
            integer: true
          },
          order: 3
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          id: 'interests',
          name: 'interests',
          type: 'checkbox',
          label: 'Interests',
          options: [
            { value: 'technology', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
            { value: 'music', label: 'Music' },
            { value: 'travel', label: 'Travel' },
            { value: 'food', label: 'Food' }
          ],
          validation: {
            required: false
          },
          order: 4
        },
        {
          id: 'newsletter',
          name: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to Newsletter',
          validation: {
            required: false
          },
          order: 5
        },
        {
          id: 'communication-preference',
          name: 'communicationPreference',
          type: 'radio',
          label: 'Preferred Communication Method',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
            { value: 'phone', label: 'Phone Call' },
            { value: 'none', label: 'No Communication' }
          ],
          validation: {
            required: true
          },
          order: 6
        }
      ]
    }
  ],
  settings: {
    allowDrafts: true,
    multiStep: true,
    showProgress: true,
    submitButtonText: 'Create Account',
    theme: {
      primaryColor: '#059669',
      fontSize: 'md',
      spacing: 'normal',
      borderRadius: 'lg'
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'published',
    category: 'registration'
  }
};

export const eventRegistrationSchema: FormSchema = {
  id: 'event-registration',
  title: 'Event Registration',
  description: 'Register for our upcoming event',
  version: '1.0.0',
  sections: [
    {
      id: 'attendee-info',
      title: 'Attendee Information',
      fields: [
        {
          id: 'full-name',
          name: 'fullName',
          type: 'text',
          label: 'Full Name',
          validation: {
            required: true,
            minLength: 2
          },
          order: 1
        },
        {
          id: 'company',
          name: 'company',
          type: 'text',
          label: 'Company',
          validation: {
            required: false
          },
          order: 2
        },
        {
          id: 'registration-date',
          name: 'registrationDate',
          type: 'date',
          label: 'Preferred Date',
          validation: {
            required: true,
            minDate: new Date().toISOString().split('T')[0],
            maxDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          order: 3
        }
      ]
    },
    {
      id: 'event-details',
      title: 'Event Preferences',
      fields: [
        {
          id: 'ticket-type',
          name: 'ticketType',
          type: 'select',
          label: 'Ticket Type',
          options: [
            { value: 'standard', label: 'Standard - $50' },
            { value: 'premium', label: 'Premium - $100' },
            { value: 'vip', label: 'VIP - $200' }
          ],
          validation: {
            required: true
          },
          order: 4
        },
        {
          id: 'dietary-restrictions',
          name: 'dietaryRestrictions',
          type: 'textarea',
          label: 'Dietary Restrictions',
          placeholder: 'Please list any dietary restrictions or allergies',
          multiline: true,
          rows: 3,
          validation: {
            required: false,
            maxLength: 500
          },
          order: 5
        }
      ]
    }
  ],
  settings: {
    allowDrafts: true,
    multiStep: false,
    submitButtonText: 'Register Now',
    theme: {
      primaryColor: '#7c3aed',
      fontSize: 'md',
      spacing: 'relaxed',
      borderRadius: 'lg'
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'published',
    category: 'event'
  }
};

export const sampleSchemas = {
  contact: contactFormSchema,
  registration: userRegistrationSchema,
  event: eventRegistrationSchema
};
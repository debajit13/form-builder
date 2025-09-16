import { v4 as uuidv4 } from 'uuid';
import type { FormSubmission } from '../types/schema';
import { storage } from './storage';
import { contactFormSchema, userRegistrationSchema, eventRegistrationSchema } from './sampleSchemas';

// Sample submission data for different forms
const sampleContactSubmissions = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    inquiryType: 'general',
    message: 'Hello, I would like to know more about your services. Can you provide me with more information about pricing and features?',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    inquiryType: 'support',
    message: 'I am having trouble with the login functionality. The system keeps returning an error when I try to authenticate.',
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@company.com',
    phone: '+1-555-456-7890',
    inquiryType: 'sales',
    message: 'We are interested in an enterprise solution for our team of 50 people. What packages do you offer?',
    budget: 15000,
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@startup.io',
    phone: '+1-555-321-9876',
    inquiryType: 'partnership',
    message: 'Our startup is looking for integration partners. Would you be interested in discussing a potential collaboration?',
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@tech.com',
    inquiryType: 'general',
    message: 'Just wanted to say great job on the product! Keep up the excellent work.',
  },
];

const sampleRegistrationSubmissions = [
  {
    username: 'techguru2024',
    email: 'alex.garcia@email.com',
    age: 28,
    interests: ['technology', 'music'],
    newsletter: true,
    communicationPreference: 'email',
  },
  {
    username: 'sportsHero',
    email: 'jamie.lee@example.org',
    age: 32,
    interests: ['sports', 'travel', 'food'],
    newsletter: false,
    communicationPreference: 'sms',
  },
  {
    username: 'creative_mind',
    email: 'taylor.swift@artist.com',
    age: 25,
    interests: ['music', 'travel'],
    newsletter: true,
    communicationPreference: 'email',
  },
  {
    username: 'adventurer',
    email: 'jordan.smith@explorer.net',
    age: 29,
    interests: ['travel', 'sports'],
    newsletter: true,
    communicationPreference: 'phone',
  },
  {
    username: 'foodlover',
    email: 'casey.jones@foodie.com',
    age: 35,
    interests: ['food', 'travel'],
    newsletter: false,
    communicationPreference: 'none',
  },
];

const sampleEventSubmissions = [
  {
    fullName: 'Emma Thompson',
    company: 'Design Studio Inc.',
    registrationDate: '2024-02-15',
    ticketType: 'premium',
    dietaryRestrictions: 'Vegetarian, no nuts',
  },
  {
    fullName: 'Robert Chen',
    company: 'Tech Solutions LLC',
    registrationDate: '2024-02-20',
    ticketType: 'vip',
    dietaryRestrictions: '',
  },
  {
    fullName: 'Lisa Rodriguez',
    company: '',
    registrationDate: '2024-02-18',
    ticketType: 'standard',
    dietaryRestrictions: 'Gluten-free',
  },
  {
    fullName: 'Marcus Johnson',
    company: 'Innovation Labs',
    registrationDate: '2024-02-22',
    ticketType: 'premium',
    dietaryRestrictions: 'Vegan',
  },
  {
    fullName: 'Ana Petrov',
    company: 'Global Corp',
    registrationDate: '2024-02-25',
    ticketType: 'standard',
    dietaryRestrictions: 'No dairy',
  },
];

export function generateSampleSubmissions(): FormSubmission[] {
  const submissions: FormSubmission[] = [];
  const now = new Date();

  // Generate contact form submissions
  sampleContactSubmissions.forEach((data, index) => {
    const submittedAt = new Date(now.getTime() - (index + 1) * 24 * 60 * 60 * 1000); // Different days
    submissions.push({
      id: uuidv4(),
      formId: contactFormSchema.id,
      data,
      metadata: {
        submittedAt: submittedAt.toISOString(),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
      },
      status: Math.random() > 0.1 ? 'complete' : 'draft', // 90% complete
      validationErrors: [],
    });
  });

  // Generate user registration submissions
  sampleRegistrationSubmissions.forEach((data, index) => {
    const submittedAt = new Date(now.getTime() - (index + 3) * 24 * 60 * 60 * 1000);
    submissions.push({
      id: uuidv4(),
      formId: userRegistrationSchema.id,
      data,
      metadata: {
        submittedAt: submittedAt.toISOString(),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        duration: Math.floor(Math.random() * 180) + 90, // 1.5-4.5 minutes
      },
      status: Math.random() > 0.05 ? 'complete' : 'invalid', // 95% complete
      validationErrors: [],
    });
  });

  // Generate event registration submissions
  sampleEventSubmissions.forEach((data, index) => {
    const submittedAt = new Date(now.getTime() - (index + 6) * 24 * 60 * 60 * 1000);
    submissions.push({
      id: uuidv4(),
      formId: eventRegistrationSchema.id,
      data,
      metadata: {
        submittedAt: submittedAt.toISOString(),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        duration: Math.floor(Math.random() * 120) + 45, // 45 seconds - 2.5 minutes
      },
      status: 'complete',
      validationErrors: [],
    });
  });

  // Add some recent submissions (today)
  const todaySubmissions = [
    {
      id: uuidv4(),
      formId: contactFormSchema.id,
      data: {
        firstName: 'Chris',
        lastName: 'Anderson',
        email: 'chris.anderson@newclient.com',
        phone: '+1-555-111-2222',
        inquiryType: 'sales',
        message: 'Interested in your premium package for our growing team.',
        budget: 25000,
      },
      metadata: {
        submittedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        duration: 145,
      },
      status: 'complete' as const,
      validationErrors: [],
    },
    {
      id: uuidv4(),
      formId: userRegistrationSchema.id,
      data: {
        username: 'newuser123',
        email: 'newuser@example.com',
        age: 24,
        interests: ['technology'],
        newsletter: true,
        communicationPreference: 'email',
      },
      metadata: {
        submittedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        duration: 95,
      },
      status: 'complete' as const,
      validationErrors: [],
    },
  ];

  submissions.push(...todaySubmissions);

  return submissions;
}

export function populateSampleData() {
  try {
    // Save sample schemas if they don't exist
    const existingSchemas = storage.getSchemas();
    const schemasToAdd = [contactFormSchema, userRegistrationSchema, eventRegistrationSchema].filter(
      schema => !existingSchemas.find(existing => existing.id === schema.id)
    );

    if (schemasToAdd.length > 0) {
      storage.saveSchemas([...existingSchemas, ...schemasToAdd]);
    }

    // Generate and save sample submissions
    const existingSubmissions = storage.getSubmissions();
    if (existingSubmissions.length === 0) {
      const sampleSubmissions = generateSampleSubmissions();
      storage.saveSubmissions(sampleSubmissions as any);
      console.log(`Generated ${sampleSubmissions.length} sample submissions`);
    }

    return {
      schemas: schemasToAdd.length,
      submissions: existingSubmissions.length === 0 ? generateSampleSubmissions().length : 0
    };
  } catch (error) {
    console.error('Error populating sample data:', error);
    return { schemas: 0, submissions: 0 };
  }
}

export function clearAllData() {
  try {
    storage.clearAll();
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// Auto-populate data on import for development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Only populate in development mode
  setTimeout(() => {
    const result = populateSampleData();
    if (result.schemas > 0 || result.submissions > 0) {
      console.log('Sample data populated:', result);
    }
  }, 1000);
}
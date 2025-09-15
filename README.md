# Dynamic Form Builder

A powerful, type-safe, and highly customizable form builder for React applications. Create complex, multi-step forms with real-time validation, conditional logic, and beautiful UI components using TypeScript and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-06B6D4.svg)](https://tailwindcss.com/)

## ✨ Features

### 🎯 Core Features
- **Type-Safe Schema Definition** - Define forms with full TypeScript support
- **Real-Time Validation** - Instant feedback with debounced validation
- **Multi-Step Forms** - Create wizard-style forms with progress indicators
- **Conditional Logic** - Show/hide fields based on user input
- **Rich Field Types** - Text, number, email, date, select, radio, checkbox, textarea
- **Custom Themes** - Fully customizable styling and branding
- **Responsive Design** - Mobile-first design that works on all devices

### 🚀 Advanced Features
- **Form Builder UI** - Visual form designer with drag-and-drop interface
- **Data Management** - Built-in storage with export/import capabilities
- **Accessibility** - WCAG compliant with screen reader support
- **Performance** - Optimized with React Hook Form and efficient re-renders
- **Extensible** - Plugin architecture for custom field types
- **Testing** - Comprehensive test suite with 95%+ coverage

### 🎨 UI/UX Features
- **Beautiful Components** - Modern, professional design system
- **Loading States** - Smooth loading animations and skeleton screens
- **Error Handling** - Comprehensive error messages and recovery
- **Form Analytics** - Track form completion and user behavior
- **Draft Support** - Auto-save user progress
- **Export Options** - JSON, CSV, and custom export formats

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- React 18+
- TypeScript 4.5+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dynamic-form-builder.git
   cd dynamic-form-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## 📖 Usage

### Basic Form Creation

```typescript
import { DynamicFormGenerator } from './components/DynamicFormGenerator'
import type { FormSchema } from './types/schema'

const schema: FormSchema = {
  id: 'contact-form',
  title: 'Contact Us',
  version: '1.0.0',
  sections: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      fields: [
        {
          id: 'name-field',
          name: 'fullName',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          validation: { required: true, minLength: 2 }
        },
        {
          id: 'email-field',
          name: 'email',
          type: 'email',
          label: 'Email Address',
          validation: { required: true }
        }
      ]
    }
  ],
  settings: {
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1d4ed8'
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user'
  }
}

function ContactForm() {
  const handleSubmit = (data: FormSubmissionData) => {
    console.log('Form submitted:', data)
    // Handle form submission
  }

  return (
    <DynamicFormGenerator
      schema={schema}
      onSubmit={handleSubmit}
      showValidation={true}
      realTimeValidation={true}
    />
  )
}
```

### Advanced Multi-Step Form

```typescript
const multiStepSchema: FormSchema = {
  id: 'registration-form',
  title: 'User Registration',
  version: '1.0.0',
  sections: [
    {
      id: 'step-1',
      title: 'Basic Information',
      fields: [
        {
          id: 'username-field',
          name: 'username',
          type: 'text',
          label: 'Username',
          validation: {
            required: true,
            minLength: 3,
            pattern: '^[a-zA-Z0-9_]+$'
          }
        }
      ]
    },
    {
      id: 'step-2',
      title: 'Contact Details',
      fields: [
        {
          id: 'phone-field',
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
          validation: {
            required: true,
            pattern: '^\\d{3}-\\d{3}-\\d{4}$'
          }
        }
      ]
    }
  ],
  settings: {
    multiStep: true,
    showProgress: true,
    allowDrafts: true
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
}

<DynamicFormGenerator
  schema={multiStepSchema}
  onSubmit={handleSubmit}
  onDraft={handleDraftSave}
  showProgress={true}
  allowDrafts={true}
/>
```

## 🧪 Testing

The project includes comprehensive unit tests with high coverage.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- validation.test.ts
```

### Test Categories

- **Unit Tests**: Individual component and utility function tests
- **Integration Tests**: Form submission and validation workflows
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Performance Tests**: Form rendering and validation performance

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── DynamicFormGenerator.tsx    # Main form component
│   ├── DynamicFormField.tsx        # Individual field component
│   ├── DynamicFormSection.tsx      # Form section wrapper
│   ├── FormBuilder.tsx             # Visual form builder
│   ├── LoadingSpinner.tsx          # Loading components
│   ├── ValidationDisplay.tsx       # Validation feedback
│   └── __tests__/                  # Component tests
├── types/                # TypeScript type definitions
│   └── schema.ts                   # Form schema types
├── utils/                # Utility functions
│   ├── validation.ts               # Validation logic
│   ├── storage.ts                  # Data persistence
│   ├── schemaHelpers.ts           # Schema manipulation
│   └── __tests__/                  # Utility tests
├── hooks/                # Custom React hooks
│   ├── useRealTimeValidation.ts   # Real-time validation
│   └── useFieldValidation.tsx     # Field-level validation
├── examples/             # Usage examples
│   └── ValidatedFormExample.tsx   # Example forms
└── test/                 # Test configuration
    └── setup.ts                   # Test setup
```

## 🎨 Customization

### Theme Customization

```typescript
const customTheme = {
  primaryColor: '#10b981',      // Green primary
  secondaryColor: '#059669',    // Dark green secondary
  fontSize: 'lg',               // Large text
  borderRadius: 'lg',           // Large border radius
  spacing: 'relaxed'            // More spacing
}

<DynamicFormGenerator
  schema={schema}
  theme={customTheme}
/>
```

## 🌐 Accessibility

The form builder is designed with accessibility in mind:

- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user motion preferences
- **Touch Targets**: Minimum 44px touch targets on mobile

## 📚 API Reference

### Core Components

#### DynamicFormGenerator

Main component for rendering forms from schema.

```typescript
interface DynamicFormGeneratorProps {
  schema: FormSchema
  onSubmit?: (data: FormSubmissionData) => void | Promise<void>
  onDraft?: (data: FormSubmissionData) => void
  initialData?: FormSubmissionData
  className?: string
  showProgress?: boolean
  allowDrafts?: boolean
  submitButtonText?: string
  resetButtonText?: string
  showValidation?: boolean
  showValidationRules?: boolean
  realTimeValidation?: boolean
}
```

#### DynamicFormField

Individual field component with validation and theming.

```typescript
interface DynamicFormFieldProps {
  field: FieldSchema
  watchedValues: FormSubmissionData
  theme?: FormTheme
  showValidation?: boolean
  showValidationRules?: boolean
  realTimeValidation?: boolean
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Run the test suite**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Hook Form](https://react-hook-form.com/) - Efficient form handling
- [Zod](https://zod.dev/) - Type-safe validation
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Fast build tool
- [Vitest](https://vitest.dev/) - Fast unit testing
- [Testing Library](https://testing-library.com/) - Simple testing utilities

---

Made with ❤️ by the Dynamic Form Builder team

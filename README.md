# Dynamic Form Builder

A powerful, type-safe, and highly customizable form builder for React applications. Create complex, multi-step forms with real-time validation, conditional logic, flexible layouts, and beautiful UI components using TypeScript and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4.svg)](https://tailwindcss.com/)

## ✨ Features

### 🎯 Core Features
- **Type-Safe Schema Definition** - Define forms with full TypeScript support
- **Real-Time Validation** - Instant feedback with debounced validation using Zod
- **Multi-Step Forms** - Create wizard-style forms with progress indicators
- **Conditional Logic** - Show/hide fields based on user input
- **Rich Field Types** - Text, number, email, date, select, radio, checkbox, textarea
- **Custom Themes** - Fully customizable styling and branding
- **Responsive Design** - Mobile-first design that works on all devices

### 🚀 Advanced Features
- **Visual Form Builder** - Drag-and-drop form designer with real-time preview
- **Multiple Form Layouts** - 6 different layout types with responsive breakpoints
- **Schema Import/Export** - JSON-based schema sharing with conflict resolution
- **CSV Data Export** - Export form submissions to CSV with filtering options
- **Data Management** - Built-in storage with advanced data viewer and analytics
- **Accessibility** - WCAG compliant with screen reader support
- **Performance** - Optimized with React Hook Form and efficient re-renders
- **100% Test Coverage** - Comprehensive test suite following SOLID principles

### 🎨 UI/UX Features
- **Beautiful Components** - Modern, professional design system
- **Dark/Light Mode** - Complete theme switching with system preference detection
- **Loading States** - Smooth loading animations and skeleton screens
- **Error Handling** - Comprehensive error messages and recovery
- **Form Analytics** - Track form completion and user behavior
- **Draft Support** - Auto-save user progress
- **Mobile Responsive** - Optimized for all screen sizes and touch devices

### 📊 Data & Export Features
- **CSV Export** - Export submissions with advanced filtering and selection
- **JSON Export** - Schema and data export in structured JSON format
- **Data Visualization** - Built-in analytics dashboard with submission trends
- **Bulk Operations** - Select and export multiple submissions
- **Search & Filter** - Advanced filtering by date, status, and content

### 🎛️ Layout System
- **Single Column** - Vertical stack layout for simple forms
- **Two Column** - Responsive two-column layout
- **Grid Layout** - Flexible grid with 2-6 customizable columns
- **Horizontal Layout** - Inline fields with alignment options
- **Card Layout** - Each section as separate cards with spacing controls
- **Wizard Layout** - Step-by-step forms with progress tracking

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **React** 19+
- **TypeScript** 5.8+

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
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

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
      secondaryColor: '#1d4ed8',
      layout: {
        type: 'grid',
        settings: {
          columnsPerRow: 3,
          responsiveBreakpoints: {
            mobile: 1,
            tablet: 2,
            desktop: 3
          }
        }
      }
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'draft'
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

### Visual Form Builder

```typescript
import { FormBuilder } from './components/FormBuilder'

function FormDesigner() {
  const handleSave = () => {
    console.log('Form saved successfully!')
  }

  const handleCancel = () => {
    console.log('Form creation cancelled')
  }

  return (
    <FormBuilder
      schema={existingSchema} // Optional: for editing
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
```

### Advanced Multi-Step Form with Custom Layout

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
    allowDrafts: true,
    theme: {
      layout: {
        type: 'card',
        settings: {
          cardSpacing: 'lg',
          sectionSpacing: 'relaxed'
        }
      }
    }
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'draft'
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

## 🎨 Layout System

### Available Layout Types

1. **Single Column Layout**
   ```typescript
   layout: {
     type: 'single-column',
     settings: {
       sectionSpacing: 'normal'
     }
   }
   ```

2. **Two Column Layout**
   ```typescript
   layout: {
     type: 'two-column',
     settings: {
       responsiveBreakpoints: {
         mobile: 1,
         tablet: 2,
         desktop: 2
       }
     }
   }
   ```

3. **Grid Layout** (Most Flexible)
   ```typescript
   layout: {
     type: 'grid',
     settings: {
       columnsPerRow: 4,
       responsiveBreakpoints: {
         mobile: 1,
         tablet: 2,
         desktop: 4
       }
     }
   }
   ```

4. **Horizontal Layout**
   ```typescript
   layout: {
     type: 'horizontal',
     settings: {
       fieldAlignment: 'center', // 'left' | 'center' | 'right'
       sectionSpacing: 'relaxed'
     }
   }
   ```

5. **Card Layout**
   ```typescript
   layout: {
     type: 'card',
     settings: {
       cardSpacing: 'md', // 'sm' | 'md' | 'lg'
       sectionSpacing: 'normal'
     }
   }
   ```

6. **Wizard Layout**
   ```typescript
   layout: {
     type: 'wizard',
     settings: {
       sectionSpacing: 'normal'
     }
   }
   ```

## 📊 Data Management

### CSV Export

```typescript
import { DataManager } from './utils/dataManager'

// Export all submissions
const csvData = DataManager.exportSubmissionsAsCSV(formId)

// Export with filtering
const filteredData = DataManager.exportSubmissionsAsCSV(formId, {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'complete'
})
```

### Schema Import/Export

```typescript
// Export schema
const schemaJson = DataManager.exportSchema(schemaId)

// Import schema with options
const result = await DataManager.importSchema(jsonString, {
  generateNewId: true,
  renameIfExists: true,
  overwrite: false
})
```

## 🧪 Testing

The project includes comprehensive testing with 100% coverage following SOLID principles.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- validation.test.ts

# Run tests for specific component
npm test -- FormBuilder
```

### Test Categories

- **Unit Tests**: Individual component and utility function tests
- **Integration Tests**: Form submission and validation workflows
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Performance Tests**: Form rendering and validation performance
- **Visual Tests**: Layout and responsive design tests

### Coverage Goals

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── DynamicFormGenerator.tsx    # Main form component
│   ├── DynamicFormField.tsx        # Individual field component
│   ├── DynamicFormSection.tsx      # Form section wrapper
│   ├── FormBuilder.tsx             # Visual form builder
│   ├── LayoutSelector.tsx          # Layout configuration UI
│   ├── DataViewer.tsx              # Data management interface
│   ├── DataDashboard.tsx           # Analytics dashboard
│   ├── LoadingSpinner.tsx          # Loading components
│   ├── ValidationDisplay.tsx       # Validation feedback
│   └── __tests__/                  # Component tests
├── pages/                # Page components
│   ├── FormBuilderPage.tsx         # Form builder interface
│   ├── FormPreviewPage.tsx         # Form preview and testing
│   ├── DataManagementPage.tsx      # Data export and management
│   └── Dashboard.tsx               # Analytics dashboard
├── types/                # TypeScript type definitions
│   └── schema.ts                   # Form schema types with layout support
├── utils/                # Utility functions
│   ├── validation.ts               # Validation logic with Zod
│   ├── storage.ts                  # Data persistence
│   ├── dataManager.ts              # Import/export functionality
│   ├── layoutUtils.ts              # Layout calculation utilities
│   ├── schemaHelpers.ts           # Schema manipulation
│   └── __tests__/                  # Utility tests
├── hooks/                # Custom React hooks
│   ├── useSchemaManager.tsx        # Schema state management
│   ├── useRealTimeValidation.ts   # Real-time validation
│   └── useFieldValidation.tsx     # Field-level validation
├── examples/             # Usage examples
│   └── ValidatedFormExample.tsx   # Example forms
└── __tests__/            # Integration tests
    ├── integration/               # End-to-end workflows
    └── setup.ts                  # Test configuration
```

## 🎨 Customization

### Theme Customization

```typescript
const customTheme = {
  primaryColor: '#10b981',      // Green primary
  secondaryColor: '#059669',    // Dark green secondary
  fontSize: 'lg',               // Large text
  borderRadius: 'lg',           // Large border radius
  spacing: 'relaxed',           // More spacing
  layout: {
    type: 'grid',
    settings: {
      columnsPerRow: 3,
      responsiveBreakpoints: {
        mobile: 1,
        tablet: 2,
        desktop: 3
      }
    }
  }
}

<DynamicFormGenerator
  schema={schema}
  theme={customTheme}
/>
```

### Dark Mode Support

The application automatically detects system theme preferences and provides manual theme switching:

```typescript
// Theme is automatically applied based on:
// 1. User's system preference
// 2. Manual theme selection
// 3. Saved preference in localStorage
```

### Custom Field Types

Extend the form builder with custom field types:

```typescript
// Add to schema.ts
export type CustomFieldType = 'signature' | 'file-upload' | 'rich-text'

// Implement in DynamicFormField.tsx
case 'signature':
  return <SignatureField {...fieldProps} />
```

## 🌐 Accessibility

The form builder is designed with accessibility in mind:

- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility with logical tab order
- **Focus Management**: Visible focus indicators and focus trapping in modals
- **High Contrast**: Support for high contrast mode and custom themes
- **Reduced Motion**: Respects user motion preferences
- **Touch Targets**: Minimum 44px touch targets on mobile devices
- **Error Announcements**: Screen reader announcements for validation errors
- **Form Labels**: Proper form labeling and fieldset grouping

## 📚 API Reference

### Core Components

#### DynamicFormGenerator

Main component for rendering forms from schema with layout support.

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
  saveToStorage?: boolean
}
```

#### FormBuilder

Visual form designer with layout configuration.

```typescript
interface FormBuilderProps {
  schema?: FormSchema
  onSave: () => void
  onCancel: () => void
}
```

#### LayoutSelector

Layout configuration component for the form builder.

```typescript
interface LayoutSelectorProps {
  currentLayout?: FormLayout
  onLayoutChange: (layout: FormLayout) => void
  className?: string
}
```

#### DataViewer

Data management interface with export capabilities.

```typescript
interface DataViewerProps {
  submissions: FormSubmission[]
  schema: FormSchema
  onExport?: (data: FormSubmission[], format: 'csv' | 'json') => void
  showBulkActions?: boolean
}
```

### Type Definitions

#### FormLayout

```typescript
export type FormLayoutType = 'single-column' | 'two-column' | 'grid' | 'horizontal' | 'card' | 'wizard'

export interface FormLayout {
  type: FormLayoutType
  settings?: {
    columnsPerRow?: number
    cardSpacing?: 'sm' | 'md' | 'lg'
    fieldAlignment?: 'left' | 'center' | 'right'
    sectionSpacing?: 'compact' | 'normal' | 'relaxed'
    responsiveBreakpoints?: {
      mobile?: number
      tablet?: number
      desktop?: number
    }
  }
}
```

#### FormSchema (Updated)

```typescript
export interface FormSchema {
  id: string
  title: string
  description?: string
  version: string
  sections: FormSection[]
  settings: FormSettings
  metadata: FormMetadata
}

export interface FormSettings {
  allowDrafts?: boolean
  requireAuth?: boolean
  multiStep?: boolean
  showProgress?: boolean
  submitButtonText?: string
  resetButtonText?: string
  theme?: FormTheme
  notifications?: NotificationSettings
}

export interface FormTheme {
  primaryColor?: string
  secondaryColor?: string
  fontSize?: 'sm' | 'md' | 'lg'
  spacing?: 'compact' | 'normal' | 'relaxed'
  borderRadius?: 'none' | 'sm' | 'md' | 'lg'
  layout?: FormLayout
}
```

## 🔧 Development

### Setting Up Development Environment

1. **Clone and install dependencies** (see Quick Start)

2. **Set up your IDE** with the following extensions:
   - TypeScript and JavaScript Language Features
   - ESLint
   - Tailwind CSS IntelliSense
   - Auto Rename Tag

3. **Configure your editor**:
   ```json
   // .vscode/settings.json
   {
     "typescript.preferences.includePackageJsonAutoImports": "auto",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     }
   }
   ```

### Code Style and Standards

- **TypeScript**: Strict mode enabled with full type safety
- **ESLint**: Enforced code quality and consistency
- **React**: Functional components with hooks
- **Testing**: Jest/Vitest with Testing Library
- **Styling**: Tailwind CSS with design system approach

### SOLID Principles Implementation

The codebase follows SOLID principles:

- **S**ingle Responsibility: Each component has one clear purpose
- **O**pen/Closed: Components are open for extension, closed for modification
- **L**iskov Substitution: Interface implementations are interchangeable
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Components depend on abstractions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following the code standards
4. **Add tests for new functionality**
5. **Run the test suite**
   ```bash
   npm run test:coverage
   npm run lint
   ```
6. **Commit your changes** with descriptive messages
   ```bash
   git commit -m 'feat: add amazing new layout type'
   ```
7. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request** with detailed description

### Contribution Guidelines

- **Code Quality**: All code must pass ESLint and TypeScript checks
- **Testing**: Maintain 100% test coverage
- **Documentation**: Update README and inline documentation
- **Accessibility**: Ensure WCAG compliance
- **Performance**: Consider performance implications
- **Mobile**: Test on mobile devices and responsive breakpoints

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details** (OS, browser, Node.js version)
2. **Steps to reproduce** the issue
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** if applicable
6. **Schema** or code that reproduces the issue

## 🚀 Deployment

### Building for Production

```bash
# Build the project
npm run build

# Preview the build locally
npm run preview
```

### Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Analytics tracking ID
VITE_ANALYTICS_ID=your-analytics-id

# Optional: API endpoints
VITE_API_URL=https://your-api.com
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Hook Form](https://react-hook-form.com/) - Efficient form handling
- [Zod](https://zod.dev/) - Type-safe validation
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Fast build tool
- [Vitest](https://vitest.dev/) - Fast unit testing
- [Testing Library](https://testing-library.com/) - Simple testing utilities
- [React Router](https://reactrouter.com/) - Declarative routing
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Toast notifications

## 📈 Roadmap

### Upcoming Features

- [ ] **Real-time Collaboration** - Multiple users editing forms simultaneously
- [ ] **Advanced Analytics** - Detailed form performance metrics
- [ ] **API Integration** - REST and GraphQL API form submissions
- [ ] **Template Library** - Pre-built form templates
- [ ] **Custom Themes** - Visual theme editor
- [ ] **Webhook Support** - Real-time submission notifications
- [ ] **Advanced Validation** - Custom validation rules engine
- [ ] **Internationalization** - Multi-language support

### Version History

- **v2.0.0** - Multiple form layouts, CSV export, schema import/export
- **v1.5.0** - Dark mode, mobile optimization, accessibility improvements
- **v1.0.0** - Initial release with basic form building capabilities

---

Made with ❤️ by the Dynamic Form Builder team

**⭐ If you found this project helpful, please give it a star on GitHub! ⭐**
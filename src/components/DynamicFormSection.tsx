import type { FormSection, FieldSchema, FormTheme, ConditionalRule, FormSubmissionData } from '../types/schema';
import { DynamicFormField } from './DynamicFormField';

interface DynamicFormSectionProps {
  section: FormSection;
  watchedValues: FormSubmissionData;
  theme?: FormTheme;
  showValidation?: boolean;
  showValidationRules?: boolean;
  realTimeValidation?: boolean;
}

export function DynamicFormSection({
  section,
  watchedValues,
  theme,
  showValidation = true,
  showValidationRules = false,
  realTimeValidation = true
}: DynamicFormSectionProps) {
  // Evaluate conditional rules for section visibility
  const shouldShowSection = (conditional?: ConditionalRule): boolean => {
    if (!conditional) return true;

    const fieldValue = watchedValues[conditional.field];

    let result = false;
    switch (conditional.operator) {
      case 'equals':
        result = fieldValue === conditional.value;
        break;
      case 'not_equals':
        result = fieldValue !== conditional.value;
        break;
      case 'greater_than':
        result = Number(fieldValue) > Number(conditional.value);
        break;
      case 'less_than':
        result = Number(fieldValue) < Number(conditional.value);
        break;
      case 'contains':
        result = String(fieldValue || '').includes(String(conditional.value));
        break;
      case 'not_contains':
        result = !String(fieldValue || '').includes(String(conditional.value));
        break;
      default:
        result = true;
    }

    // Handle nested conditions
    if (conditional.rules && conditional.rules.length > 0) {
      const nestedResults = conditional.rules.map(rule => shouldShowSection(rule));

      if (conditional.logic === 'or') {
        result = result || nestedResults.some(r => r);
      } else {
        result = result && nestedResults.every(r => r);
      }
    }

    return result;
  };

  // Check if section should be visible
  if (!shouldShowSection(section.conditional)) {
    return null;
  }

  // Filter and sort visible fields
  const visibleFields = section.fields
    .filter(field => shouldShowField(field, watchedValues))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 sm:space-y-6" aria-labelledby={`section-${section.id}`}>
      {/* Section Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3 sm:pb-4">
        <h2
          id={`section-${section.id}`}
          className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight"
          style={{
            fontSize: theme?.fontSize === 'sm' ? '1rem' : theme?.fontSize === 'lg' ? '1.25rem' : '1.125rem'
          }}
        >
          {section.title}
        </h2>
        {section.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {section.description}
          </p>
        )}
      </div>

      {/* Section Fields */}
      <div
        className={`grid gap-4 sm:gap-6 ${getGridColumns(visibleFields.length, theme)}`}
        style={{
          gap: theme?.spacing === 'compact' ? '0.75rem' : theme?.spacing === 'relaxed' ? '2rem' : '1.5rem'
        }}
      >
        {visibleFields.map((field) => (
          <DynamicFormField
            key={field.id}
            field={field}
            watchedValues={watchedValues}
            theme={theme}
            showValidation={showValidation}
            showValidationRules={showValidationRules}
            realTimeValidation={realTimeValidation}
          />
        ))}
      </div>
    </section>
  );
}

// Helper function to check field visibility
function shouldShowField(field: FieldSchema, watchedValues: FormSubmissionData): boolean {
  if (field.hidden) return false;

  if (!field.conditional) return true;

  const fieldValue = watchedValues[field.conditional.field];

  let result = false;
  switch (field.conditional.operator) {
    case 'equals':
      result = fieldValue === field.conditional.value;
      break;
    case 'not_equals':
      result = fieldValue !== field.conditional.value;
      break;
    case 'greater_than':
      result = Number(fieldValue) > Number(field.conditional.value);
      break;
    case 'less_than':
      result = Number(fieldValue) < Number(field.conditional.value);
      break;
    case 'contains':
      result = String(fieldValue || '').includes(String(field.conditional.value));
      break;
    case 'not_contains':
      result = !String(fieldValue || '').includes(String(field.conditional.value));
      break;
    default:
      result = true;
  }

  // Handle nested conditions
  if (field.conditional.rules && field.conditional.rules.length > 0) {
    const nestedResults = field.conditional.rules.map(rule =>
      shouldShowField({ ...field, conditional: rule }, watchedValues)
    );

    if (field.conditional.logic === 'or') {
      result = result || nestedResults.some(r => r);
    } else {
      result = result && nestedResults.every(r => r);
    }
  }

  return result;
}

// Helper function to determine grid layout
function getGridColumns(fieldCount: number, theme?: FormTheme): string {
  // Consider responsive breakpoints and field density
  if (fieldCount === 1) return 'grid-cols-1';
  if (fieldCount === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (fieldCount === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (fieldCount <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  // For many fields, use responsive grid with better mobile handling
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
}
import { z } from 'zod';
import type {
  FieldSchema,
  FormSchema,
  ValidationError,
  FormSubmissionData,
  StringValidationRule,
  NumberValidationRule,
  DateValidationRule,
  SelectValidationRule,
} from '../types/schema';

export class SchemaValidator {
  static createFieldValidator(field: FieldSchema): z.ZodType<any> {
    let validator: z.ZodType<any>;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'textarea':
        validator = this.createStringValidator(
          field.validation as StringValidationRule,
          field.type
        );
        break;

      case 'number':
        validator = this.createNumberValidator(
          field.validation as NumberValidationRule
        );
        break;

      case 'date':
        validator = this.createDateValidator(
          field.validation as DateValidationRule
        );
        break;

      case 'select':
      case 'radio':
        validator = this.createSelectValidator(
          field as any,
          field.validation as SelectValidationRule
        );
        break;

      case 'checkbox':
        validator = field.options
          ? z.array(z.string()).optional()
          : z.boolean().optional();
        break;

      default:
        validator = z.any();
    }

    // Apply required validation
    if (field.validation?.required) {
      if (field.type === 'checkbox' && !field.options) {
        validator = z.boolean().refine((val) => val === true, {
          message: field.validation?.message || `${field.label} is required`,
        });
      } else {
        validator = validator.refine(
          (val) => {
            if (val === null || val === undefined || val === '') return false;
            if (Array.isArray(val) && val.length === 0) return false;
            return true;
          },
          {
            message: field.validation?.message || `${field.label} is required`,
          }
        );
      }
    } else {
      validator = validator.optional();
    }

    return validator;
  }

  private static createStringValidator(
    validation?: StringValidationRule,
    type?: string
  ): z.ZodString {
    let validator = z.string();

    if (validation?.minLength !== undefined) {
      validator = validator.min(validation.minLength, {
        message:
          validation.message ||
          `Must be at least ${validation.minLength} characters`,
      });
    }

    if (validation?.maxLength !== undefined) {
      validator = validator.max(validation.maxLength, {
        message:
          validation.message ||
          `Must be at most ${validation.maxLength} characters`,
      });
    }

    if (validation?.pattern) {
      validator = validator.regex(new RegExp(validation.pattern), {
        message: validation.message || 'Invalid format',
      });
    }

    if (type === 'email' || validation?.format === 'email') {
      validator = validator.email({
        message: validation.message || 'Invalid email format',
      });
    }

    if (validation?.format === 'url') {
      validator = validator.url({
        message: validation.message || 'Invalid URL format',
      });
    }

    return validator;
  }

  private static createNumberValidator(
    validation?: NumberValidationRule
  ): z.ZodNumber {
    let validator = z.number({
      invalid_type_error: 'Must be a valid number',
    });

    if (validation?.min !== undefined) {
      validator = validator.min(validation.min, {
        message: validation.message || `Must be at least ${validation.min}`,
      });
    }

    if (validation?.max !== undefined) {
      validator = validator.max(validation.max, {
        message: validation.message || `Must be at most ${validation.max}`,
      });
    }

    if (validation?.integer) {
      validator = validator.int({
        message: validation.message || 'Must be a whole number',
      });
    }

    return validator;
  }

  private static createDateValidator(
    validation?: DateValidationRule
  ): z.ZodDate {
    let validator = z.date({
      invalid_type_error: 'Must be a valid date',
    });

    if (validation?.minDate) {
      const minDate = new Date(validation.minDate);
      validator = validator.min(minDate, {
        message:
          validation.message ||
          `Date must be after ${minDate.toLocaleDateString()}`,
      });
    }

    if (validation?.maxDate) {
      const maxDate = new Date(validation.maxDate);
      validator = validator.max(maxDate, {
        message:
          validation.message ||
          `Date must be before ${maxDate.toLocaleDateString()}`,
      });
    }

    return validator;
  }

  private static createSelectValidator(
    field: any,
    validation?: SelectValidationRule
  ): z.ZodType<any> {
    const validValues = field.options.map((opt: any) => opt.value);

    if (field.multiple) {
      let validator = z.array(z.enum(validValues as [string, ...string[]]));

      if (validation?.minItems !== undefined) {
        validator = validator.min(validation.minItems, {
          message:
            validation.message ||
            `Select at least ${validation.minItems} option(s)`,
        });
      }

      if (validation?.maxItems !== undefined) {
        validator = validator.max(validation.maxItems, {
          message:
            validation.message ||
            `Select at most ${validation.maxItems} option(s)`,
        });
      }

      return validator;
    }

    return z.enum(validValues as [string, ...string[]]);
  }

  static validateFormData(
    schema: FormSchema,
    data: FormSubmissionData
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const section of schema.sections) {
      for (const field of section.fields) {
        // Skip validation if field is hidden or disabled
        if (field.hidden || field.disabled) continue;

        // Check conditional rules
        if (
          field.conditional &&
          !this.evaluateCondition(field.conditional, data)
        ) {
          continue;
        }

        try {
          const validator = this.createFieldValidator(field);
          const value = data[field.name];

          // Convert string dates to Date objects for validation
          let processedValue = value;
          if (field.type === 'date' && typeof value === 'string') {
            processedValue = new Date(value);
          }

          // Convert string numbers to actual numbers
          if (field.type === 'number' && typeof value === 'string') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              processedValue = numValue;
            }
          }

          validator.parse(processedValue);
        } catch (error) {
          if (error instanceof z.ZodError) {
            for (const issue of error.issues) {
              errors.push({
                field: field.name,
                message: issue.message,
                type: this.mapZodErrorType(issue.code),
              });
            }
          }
        }
      }
    }

    return errors;
  }

  private static evaluateCondition(
    condition: any,
    data: FormSubmissionData
  ): boolean {
    const fieldValue = data[condition.field];

    let result = false;
    switch (condition.operator) {
      case 'equals':
        result = fieldValue === condition.value;
        break;
      case 'not_equals':
        result = fieldValue !== condition.value;
        break;
      case 'greater_than':
        result = Number(fieldValue) > Number(condition.value);
        break;
      case 'less_than':
        result = Number(fieldValue) < Number(condition.value);
        break;
      case 'contains':
        result = String(fieldValue).includes(String(condition.value));
        break;
      case 'not_contains':
        result = !String(fieldValue).includes(String(condition.value));
        break;
    }

    // Handle nested conditions
    if (condition.rules && condition.rules.length > 0) {
      const nestedResults = condition.rules.map((rule: any) =>
        this.evaluateCondition(rule, data)
      );

      if (condition.logic === 'or') {
        result = result || nestedResults.some((r) => r);
      } else {
        result = result && nestedResults.every((r) => r);
      }
    }

    return result;
  }

  private static mapZodErrorType(
    code: z.ZodIssueCode
  ): ValidationError['type'] {
    switch (code) {
      case z.ZodIssueCode.invalid_type:
        return 'format';
      case z.ZodIssueCode.too_small:
        return 'min';
      case z.ZodIssueCode.too_big:
        return 'max';
      case z.ZodIssueCode.invalid_string:
        return 'pattern';
      default:
        return 'custom';
    }
  }

  static createFormValidator(schema: FormSchema) {
    const shape: Record<string, z.ZodType<any>> = {};

    for (const section of schema.sections) {
      for (const field of section.fields) {
        shape[field.name] = this.createFieldValidator(field);
      }
    }

    return z.object(shape);
  }
}
